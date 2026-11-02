import { useRef, useState } from "react";
import { AlertTriangle, Baby, Bell, Calendar, Check, CheckCheck, Droplets, Footprints, Headphones, LogOut, Search, Settings, Timer } from "lucide-react";
import type { Theme, Mode, Screen, UserProfile } from "../types";
import type { AppNotification } from "../services/api";
import { useTrackers, KICK_TARGET } from "../hooks/useTrackers";
import { APP_NAME } from "../constants/brand";
import { SEARCH_FEATURES } from "./appNavigation";
import { fmtDate } from "../utils/helpers";

const NOTIF_META: Record<AppNotification["kind"], { Icon: typeof Bell; color: string; bg: string }> = {
  emergency: { Icon: AlertTriangle, color: "#ef4444", bg: "#fee2e2" },
  emergency_ack: { Icon: CheckCheck, color: "#16a34a", bg: "#dcfce7" },
  emergency_resolved: { Icon: Check, color: "#16a34a", bg: "#dcfce7" },
  vitamin: { Icon: Droplets, color: "#f59e0b", bg: "#fef3c7" },
  anc: { Icon: Calendar, color: "#6366f1", bg: "#e0e7ff" },
  weekly_report: { Icon: Baby, color: "#ec4899", bg: "#fce7f3" },
  info: { Icon: Bell, color: "#6b7280", bg: "#f3f4f6" },
};

