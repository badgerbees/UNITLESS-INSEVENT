import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { api, ApiError, friendlyError } from "../services/api";
import { localIsoDate } from "../utils/helpers";
import { useToday } from "./useToday";

// Kontraksi & kick counter disimpan di level aplikasi (bukan per halaman) dan di localStorage,
// jadi tetap berjalan saat pindah halaman atau refresh. Waktu dihitung dari timestamp mulai,
// bukan dari hitungan per detik, sehingga tetap akurat walau tab berada di latar belakang.

export const KICK_TARGET = 10;
export const KICK_MAX_MS = 2 * 60 * 60 * 1000;

type Contraction = { start: number; end: number };
type ContractionPayload = Parameters<typeof api.createContractionSession>[0];
type KickPayload = Parameters<typeof api.createKickSession>[0];
// Sesi selesai yang belum berhasil terkirim; disimpan di localStorage dan dikirim ulang otomatis
type PendingSave =
  | { id: string; kind: "contraction"; payload: ContractionPayload }
  | { id: string; kind: "kick"; payload: KickPayload };
type TrackerState = {
  contr: { activeStart: number | null; list: Contraction[] };
  // targetAt: waktu tendangan ke-10; sesi tetap berjalan setelahnya untuk mencatat tendangan tambahan
  kick: { startAt: number | null; endAt: number | null; targetAt?: number | null; count: number; saved: boolean };
  pending: PendingSave[];
};

const EMPTY: TrackerState = {
  contr: { activeStart: null, list: [] },
  kick: { startAt: null, endAt: null, targetAt: null, count: 0, saved: false },
  pending: [],
};

const RETRY_MS = 30_000;

// 401 (sesi habis), 408/429, 5xx, dan gangguan jaringan layak dicoba lagi; 4xx lain tidak akan pernah berhasil
function isRetryable(error: unknown) {
  if (!(error instanceof ApiError)) return true;
  return error.status === 401 || error.status === 408 || error.status === 429 || error.status >= 500;
}

function send(item: PendingSave) {
  return item.kind === "contraction" ? api.createContractionSession(item.payload) : api.createKickSession(item.payload);
}

function load(key: string | null): TrackerState {
  if (!key) return EMPTY;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...EMPTY, ...JSON.parse(raw) as TrackerState } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function kickPayload(kick: TrackerState["kick"], endAt: number): KickPayload | null {
  if (!kick.startAt || kick.count === 0) return null;
  return { started_at: new Date(kick.startAt).toISOString(), ended_at: new Date(endAt).toISOString(), kick_count: kick.count };
}

