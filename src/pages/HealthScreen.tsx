import React, { useState, useEffect } from "react";
import { Theme, VitalLog, EmergencyAlert, Risk, Mode, Vitamin, CustomSymptom } from "../types";
import { Card } from "../components/Card";
import { PillBtn } from "../components/PillBtn";
import { SectionTitle } from "../components/SectionTitle";
import { StatTile } from "../components/StatTile";
import { fmtDate, addDays } from "../utils/helpers";
import { KICK_MAX_MS, type Trackers } from "../hooks/useTrackers";
import { SessionHistoryModal, type HistoryTab } from "../components/SessionHistoryModal";
import { VitalEntryForm } from "../components/VitalEntryForm";
import { VitalDangerAlert } from "../components/VitalDangerAlert";
import {
  Home, Activity, Calendar, FileText, Package, Bell,
  Plus, Minus, Check, X, AlertTriangle, Download, Baby,
  PhoneCall, ArrowRight, RefreshCw, ChevronLeft, Search, Heart,
  MapPin, Navigation, Send, CheckCheck, Clock, Zap, Printer, Mail, Lock, LogOut, Settings, History, Users, Scissors, Droplets, Brain, HeartPulse, Eye, Bone, Wind, Activity as ActivityIcon,
  User, Smartphone, Copy, Headphones, MessageCircle, HelpCircle, Pencil, Trash2, RotateCcw
} from "lucide-react";