function fmtDuration(totalSecs: number) {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = String(totalSecs % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

type AppHeaderProps = {
  t: Theme;
  mode: Mode;
  screen: string;
  screenLabel: Record<Screen, string>;
  today: Date;
  weeksPreg: number;
  daysExtra: number;
  isPostpartum: boolean;
  babyAgeLabel: string;
  trackers: ReturnType<typeof useTrackers>;
  userProfile: UserProfile;
  notifications: AppNotification[];
  unreadCount: number;
  notifPermission: NotificationPermission | "unsupported";
  requestPermission: () => void | Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  onNavigate: (path: string) => void;
  onOpenSettings: () => void;
  onOpenCustomerService: () => void;
  onSignOut: () => void;
};

export function AppHeader({
  t, mode, screen, screenLabel, today, weeksPreg, daysExtra, isPostpartum, babyAgeLabel, trackers,
  userProfile, notifications, unreadCount, notifPermission, requestPermission,
  markRead, markAllRead, onNavigate, onOpenSettings, onOpenCustomerService, onSignOut,
}: AppHeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const q = searchQuery.trim().toLowerCase();
  const filteredFeatures = SEARCH_FEATURES.filter(item => !q || `${item.label} ${item.desc} ${item.keywords}`.toLowerCase().includes(q));
  const hasEmergencyNotification = notifications.some(item => item.kind === "emergency" && !item.read_at);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 flex-shrink-0 transition-colors duration-300" style={{ background: t.bg + "e8", backdropFilter: "blur(12px)", borderBottom: `1px solid ${t.border}` }}>
      <div>
        <h1 className="text-xl font-extrabold leading-none" style={{ color: t.dark }}>{screen === "dashboard" ? APP_NAME : screenLabel[screen as Screen]}</h1>
        <p className="text-xs mt-0.5" style={{ color: t.muted }}>
          {fmtDate(today)}{screen !== "dashboard" && (isPostpartum ? ` · Bayi usia ${babyAgeLabel}` : ` · Kehamilan minggu ${weeksPreg}+${daysExtra}`)}
        </p>
      </div>

      <div className="flex items-center gap-3 relative">
        {trackers.contraction.active && (
          <button onClick={() => onNavigate("/health")} title="Kontraksi sedang dicatat — buka halaman Kesehatan" className="ui-interactive flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /><Timer size={13} /> Kontraksi {fmtDuration(trackers.contraction.elapsedSecs)}
          </button>
        )}
        {trackers.kick.active && (
          <button onClick={() => onNavigate("/health")} title="Sesi kick counter berjalan — buka halaman Kesehatan" className="ui-interactive flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: t.soft, color: t.active, border: `1.5px solid ${t.border}` }}>
            <Footprints size={13} /> Kick {trackers.kick.count}/{KICK_TARGET} · {fmtDuration(trackers.kick.elapsedSecs)}
          </button>
        )}

        <div className="relative">
          <div onClick={() => { setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 100); }} className="flex items-center gap-2 rounded-full px-4 py-2 cursor-text transition-all" style={{ background: showSearch ? "#ffffff" : t.card, border: `1.5px solid ${showSearch ? t.active : t.border}`, minWidth: showSearch ? 220 : 180, boxShadow: showSearch ? `0 0 0 4px ${t.shadow}` : "none" }}>
            <Search size={14} color={showSearch ? t.active : t.muted} />
            {showSearch ? <input ref={searchInputRef} className="w-full text-sm outline-none bg-transparent" style={{ color: t.dark }} placeholder="Cari fitur (mis. Laporan)..." value={searchQuery} onChange={event => setSearchQuery(event.target.value)} onBlur={() => setTimeout(() => setShowSearch(false), 200)} /> : <span className="text-sm" style={{ color: t.muted }}>Cari fitur…</span>}
          </div>
          {showSearch && (
            <div className="absolute top-full mt-2 right-0 w-72 rounded-2xl overflow-hidden z-50 shadow-xl" style={{ background: "#fff", border: `1px solid ${t.border}` }}>
              {!q && <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>Fitur yang tersedia</p>}
              {filteredFeatures.length > 0 ? filteredFeatures.map(item => (
                <button key={item.id} onMouseDown={() => { onNavigate("/" + item.id); setSearchQuery(""); setShowSearch(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: t.soft }}><item.Icon size={14} color={t.active} /></div>
                  <div className="min-w-0"><p className="text-sm font-semibold leading-tight" style={{ color: t.dark }}>{item.label}</p><p className="text-[11px] truncate" style={{ color: t.muted }}>{item.desc}</p></div>
                </button>
              )) : <div className="px-4 py-3 text-sm text-center" style={{ color: t.muted }}>Fitur tidak ditemukan</div>}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} onBlur={() => setTimeout(() => setShowNotif(false), 200)} className="ui-interactive w-9 h-9 rounded-full flex items-center justify-center focus:outline-none shadow-sm" style={{ background: showNotif ? t.soft : t.card, border: `1.5px solid ${t.border}`, boxShadow: showNotif ? `0 0 0 3px ${t.shadow}` : "none" }}>
            <Bell size={16} color={showNotif ? t.active : t.muted} />
            {unreadCount > 0 && <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white ${hasEmergencyNotification ? "bg-red-500 animate-pulse" : ""}`} style={hasEmergencyNotification ? undefined : { background: t.active }}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>
          {showNotif && (
            <div className="absolute top-full mt-3 right-0 w-80 rounded-2xl shadow-xl z-50 overflow-hidden" style={{ background: "#fff", border: `1px solid ${t.border}` }}>
              <div className="flex items-center justify-between px-4 pt-4 pb-2"><p className="text-xs font-bold uppercase tracking-wide" style={{ color: t.dark }}>Notifikasi</p>{unreadCount > 0 && <button onMouseDown={markAllRead} className="text-[11px] font-bold" style={{ color: t.active }}>Tandai semua dibaca</button>}</div>
              {notifPermission === "default" && <button onMouseDown={() => void requestPermission()} className="mx-4 mb-2 w-[calc(100%-2rem)] rounded-xl px-3 py-2 text-left text-[11px] font-semibold flex items-center gap-2" style={{ background: t.soft, color: t.active }}><Bell size={12} /> Aktifkan notifikasi browser agar tidak ketinggalan pengingat</button>}
              {notifications.length > 0 ? <div className="max-h-80 overflow-y-auto pb-2">{notifications.map(item => { const meta = NOTIF_META[item.kind]; return <button key={item.id} onMouseDown={() => { markRead(item.id); if (item.link) onNavigate(item.link); setShowNotif(false); }} className="w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-gray-50 transition-colors" style={{ background: item.read_at ? undefined : item.kind === "emergency" ? "#fef2f2" : t.soft }}><div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}><meta.Icon size={14} color={meta.color} /></div><div className="flex-1 min-w-0"><p className="text-xs font-bold leading-snug" style={{ color: item.kind === "emergency" ? "#b91c1c" : t.dark }}>{item.title}</p>{item.body && <p className="text-[11px] leading-snug mt-0.5" style={{ color: t.muted }}>{item.body}</p>}<p className="text-[10px] mt-1" style={{ color: t.muted }}>{timeAgo(item.created_at)}</p></div>{!item.read_at && <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.kind === "emergency" ? "#ef4444" : t.active }} />}</button>; })}</div> : <div className="text-center py-6"><Bell size={24} color={t.muted} className="mx-auto mb-2 opacity-50" /><p className="text-xs" style={{ color: t.muted }}>Belum ada notifikasi.</p></div>}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setShowProfile(!showProfile)} onBlur={() => setTimeout(() => setShowProfile(false), 200)} className="ui-interactive w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm focus:outline-none" style={{ background: t.grad, boxShadow: showProfile ? `0 0 0 3px ${t.shadow}` : "none" }}>
            {mode === "mother" ? (userProfile.motherName[0] || "S") : (userProfile.fatherName[0] || "A")}
          </button>
          {showProfile && <div className="absolute top-full mt-3 right-0 w-64 rounded-2xl p-4 shadow-xl z-50 animate-fade-in" style={{ background: "#fff", border: `1px solid ${t.border}` }}>
            <div className="flex items-center gap-3 mb-3 pb-3 border-b" style={{ borderColor: t.border }}><div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: t.grad }}>{mode === "mother" ? (userProfile.motherName[0] || "S") : (userProfile.fatherName[0] || "A")}</div><div className="min-w-0"><p className="text-[13px] font-bold truncate" style={{ color: t.dark }}>{mode === "mother" ? userProfile.motherName : userProfile.fatherName}</p><p className="text-[11px] truncate" style={{ color: t.muted }}>{userProfile.email}</p></div></div>
            <div className="space-y-1"><button onMouseDown={event => { event.preventDefault(); onOpenSettings(); setShowProfile(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors text-left" style={{ color: t.dark }}><Settings size={15} color={t.muted} /> Pengaturan Akun</button><button onMouseDown={event => { event.preventDefault(); onOpenCustomerService(); setShowProfile(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors text-left" style={{ color: t.dark }}><Headphones size={15} color={t.muted} /> Customer Service</button><button onMouseDown={event => { event.preventDefault(); onSignOut(); }} className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold mt-1 transition-colors flex items-center gap-2.5" style={{ color: "#ef4444", background: "#fef2f2" }}><LogOut size={15} /> Keluar</button></div>
          </div>}
        </div>
      </div>
    </header>
  );
}
