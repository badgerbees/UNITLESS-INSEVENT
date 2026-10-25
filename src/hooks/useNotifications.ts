import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { api, type AppNotification } from "../services/api";
import { getSupabaseClient } from "../lib/supabase";

// Polling juga memicu backend membuat pengingat terjadwal (vitamin, ANC, mingguan)
const POLL_MS = 60_000;

function browserPermission(): NotificationPermission | "unsupported" {
  return typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported";
}

// Sirine pendek lewat Web Audio, tanpa file suara tambahan
function playSiren() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    gain.gain.value = 0.15;
    for (let i = 0; i < 6; i++) {
      osc.frequency.setValueAtTime(i % 2 ? 660 : 990, ctx.currentTime + i * 0.4);
    }
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2.4);
    osc.onended = () => void ctx.close();
  } catch { /* audio tidak tersedia / diblokir browser */ }
}

export function useNotifications(user: User | null, options: { sound: boolean; onOpen: (link: string) => void }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState(browserPermission);
  const seen = useRef<Set<string> | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const announce = useCallback((item: AppNotification) => {
    const { sound, onOpen } = optionsRef.current;
    if (item.kind === "emergency" && sound) playSiren();
    if (browserPermission() !== "granted") return;
    try {
      const popup = new Notification(item.title, { body: item.body ?? undefined, tag: item.id, requireInteraction: item.kind === "emergency" });
      popup.onclick = () => {
        window.focus();
        if (item.link) onOpen(item.link);
        popup.close();
      };
    } catch { /* beberapa browser mobile hanya mengizinkan notifikasi lewat service worker */ }
  }, []);

  const merge = useCallback((incoming: AppNotification[]) => {
    // Load pertama hanya mengisi daftar; notifikasi yang benar-benar baru setelahnya yang diumumkan
    if (seen.current) {
      incoming.filter(item => !seen.current!.has(item.id) && !item.read_at).forEach(announce);
    }
    seen.current = new Set([...(seen.current ?? []), ...incoming.map(item => item.id)]);
    setNotifications(previous => {
      const byId = new Map(previous.map(item => [item.id, item]));
      incoming.forEach(item => byId.set(item.id, item));
      return [...byId.values()].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 30);
    });
  }, [announce]);

  useEffect(() => {
    if (!user) { setNotifications([]); seen.current = null; return; }
    let active = true;
    const load = () => api.getNotifications()
      .then(items => { if (active) merge(items); })
      .catch(error => console.error("Failed to load notifications", error));

    void load();
    const timer = setInterval(load, POLL_MS);
    const channel = getSupabaseClient()
      .channel(`notifications:${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        payload => merge([payload.new as AppNotification]))
      .subscribe();

    return () => {
      active = false;
      clearInterval(timer);
      void getSupabaseClient().removeChannel(channel);
    };
  }, [user?.id, merge]);

  async function requestPermission() {
    if (browserPermission() === "unsupported") return;
    setPermission(await Notification.requestPermission());
  }

  function markRead(id: string) {
    setNotifications(previous => previous.map(item => item.id === id ? { ...item, read_at: item.read_at ?? new Date().toISOString() } : item));
    void api.markNotificationRead(id).catch(error => console.error("Failed to mark notification read", error));
  }

  function markAllRead() {
    const now = new Date().toISOString();
    setNotifications(previous => previous.map(item => ({ ...item, read_at: item.read_at ?? now })));
    void api.markAllNotificationsRead().catch(error => console.error("Failed to mark notifications read", error));
  }

  return {
    notifications,
    unreadCount: notifications.filter(item => !item.read_at).length,
    permission,
    requestPermission,
    markRead,
    markAllRead,
  };
}