export const DEFAULT_VITAMINS: Vitamin[] = [
  { id: "folat",   label: "Asam Folat", dose: "400 mcg", color: "#e899a6" },
  { id: "besi",    label: "Zat Besi",   dose: "60 mg",   color: "#ef4444" },
  { id: "kalsium", label: "Kalsium",    dose: "500 mg",  color: "#a0a0a0" },
  { id: "vitD",    label: "Vitamin D",  dose: "400 IU",  color: "#f59e0b" },
];
const VITAMIN_COLORS = ["#e899a6", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#a0a0a0"];

export function VitaminTracker({ t, done, setDone, onToggleVitamin, vitamins, setVitamins, onSaveVitamins, className = "" }: {
  t: Theme; done: Record<string, boolean>; setDone: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onToggleVitamin: (id: string, completed: boolean) => void;
  vitamins: Vitamin[]; setVitamins: React.Dispatch<React.SetStateAction<Vitamin[]>>;
  onSaveVitamins: (vitamins: Vitamin[]) => void; className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState<Vitamin[]>([]);

  const doneCount = vitamins.filter(v => done[v.id]).length;
  const pct = vitamins.length ? Math.round((doneCount / vitamins.length) * 100) : 0;
  const allDone = vitamins.length > 0 && pct === 100;

  function startEdit() { setDraft(vitamins.map(v => ({ ...v }))); setEditing(true); }
  function updateDraft(id: string, patch: Partial<Vitamin>) { setDraft(d => d.map(v => v.id === id ? { ...v, ...patch } : v)); }
  function cycleColor(v: Vitamin) {
    const next = VITAMIN_COLORS[(VITAMIN_COLORS.indexOf(v.color) + 1) % VITAMIN_COLORS.length];
    updateDraft(v.id, { color: next });
  }
  function addDraft() {
    setDraft(d => [...d, { id: `vit-${Date.now()}`, label: "", dose: "", color: VITAMIN_COLORS[d.length % VITAMIN_COLORS.length] }]);
  }
  function saveEdit() {
    const cleaned = draft.map(v => ({ ...v, label: v.label.trim(), dose: v.dose.trim() })).filter(v => v.label);
    const keep = new Set(cleaned.map(v => v.id));
    onSaveVitamins(cleaned);
    setDone(p => Object.fromEntries(Object.entries(p).filter(([id]) => keep.has(id))));
    setEditing(false);
  }

  const inputStyle = { background: "#fff", border: `1.5px solid ${t.border}`, color: t.dark };

  return (
    <Card t={t} className={`p-5 flex flex-col ${className}`}>
      <div className="flex items-start justify-between mb-1">
        <SectionTitle>Vitamin Hari Ini</SectionTitle>
        <div className="flex items-center gap-3">
          {!editing && <span className="text-xs font-bold" style={{ color: allDone ? "#22c55e" : t.active }}>{pct}%</span>}
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="ui-interactive text-xs font-bold px-3 py-1.5 rounded-full" style={{ color: t.muted }}>
                Batal
              </button>
              <button onClick={saveEdit} className="ui-interactive flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background: t.active }}>
                <Check size={13} /> Simpan
              </button>
            </>
          ) : (
            <button onClick={startEdit} className="ui-interactive flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: t.soft, color: t.active }}>
              <Pencil size={12} /> Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2 flex-1">
          {draft.map(v => (
            <div key={v.id} className="flex items-center gap-2 rounded-xl p-2" style={{ background: t.soft }}>
              <button onClick={() => cycleColor(v)} title="Klik untuk ganti warna"
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: v.color }}>
                {(v.label.trim() || "?")[0].toUpperCase()}
              </button>
              <input value={v.label} onChange={e => updateDraft(v.id, { label: e.target.value })} placeholder="Nama vitamin" maxLength={30}
                className="flex-1 min-w-0 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none" style={inputStyle} />
              <input value={v.dose} onChange={e => updateDraft(v.id, { dose: e.target.value })} placeholder="Dosis" maxLength={15}
                className="w-24 rounded-lg px-3 py-1.5 text-xs outline-none" style={inputStyle} />
              <button onClick={() => setDraft(d => d.filter(x => x.id !== v.id))} title="Hapus"
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-white" style={{ color: t.muted }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button onClick={addDraft} className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold"
            style={{ border: `1.5px dashed ${t.primary}`, color: t.active }}>
            <Plus size={14} /> Tambah vitamin
          </button>
          {/* Hanya mengganti draf; baru tersimpan saat Simpan, dan bisa dibatalkan dengan Batal */}
          <button onClick={() => setDraft(DEFAULT_VITAMINS.map(v => ({ ...v })))}
            className="self-start flex items-center gap-1.5 mt-1 text-[11px] font-semibold transition-colors hover:opacity-80" style={{ color: t.muted }}>
            <RotateCcw size={12} /> Kembalikan ke default
          </button>
        </div>
      ) : (
        <>
          <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: t.soft }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: allDone ? "#22c55e" : t.active }} />
          </div>
          {vitamins.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <p className="text-xs" style={{ color: t.muted }}>Belum ada vitamin.</p>
              <button onClick={startEdit} className="mt-2 text-xs font-bold" style={{ color: t.active }}>+ Tambah vitamin</button>
            </div>
          ) : (
            // Daftar satu kolom: tiap vitamin satu baris dengan tinggi tetap, berapa pun jumlahnya
            <div className="flex flex-col gap-2">
              {vitamins.map(v => (
                <button key={v.id} onClick={() => onToggleVitamin(v.id, !done[v.id])}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left w-full transition-colors duration-150 motion-reduce:transition-none"
                  style={{ background: done[v.id] ? "#f0fdf4" : t.soft, border: `1.5px solid ${done[v.id] ? "#22c55e40" : "transparent"}` }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-150 motion-reduce:transition-none"
                    style={{ background: done[v.id] ? "#22c55e" : v.color }}>
                    {done[v.id]
                      ? <Check size={16} className="text-white" />
                      : <span className="text-xs font-bold text-white">{v.label[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: done[v.id] ? "#166534" : t.dark }}>{v.label}</p>
                    {v.dose && <p className="text-[11px]" style={{ color: t.muted }}>{v.dose}</p>}
                  </div>
                  <span className="text-[11px] font-bold flex-shrink-0 transition-colors duration-150 motion-reduce:transition-none"
                    style={{ color: done[v.id] ? "#16a34a" : t.muted }}>
                    {done[v.id] ? "Sudah diminum" : "Belum"}
                  </span>
                </button>
              ))}
            </div>
          )}
          {allDone ? (
            <div className="mt-3 rounded-xl py-2.5 text-center" style={{ background: "#f0fdf4" }}>
              <p className="text-sm text-green-600 font-bold">Semua vitamin sudah diminum hari ini</p>
            </div>
          ) : vitamins.length > 0 && (
            <p className="mt-auto pt-3 text-[11px] text-center" style={{ color: t.muted }}>
              {vitamins.length - doneCount} vitamin lagi untuk hari ini · ketuk untuk menandai sudah diminum
            </p>
          )}
        </>
      )}
    </Card>
  );
}

