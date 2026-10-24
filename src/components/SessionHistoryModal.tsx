import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Timer, Footprints } from "lucide-react";
import { Theme } from "../types";
import { api, type ContractionSession, type KickSession } from "../services/api";

export type HistoryTab = "contraction" | "kick";

const KICK_TARGET = 10;

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hari ini";
  if (d.toDateString() === yesterday.toDateString()) return "Kemarin";
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function duration(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return m > 0 ? `${h} jam ${m} mnt` : `${h} jam`;
  return m > 0 ? `${m} mnt ${s} dtk` : `${s} dtk`;
}

// Kelompokkan per hari, urutan terbaru dulu (data dari server sudah terurut started_at desc)
function groupByDay<T extends { started_at: string }>(rows: T[]) {
  const groups: { key: string; label: string; rows: T[] }[] = [];
  for (const row of rows) {
    const key = dayKey(row.started_at);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.rows.push(row);
    else groups.push({ key, label: dayLabel(row.started_at), rows: [row] });
  }
  return groups;
}

export function SessionHistoryModal({ isOpen, initialTab, onClose, t }: {
  isOpen: boolean; initialTab: HistoryTab; onClose: () => void; t: Theme;
}) {
  const [tab, setTab] = useState<HistoryTab>(initialTab);
  const [state, setState] = useState<{
    loading: boolean; error: string | null; contractions: ContractionSession[]; kicks: KickSession[];
  }>({ loading: true, error: null, contractions: [], kicks: [] });

  useEffect(() => { if (isOpen) setTab(initialTab); }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setState(s => ({ ...s, loading: true, error: null }));
    Promise.all([api.getContractionSessions(), api.getKickSessions()])
      .then(([contractions, kicks]) => { if (active) setState({ loading: false, error: null, contractions, kicks }); })
      .catch(error => {
        console.error("Failed to load session history", error);
        if (active) setState(s => ({ ...s, loading: false, error: "Riwayat gagal dimuat. Coba lagi nanti." }));
      });
    return () => { active = false; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const contractionGroups = groupByDay(state.contractions);
  const kickGroups = groupByDay(state.kicks);
  const empty = tab === "contraction" ? state.contractions.length === 0 : state.kicks.length === 0;

  // Portal ke body: halaman dibungkus elemen ber-transform (animasi masuk) yang akan mengurung posisi fixed
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        style={{ background: "#ffffff", border: `1px solid ${t.border}`, maxHeight: "85vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${t.border}` }}>
          <div>
            <p className="text-lg font-extrabold" style={{ color: t.dark }}>Riwayat Pemantauan</p>
            <p className="text-xs" style={{ color: t.muted }}>Semua sesi yang tersimpan, dari yang terbaru</p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="ui-interactive w-9 h-9 rounded-full flex items-center justify-center" style={{ background: t.soft }}>
            <X size={16} color={t.active} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex rounded-full p-1 gap-1" style={{ background: "#f2f2f2" }}>
            {([["contraction", "Kontraksi", Timer, state.contractions.length], ["kick", "Kick Counter", Footprints, state.kicks.length]] as const).map(([id, label, Icon, count]) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex-1 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                style={{ background: tab === id ? t.active : "transparent", color: tab === id ? "#fff" : t.muted }}>
                <Icon size={13} /> {label}{!state.loading && ` (${count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Isi */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5" style={{ scrollbarWidth: "thin" }}>
          {state.loading ? (
            <p className="text-sm text-center py-10" style={{ color: t.muted }}>Memuat riwayat…</p>
          ) : state.error ? (
            <p className="text-sm text-center py-10 text-red-500">{state.error}</p>
          ) : empty ? (
            <p className="text-sm text-center py-10" style={{ color: t.muted }}>
              {tab === "contraction" ? "Belum ada kontraksi yang tercatat." : "Belum ada sesi kick counter yang tercatat."}
            </p>
          ) : tab === "contraction" ? (
            contractionGroups.map(group => (
              <div key={group.key}>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: t.dark }}>{group.label}</p>
                  <p className="text-[11px]" style={{ color: t.muted }}>{group.rows.length} kontraksi</p>
                </div>
                <div className="space-y-1.5">
                  {group.rows.map(row => (
                    <div key={row.id} className="grid grid-cols-3 gap-4 text-xs rounded-xl px-4 py-2.5" style={{ background: t.soft }}>
                      <span className="font-bold" style={{ color: t.dark }}>{clock(row.started_at)}</span>
                      <span style={{ color: t.dark }}>Durasi: {duration(row.duration_seconds)}</span>
                      <span style={{ color: t.muted }}>{row.gap_minutes != null ? `Jarak: ${row.gap_minutes} mnt` : "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            kickGroups.map(group => (
              <div key={group.key}>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: t.dark }}>{group.label}</p>
                  <p className="text-[11px]" style={{ color: t.muted }}>{group.rows.length} sesi</p>
                </div>
                <div className="space-y-1.5">
                  {group.rows.map(row => {
                    const reached = row.kick_count >= KICK_TARGET;
                    const secs = row.ended_at ? Math.round((new Date(row.ended_at).getTime() - new Date(row.started_at).getTime()) / 1000) : null;
                    return (
                      <div key={row.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 text-xs rounded-xl px-4 py-2.5"
                        style={{ background: reached ? "#f0fdf4" : "#fef2f2" }}>
                        <span className="font-bold" style={{ color: t.dark }}>{clock(row.started_at)}</span>
                        <span style={{ color: t.dark }}>
                          {row.kick_count} gerakan{secs != null ? ` dalam ${duration(secs)}` : ""}
                        </span>
                        <span className="font-bold" style={{ color: reached ? "#16a34a" : "#dc2626" }}>
                          {reached ? "Target tercapai" : "Di bawah target"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