export function useTrackers(user: User | null) {
  const key = user ? `trackers:${user.id}` : null;
  // Data disimpan bersama kunci akunnya, supaya data akun lain/kosong tidak pernah tertulis ke kunci yang salah
  const [stored, setStored] = useState(() => ({ key, data: load(key) }));
  if (stored.key !== key) setStored({ key, data: load(key) });
  const state = stored.data;
  const setState = (update: (s: TrackerState) => TrackerState) =>
    setStored(prev => ({ ...prev, data: update(prev.data) }));
  const [now, setNow] = useState(() => Date.now());
  const [saveError, setSaveError] = useState<string | null>(null);
  const flushing = useRef(false);
  const latest = useRef(stored);
  latest.current = stored;

  function enqueue(item: Omit<PendingSave, "id">) {
    const entry = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` } as PendingSave;
    setState(s => ({ ...s, pending: [...s.pending, entry] }));
  }

  // Kirim semua sesi tertunda satu per satu; yang berhasil (atau mustahil berhasil) dikeluarkan dari antrean
  async function flush() {
    if (flushing.current || !latest.current.key) return;
    flushing.current = true;
    const owner = latest.current.key;
    try {
      for (const item of latest.current.data.pending) {
        if (latest.current.key !== owner) break;
        try {
          await send(item);
          setState(s => ({ ...s, pending: s.pending.filter(p => p.id !== item.id) }));
          setSaveError(null);
        } catch (error) {
          console.error("Failed to save session", error);
          setSaveError(friendlyError(error));
          if (isRetryable(error)) break;
          setState(s => ({ ...s, pending: s.pending.filter(p => p.id !== item.id) }));
        }
      }
    } finally {
      flushing.current = false;
    }
  }

  const pendingCount = state.pending.length;
  useEffect(() => {
    if (pendingCount === 0) { setSaveError(null); return; }
    void flush();
    const id = setInterval(() => void flush(), RETRY_MS);
    const onOnline = () => void flush();
    window.addEventListener("online", onOnline);
    return () => { clearInterval(id); window.removeEventListener("online", onOnline); };
  }, [pendingCount, stored.key]);

  useEffect(() => {
    if (!stored.key) return;
    try { localStorage.setItem(stored.key, JSON.stringify(stored.data)); } catch { /* storage tidak tersedia */ }
  }, [stored]);

  // Reset harian: daftar kontraksi hanya berisi kontraksi hari ini, dan sesi kick yang sudah selesai
  // di hari sebelumnya dibersihkan. Riwayat lengkap tetap ada di server (tombol Riwayat).
  const today = useToday();
  useEffect(() => {
    if (!stored.key) return;
    const isToday = (ms: number) => localIsoDate(new Date(ms)) === today;
    setState(s => {
      const list = s.contr.list.filter(c => isToday(c.start));
      const staleKick = s.kick.startAt !== null && s.kick.endAt !== null && !isToday(s.kick.startAt);
      if (list.length === s.contr.list.length && !staleKick) return s;
      return { ...s, contr: { ...s.contr, list }, kick: staleKick ? EMPTY.kick : s.kick };
    });
  }, [today, stored.key, state.kick.endAt]);

  const kickRunning = state.kick.startAt !== null && state.kick.endAt === null;
  const contrRunning = state.contr.activeStart !== null;

  // Detak 1 detik hanya untuk memperbarui tampilan selama ada timer berjalan
  useEffect(() => {
    if (!kickRunning && !contrRunning) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [kickRunning, contrRunning]);

  // Sesi kick otomatis berakhir setelah 2 jam
  useEffect(() => {
    const { startAt, endAt } = state.kick;
    if (!startAt || endAt !== null || now - startAt < KICK_MAX_MS) return;
    const end = startAt + KICK_MAX_MS;
    setState(s => ({ ...s, kick: { ...s.kick, endAt: end, saved: true } }));
    const payload = kickPayload(state.kick, end);
    if (payload) enqueue({ kind: "kick", payload });
  }, [now, state.kick]);

  function toggleContraction() {
    const t = Date.now();
    const { activeStart, list } = state.contr;
    if (activeStart === null) {
      setState(s => ({ ...s, contr: { ...s.contr, activeStart: t } }));
      return;
    }
    const prev = list[list.length - 1];
    // Jarak antarkontraksi diukur dari awal kontraksi sebelumnya ke awal kontraksi ini (sesuai aturan 5-1-1)
    const gapMinutes = prev ? Math.round((activeStart - prev.start) / 60000) : null;
    setState(s => ({ ...s, contr: { activeStart: null, list: [...s.contr.list, { start: activeStart, end: t }] } }));
    enqueue({ kind: "contraction", payload: {
      started_at: new Date(activeStart).toISOString(),
      ended_at: new Date(t).toISOString(),
      duration_seconds: Math.round((t - activeStart) / 1000),
      ...(gapMinutes !== null ? { gap_minutes: gapMinutes } : {}),
    } });
  }

  function resetContractions() {
    setState(s => ({ ...s, contr: EMPTY.contr }));
  }

  function startKick() {
    setState(s => ({ ...s, kick: { startAt: Date.now(), endAt: null, targetAt: null, count: 0, saved: false } }));
  }

  // Sesi tidak berhenti di target: tendangan tambahan tetap dicatat sampai user menekan Hentikan
  // atau batas 2 jam habis. Sesi dikirim ke server saat berakhir, dengan jumlah total tendangan.
  function addKick() {
    if (state.kick.startAt === null || state.kick.endAt !== null) return;
    const t = Date.now();
    setState(s => {
      const count = s.kick.count + 1;
      const targetAt = s.kick.targetAt ?? (count === KICK_TARGET ? t : null);
      return { ...s, kick: { ...s.kick, count, targetAt } };
    });
  }

  // Hentikan sesi sebelum target: sesi diakhiri & tetap dikirim ke riwayat sebagai sesi tidak lengkap
  function stopKick() {
    if (state.kick.startAt === null || state.kick.endAt !== null) return;
    const t = Date.now();
    setState(s => ({ ...s, kick: { ...s.kick, endAt: t, saved: true } }));
    const payload = kickPayload(state.kick, t);
    if (payload) enqueue({ kind: "kick", payload });
  }

  function resetKick() {
    // Sesi yang belum tersimpan (dihentikan sebelum target) tetap dicatat sebagai sesi tidak lengkap
    const payload = state.kick.saved ? null : kickPayload(state.kick, state.kick.endAt ?? Date.now());
    if (payload) enqueue({ kind: "kick", payload });
    setState(s => ({ ...s, kick: EMPTY.kick }));
  }

  const { contr, kick } = state;
  const contractions = contr.list.map((c, i) => ({
    dur: Math.round((c.end - c.start) / 1000),
    gap: i > 0 ? Math.round((c.start - contr.list[i - 1].start) / 60000) : 0,
  }));
  const kickElapsedMs = kick.startAt ? (kick.endAt ?? now) - kick.startAt : 0;

  return {
    // Jumlah sesi yang belum tersimpan di server & alasan gagal terakhir, untuk ditampilkan ke user
    sync: { pendingCount, error: saveError, retry: () => void flush() },
    contraction: {
      active: contrRunning,
      elapsedSecs: contr.activeStart ? Math.max(0, Math.floor((now - contr.activeStart) / 1000)) : 0,
      contractions,
      toggle: toggleContraction,
      reset: resetContractions,
    },
    kick: {
      active: kickRunning,
      started: kick.startAt !== null,
      count: kick.count,
      elapsedSecs: Math.floor(Math.min(kickElapsedMs, KICK_MAX_MS) / 1000),
      // Lama waktu sampai tendangan ke-10 (null bila belum tercapai)
      targetSecs: kick.startAt !== null && kick.targetAt ? Math.floor((kick.targetAt - kick.startAt) / 1000) : null,
      // Habis waktu = berakhir karena batas 2 jam (bukan dihentikan manual) sebelum mencapai target
      timedOut: kick.startAt !== null && kick.endAt !== null && kick.count < KICK_TARGET && kick.endAt - kick.startAt >= KICK_MAX_MS,
      stoppedEarly: kick.startAt !== null && kick.endAt !== null && kick.count < KICK_TARGET && kick.endAt - kick.startAt < KICK_MAX_MS,
      // Sesi sudah berakhir (target tercapai atau waktu habis) → boleh mulai sesi baru
      finished: kick.startAt !== null && kick.endAt !== null,
      start: startKick,
      add: addKick,
      stop: stopKick,
      reset: resetKick,
    },
  };
}

export type Trackers = ReturnType<typeof useTrackers>;