export function HealthScreen({ t, onEmergency, vitalLogs, onAddVital, vitDone, setVitDone, onToggleVitamin, vitamins, setVitamins, onSaveVitamins, symptoms, setSymptoms, onToggleSymptom, customSymptoms, setCustomSymptoms, trackers, weeksPreg }: {
  t: Theme; onEmergency: () => void; weeksPreg: number;
  vitalLogs: VitalLog[]; onAddVital: (v: VitalLog) => Promise<void>;
  vitDone: Record<string, boolean>; setVitDone: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onToggleVitamin: (id: string, completed: boolean) => void;
  vitamins: Vitamin[]; setVitamins: React.Dispatch<React.SetStateAction<Vitamin[]>>;
  onSaveVitamins: (vitamins: Vitamin[]) => void;
  symptoms: Record<string, boolean>; setSymptoms: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onToggleSymptom: (id: string, active: boolean, label: string, risk: Risk) => void;
  customSymptoms: CustomSymptom[]; setCustomSymptoms: React.Dispatch<React.SetStateAction<CustomSymptom[]>>;
  trackers: Trackers;
}) {
  const [newSym, setNewSym] = useState("");
  const [historyTab, setHistoryTab] = useState<HistoryTab | null>(null);
  // Kontraksi & kick counter dikelola di level aplikasi (useTrackers) agar tetap berjalan saat pindah halaman
  const { contraction, kick: kickTracker } = trackers;
  const contrActive = contraction.active;
  const elapsed = contraction.elapsedSecs;
  const contractions = contraction.contractions;
  const toggleContr = contraction.toggle;
  const kick = kickTracker.count;
  const kickActive = kickTracker.active;
  const kickSecs = kickTracker.elapsedSecs;
  const startKickSession = kickTracker.start;
  const addKick = kickTracker.add;
  const [showVitalForm, setShowVitalForm] = useState(false);

  const latestVital = vitalLogs.at(-1);

  // Tanda bahaya mengacu pada Buku KIA Kemenkes RI; perlu ditinjau tenaga kesehatan sebelum rilis.
  // Kode lama (nausea, dizzy, swelling, bleed, headache, vision, pain, fever) dipertahankan agar log yang sudah tersimpan tetap terbaca.
  const symList = [
    { id: "nausea",    label: "Mual Ringan",             risk: "green"  as Risk },
    { id: "dizzy",     label: "Pusing / Lemas",          risk: "yellow" as Risk },
    { id: "swelling",  label: "Bengkak Kaki",            risk: "yellow" as Risk },
    { id: "insomnia",  label: "Sulit Tidur / Cemas",     risk: "yellow" as Risk },
    { id: "bleed",     label: "Perdarahan / Bercak Darah", risk: "red"  as Risk },
    { id: "amniotic",  label: "Keluar Air Ketuban",      risk: "red"    as Risk },
    { id: "fetalmove", label: "Gerakan Janin Berkurang", risk: "red"    as Risk },
    { id: "vomiting",  label: "Muntah Terus-menerus",    risk: "red"    as Risk },
    { id: "fever",     label: "Demam Tinggi",            risk: "red"    as Risk },
    { id: "edema",     label: "Bengkak Wajah / Tangan",  risk: "red"    as Risk },
    // Digabung karena sama-sama tanda preeklamsia dengan tingkat risiko yang sama
    { id: "headache",  label: "Sakit Kepala Hebat / Pandangan Kabur", risk: "red" as Risk },
    { id: "seizure",   label: "Kejang",                  risk: "red"    as Risk },
    { id: "pain",      label: "Nyeri Perut Hebat",       risk: "red"    as Risk },
  ];
  const symGroups = [
    { title: "Keluhan umum", items: symList.filter(s => s.risk !== "red") },
    { title: "Tanda bahaya — segera ke fasilitas kesehatan", items: symList.filter(s => s.risk === "red") },
  ];

  const activeSyms = symList.filter(s => symptoms[s.id]);
  const risk: Risk = activeSyms.some(s => s.risk === "red") ? "red" : activeSyms.some(s => s.risk === "yellow") ? "yellow" : "green";
  const riskColor  = { green: "#22c55e", yellow: "#f59e0b", red: "#ef4444" };
  const riskLabel  = { green: "Status Normal", yellow: "Perlu Perhatian", red: "Tanda Bahaya" };

  // Gejala tambahan dari user hanya dicatat — tidak memengaruhi status risiko
  function addCustomSymptom() {
    const label = newSym.trim();
    if (!label) return;
    const exists = [...symList, ...customSymptoms].some(s => s.label.toLowerCase() === label.toLowerCase());
    if (!exists) {
      const id = `custom-${Date.now()}`;
      setCustomSymptoms(p => [...p, { id, label }]);
      setSymptoms(p => ({ ...p, [id]: true }));
    }
    setNewSym("");
  }
  function removeCustomSymptom(id: string) {
    setCustomSymptoms(p => p.filter(s => s.id !== id));
    setSymptoms(p => { const { [id]: _, ...rest } = p; return rest; });
  }

  const kickMins = Math.floor(kickSecs / 60);
  const kickSecRem = kickSecs % 60;
  const kickTimeStr = kickActive || kickSecs > 0
    ? `${String(kickMins).padStart(2,"0")}:${String(kickSecRem).padStart(2,"0")}`
    : "00:00";
  const timerPct = Math.min(100, (kickSecs * 1000 / KICK_MAX_MS) * 100);

  const avgGap = contractions.length > 1
    ? Math.round(contractions.slice(-3).reduce((a, c) => a + c.gap, 0) / Math.min(contractions.length, 3))
    : null;
  const is511 = contractions.length >= 3 && avgGap !== null && avgGap <= 5 && (contractions.at(-1)?.dur ?? 0) >= 60;

  return (
    <div className="space-y-5 w-full">
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: risk === "red" ? "#fef2f2" : risk === "yellow" ? "#fffbeb" : "#f0fdf4", border: `1.5px solid ${riskColor[risk]}25` }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: riskColor[risk] }}>
          {risk === "green" ? <Check size={22} className="text-white" /> : <AlertTriangle size={22} className="text-white" />}
        </div>
        <div>
          <p className="text-base font-extrabold" style={{ color: riskColor[risk] }}>{riskLabel[risk]}</p>
          <p className="text-sm" style={{ color: t.muted }}>
            {risk === "green" && "Kondisi baik. Terus pantau gejala harian Anda."}
            {risk === "yellow" && "Perhatikan kondisi dan konsultasikan pada ANC berikutnya."}
            {risk === "red" && "Segera hubungi dokter atau pergi ke unit gawat darurat."}
          </p>
        </div>
        {risk === "red" && (
          <div className="ml-auto">
            <PillBtn variant="danger" onClick={onEmergency} t={t}>Mode Darurat</PillBtn>
          </div>
        )}
      </div>

      {/* Sesi kontraksi/kick yang belum berhasil terkirim — dikirim ulang otomatis */}
      {trackers.sync.pendingCount > 0 && (
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "#fffbeb", border: "1px solid #fcd34d" }}>
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
          <p className="flex-1 text-xs text-amber-800">
            <span className="font-bold">{trackers.sync.pendingCount} sesi belum tersimpan ke server.</span>{" "}
            {trackers.sync.error ?? "Sedang mengirim…"} Data aman di perangkat ini dan akan dikirim ulang otomatis.
          </p>
          <button onClick={trackers.sync.retry} className="ui-interactive text-[11px] font-bold px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ background: "#fde68a", color: "#92400e" }}>
            Coba sekarang
          </button>
        </div>
      )}

      {/* Kontraksi Instan */}
      <Card t={t} className="p-6">
        <div className="flex items-center justify-between mb-5">
          <SectionTitle>Kontraksi Instan</SectionTitle>
          <div className="flex items-center gap-2">
            {is511 && (
              <span className="text-sm font-bold text-red-600 bg-red-50 px-4 py-1.5 rounded-full animate-pulse">
                Aturan 5-1-1 — Segera ke RS
              </span>
            )}
            <button onClick={() => setHistoryTab("contraction")} className="ui-interactive flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: t.soft, color: t.active }}>
                <History size={11} /> Riwayat
              </button>
          </div>
        </div>
        <div className="flex items-start gap-8">
          <button onClick={toggleContr}
            className="ui-interactive w-44 h-44 rounded-full font-bold text-white flex flex-col items-center justify-center gap-2 flex-shrink-0 text-base"
            style={{
              background: contrActive ? "linear-gradient(135deg,#ef4444,#b91c1c)" : `linear-gradient(135deg,${t.primary},${t.active})`,
              boxShadow: contrActive ? "0 0 0 10px rgba(239,68,68,0.15)" : `0 0 0 10px ${t.primary}30`,
            }}
          >
            <span className="text-3xl">{contrActive ? "⏹" : "▶"}</span>
            <span>{contrActive ? `${elapsed}s` : "Mulai"}</span>
          </button>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "Total",           v: contractions.length },
                { l: "Rata Jarak",      v: avgGap != null ? `${avgGap} mnt` : "—" },
                { l: "Durasi Terakhir", v: contractions.length ? `${contractions.at(-1)!.dur}s` : "—" },
              ].map(({ l, v }) => (
                <div key={l} className="rounded-2xl p-4 text-center" style={{ background: t.soft }}>
                  <p className="text-[10px]" style={{ color: t.muted }}>{l}</p>
                  <p className="text-xl font-extrabold" style={{ color: t.dark }}>{v}</p>
                </div>
              ))}
            </div>
            {contractions.length > 0 && (
              <div className="space-y-1.5">
                {contractions.slice(-4).reverse().map((c, i) => (
                  <div key={i} className="flex gap-4 text-xs rounded-xl px-4 py-2" style={{ background: t.soft }}>
                    <span style={{ color: t.muted }}>#{contractions.length - i}</span>
                    <span style={{ color: t.dark }}>Durasi: {c.dur}s</span>
                    {c.gap > 0 && <span style={{ color: t.dark }}>Jarak: {c.gap} mnt</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Data Vital + Kick Counter — 2 kolom sejajar */}
      <div className="grid grid-cols-2 gap-4 items-stretch">
        {/* Kiri: Data Vital Terakhir */}
        <Card t={t} className="p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-extrabold" style={{ color: t.dark }}>Data Vital Terakhir</p>
              {latestVital && <p className="text-[11px]" style={{ color: t.muted }}>{latestVital.date} · Minggu ke-{latestVital.minggu}</p>}
            </div>
            <button onClick={() => setShowVitalForm(v => !v)}
              className="ui-interactive flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: showVitalForm ? t.active : t.soft, color: showVitalForm ? "#fff" : t.active }}>
              <Plus size={12} /> Catat Baru
            </button>
          </div>

          {showVitalForm ? (
            <div className="border-t pt-4" style={{ borderColor: t.border }}>
              <VitalEntryForm compact t={t} weeksPreg={weeksPreg} onAddVital={onAddVital}
                onCancel={() => setShowVitalForm(false)} onSaved={() => setShowVitalForm(false)} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {latestVital ? [
                { l:"TD",      v:latestVital.td,      u:"mmHg"  },
                { l:"BB",      v:latestVital.bb,      u:"kg"    },
                { l:"Fundus",  v:latestVital.fundus,  u:"cm"    },
                { l:"Gerakan", v:latestVital.gerakan, u:"/2jam" },
                { l:"HB",      v:latestVital.hb,      u:"g/dL"  },
                { l:"Protein", v:latestVital.protein, u:""      },
              ].map(({ l, v, u }) => (
                <div key={l} className="rounded-xl px-3 py-2 text-center" style={{ background: t.soft }}>
                  <p className="text-[10px]" style={{ color: t.muted }}>{l}</p>
                  {/* Satuan sebaris dengan angka agar kotak lebih pendek */}
                  <p className="text-sm font-extrabold" style={{ color: t.dark }}>
                    {v || "—"}{v && u && <span className="text-[10px] font-normal ml-1" style={{ color: t.muted }}>{u}</span>}
                  </p>
                </div>
              )) : (
                <p className="col-span-2 text-center text-xs py-3" style={{ color: t.muted }}>Belum ada data vital.</p>
              )}
            </div>
          )}
          {/* Peringatan tepat di bawah angka yang dimaksud */}
          {!showVitalForm && (
            <div className="mt-3">
              <VitalDangerAlert compact vital={latestVital} onEmergency={onEmergency} />
            </div>
          )}
        </Card>

        {/* Kanan: Kick Counter */}
        <Card t={t} className="p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle>Kick Counter</SectionTitle>
            <div className="flex items-center gap-2">
              <button onClick={() => setHistoryTab("kick")} className="ui-interactive flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: t.soft, color: t.active }}>
                <History size={11} /> Riwayat
              </button>
              {kickActive && (
                <button onClick={kickTracker.stop} className="ui-interactive flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "#fee2e2", color: "#dc2626" }}>
                  <span className="w-2 h-2 rounded-sm bg-current" /> Hentikan
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] mb-2" style={{ color: t.muted }}>Target: 10 gerakan dalam 2 jam</p>

          {/* Dot grid — 10 target dots, extra shown as +N */}
          <div className="grid grid-cols-5 place-items-center gap-y-3 mb-4 w-full flex-1 content-center">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full transition-all duration-200"
                style={{
                  background: i < kick ? "#22c55e" : t.soft,
                  boxShadow: i < kick ? "0 0 0 3px #22c55e22" : "none",
                }} />
            ))}
          </div>

          {/* Count + tap button */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 rounded-2xl py-2.5 text-center" style={{ background: t.soft }}>
              <p className="text-2xl font-extrabold leading-none" style={{ color: kick >= 10 ? "#22c55e" : t.dark }}>{kick}</p>
              <p className="text-[10px] mt-1" style={{ color: t.muted }}>
                {kick < 10 ? `dari 10 target` : kick === 10 ? "target tercapai" : `+${kick - 10} ekstra`}
              </p>
            </div>
            {!kickTracker.started || kickTracker.finished ? (
              <button onClick={startKickSession}
                className="ui-interactive flex-1 py-2.5 rounded-2xl text-[13px] font-bold text-white"
                style={{ background: t.grad }}>
                {kickTracker.finished ? "Mulai Sesi Baru" : "Mulai Sesi"}
              </button>
            ) : (
              <button onClick={addKick}
                className="ui-interactive flex-1 py-2.5 rounded-2xl text-[13px] font-bold text-white"
                style={{ background: kick >= 10 ? "#22c55e" : t.active }}>
                + Tendangan
              </button>
            )}
          </div>

          {/* Timer bar */}
          <div className="mt-auto">
            <div className="flex justify-between mb-1">
              <p className="text-[10px] font-bold" style={{ color: t.muted }}>Waktu sesi</p>
              <p className="text-[10px] font-bold" style={{ color: kickActive ? t.active : t.muted }}>{kickTimeStr} / 02:00:00</p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: t.soft }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${timerPct}%`, background: timerPct > 90 ? "#ef4444" : t.primary }} />
            </div>
            {kick >= 10 && kickTracker.targetSecs !== null && (
              <div className="rounded-xl py-2 px-3 text-center" style={{ background: "#f0fdf4" }}>
                <p className="text-xs font-bold text-green-600">
                  Target tercapai dalam {Math.floor(kickTracker.targetSecs / 60)}m {kickTracker.targetSecs % 60}s
                  {kick > 10 ? ` · total ${kick} gerakan` : ""}
                </p>
                <p className="text-[10px] mt-0.5 text-green-700">
                  {kickActive ? "Lanjutkan menghitung, atau klik Hentikan bila sudah selesai." : "Sesi selesai · tersimpan di Riwayat."}
                </p>
              </div>
            )}
            {kickActive && kick < 10 && (
              <p className="text-center text-[11px]" style={{ color: t.muted }}>
                {10 - kick} gerakan lagi • sesi berjalan
              </p>
            )}
            {kickTracker.timedOut && (
              <div className="rounded-xl py-2 px-3 text-center" style={{ background: "#fef2f2" }}>
                <p className="text-xs font-bold text-red-600">
                  Sesi 2 jam selesai dengan {kick} gerakan (kurang dari 10). Segera hubungi bidan/dokter.
                </p>
              </div>
            )}
            {kickTracker.stoppedEarly && (
              <div className="rounded-xl py-2 px-3 text-center" style={{ background: t.soft }}>
                <p className="text-xs font-semibold" style={{ color: t.muted }}>
                  Sesi dihentikan dengan {kick} gerakan dalam {kickMins}m {kickSecRem}s. Tersimpan di Riwayat.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Log Gejala + Vitamin — paling bawah */}
      <div className="grid grid-cols-2 gap-4 items-stretch">
        <Card t={t} className="p-5 h-full">
          <SectionTitle>Log Gejala Hari Ini</SectionTitle>
          {symGroups.map((group, gi) => (
            <div key={group.title} className="mt-4">
              <p className="text-[11px] font-bold mb-2" style={{ color: gi === 0 ? t.muted : "#ef4444" }}>{group.title}</p>
              {/* Grid 3 kolom berkotak pendek dengan tinggi seragam; label panjang turun ke baris kedua */}
              <div className="grid grid-cols-3 gap-2">
                {group.items.map(({ id, label, risk: r }) => {
                  const rc = { green: "#22c55e", yellow: "#f59e0b", red: "#ef4444" }[r];
                  return (
                    <button key={id}
                      onClick={() => onToggleSymptom(id, !symptoms[id], label, r)}
                      className="min-h-[44px] rounded-xl px-2 py-1.5 text-[11px] font-semibold leading-tight text-center transition-colors duration-150 motion-reduce:transition-none"
                      style={{
                        background: symptoms[id] ? rc + "15" : t.soft,
                        border: `1.5px solid ${symptoms[id] ? rc : "transparent"}`,
                        color: symptoms[id] ? rc : t.muted,
                      }}>
                      {label}
                    </button>
                  );
                })}
                {/* Gejala tambahan user ikut keluhan umum: kotak sama, warna tema karena tidak dinilai risikonya, plus tombol hapus */}
                {gi === 0 && customSymptoms.map(({ id, label }) => (
                  <div key={id} className="relative">
                    <button onClick={() => setSymptoms(p => ({ ...p, [id]: !p[id] }))}
                      className="w-full h-full min-h-[44px] rounded-xl pl-2 pr-5 py-1.5 text-[11px] font-semibold leading-tight text-center break-words transition-colors duration-150 motion-reduce:transition-none"
                      style={{
                        background: symptoms[id] ? t.active + "15" : t.soft,
                        border: `1.5px solid ${symptoms[id] ? t.active : "transparent"}`,
                        color: symptoms[id] ? t.active : t.muted,
                      }}>
                      {label}
                    </button>
                    <button onClick={() => removeCustomSymptom(id)} title="Hapus gejala" aria-label={`Hapus gejala ${label}`}
                      className="absolute right-1 top-1 w-4 h-4 rounded-full flex items-center justify-center opacity-60 hover:opacity-100"
                      style={{ color: symptoms[id] ? t.active : t.muted }}>
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-4 pt-4" style={{ borderTop: `1px dashed ${t.border}` }}>
            <p className="text-[11px] font-bold mb-2" style={{ color: t.muted }}>Gejala lainnya</p>
            <form onSubmit={e => { e.preventDefault(); addCustomSymptom(); }} className="flex gap-2">
              <input value={newSym} onChange={e => setNewSym(e.target.value)} placeholder="Contoh: kram kaki, sembelit" maxLength={40}
                className="flex-1 min-w-0 rounded-xl px-3 py-2 text-xs outline-none"
                style={{ background: "#fff", border: `1.5px solid ${t.border}`, color: t.dark }} />
              <button type="submit" disabled={!newSym.trim()}
                className="ui-interactive flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-white disabled:opacity-40 disabled:pointer-events-none"
                style={{ background: t.active }}>
                <Plus size={13} /> Tambah
              </button>
            </form>
            <p className="text-[10px] mt-2 leading-relaxed" style={{ color: t.muted }}>
              Daftar tanda bahaya mengacu pada Buku KIA Kemenkes RI. Gejala tambahan hanya dicatat dan tidak dinilai otomatis. Konsultasikan ke bidan/dokter bila mengkhawatirkan.
            </p>
          </div>
        </Card>
        <VitaminTracker t={t} done={vitDone} setDone={setVitDone} onToggleVitamin={onToggleVitamin} vitamins={vitamins} setVitamins={setVitamins} onSaveVitamins={onSaveVitamins} className="h-full" />
      </div>
      <SessionHistoryModal isOpen={historyTab !== null} initialTab={historyTab ?? "contraction"} onClose={() => setHistoryTab(null)} t={t} />
    </div>
  );
}
