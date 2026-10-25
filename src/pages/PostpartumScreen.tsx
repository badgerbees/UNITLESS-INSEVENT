import React, { useState, useEffect } from "react";
import { Theme, VitalLog, EmergencyAlert, Risk, Mode } from "../types";
import { Card } from "../components/Card";
import { PillBtn } from "../components/PillBtn";
import { SectionTitle } from "../components/SectionTitle";
import { StatTile } from "../components/StatTile";
import { fmtDate, addDays } from "../utils/helpers";
import {
  Home, Activity, Calendar, FileText, Package, Bell,
  Plus, Minus, Check, X, AlertTriangle, Download, Baby,
  PhoneCall, ArrowRight, RefreshCw, ChevronLeft, Search, Heart,
  MapPin, Navigation, Send, CheckCheck, Clock, Zap, Printer, Mail, Lock, LogOut, Settings, History, Users, Scissors, Droplets, Brain, HeartPulse, Eye, Bone, Wind, Activity as ActivityIcon,
  User, Smartphone, Copy, Headphones, MessageCircle, HelpCircle
} from "lucide-react";


// Nilai untuk input datetime-local dalam jam lokal perangkat (mis. "2026-10-25T13:52")
function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function PostpartumScreen({ t, mode, birthAt, checks, onConfirmBirth, onCancelBirth, onToggleAdmin }: {
  t: Theme; mode: Mode; birthAt: Date | null; checks: Record<string, boolean>;
  onConfirmBirth: (date: Date) => Promise<void>;
  onCancelBirth: () => Promise<void>;
  onToggleAdmin: (stepId: string) => void;
}) {
  const [birthDate, setBirthDate] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const adminSteps = [
    { id: "surat", label: "Surat Lahir dari RS / Bidan",  deadline: "Hari lahir"   },
    { id: "akta",  label: "Akta Kelahiran – Dukcapil",    deadline: "< 30 hari"    },
    { id: "kk",    label: "Pembaruan Kartu Keluarga",     deadline: "< 30 hari"    },
    { id: "bpjs",  label: "Daftar BPJS Bayi Baru Lahir", deadline: "< 28 hari"    },
    { id: "nik",   label: "Pembuatan NIK Bayi",           deadline: "Setelah Akta" },
  ];
  const donePct = Math.round((adminSteps.filter(s => checks[s.id]).length / adminSteps.length) * 100);

  async function handleConfirm() {
    const date = new Date(birthDate);
    if (Number.isNaN(date.getTime())) return;
    if (date.getTime() > Date.now()) { setError("Waktu lahir tidak boleh di masa depan."); setConfirming(false); return; }
    setSaving(true);
    setError(null);
    try {
      await onConfirmBirth(date);
    } catch (err) {
      setError(err instanceof Error ? `Gagal menyimpan: ${err.message}` : "Gagal menyimpan. Coba lagi.");
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    setSaving(true);
    setError(null);
    try {
      await onCancelBirth();
      setCancelling(false);
      setBirthDate("");
    } catch (err) {
      setError(err instanceof Error ? `Gagal menyimpan: ${err.message}` : "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  if (!birthAt) {
    return (
      <div className="max-w-md mx-auto space-y-5">
        <div className="rounded-3xl p-10 text-center" style={{ background: t.grad }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
            <Baby size={36} color="white" />
          </div>
          <p className="text-3xl font-extrabold text-white">{mode === "mother" ? "Selamat, Bunda!" : "Mode Pasca-Melahirkan"}</p>
          <p className="text-sm mt-2 leading-relaxed text-balance" style={{ color: "rgba(255,255,255,0.8)" }}>
            {mode === "mother"
              ? "Yuk, catat kapan si kecil lahir untuk mulai masa pemulihan"
              : "Aktif setelah Bunda mencatat waktu lahir si kecil."}
          </p>
        </div>
        {mode === "mother" && (
          <Card t={t} className="p-6 space-y-4">
            <p className="text-sm font-bold" style={{ color: t.dark }}>Tanggal & Waktu Kelahiran</p>
            <input type="datetime-local" max={toLocalInputValue(new Date())}
              className="w-full rounded-full px-5 py-3 outline-none border-2 text-sm transition-all"
              style={{ borderColor: birthDate ? t.primary : t.border, color: t.dark, background: t.soft }}
              value={birthDate} onChange={e => { setBirthDate(e.target.value); setConfirming(false); }}
            />
            {confirming ? (
              <div className="rounded-2xl p-4 space-y-3" style={{ background: t.soft, border: `1.5px solid ${t.border}` }}>
                <p className="text-xs leading-relaxed" style={{ color: t.dark }}>
                  <span className="font-bold">Yakin si kecil sudah lahir?</span> Setelah ini, tampilan untuk Bunda dan suami akan menyesuaikan dengan masa pemulihan.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <PillBtn full variant="outline" onClick={() => setConfirming(false)} disabled={saving} t={t}>Batal</PillBtn>
                  <PillBtn full variant="active" onClick={() => void handleConfirm()} disabled={saving} t={t}>
                    {saving ? "Menyimpan…" : "Ya, sudah lahir"}
                  </PillBtn>
                </div>
              </div>
            ) : (
              <PillBtn full variant="primary" size="lg" disabled={!birthDate} onClick={() => birthDate && setConfirming(true)} t={t}>
                Konfirmasi Kelahiran
              </PillBtn>
            )}
            {error && <p className="text-xs text-red-600 text-center">{error}</p>}
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full">
      <div className="rounded-3xl p-6 flex items-center gap-6" style={{ background: t.grad }}>
        <div className="flex-1">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Mode Pasca-Melahirkan</p>
          <p className="text-2xl font-extrabold text-white mt-1">Selamat, Bunda</p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            Lahir: {birthAt.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
          <Baby size={28} color="white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card t={t} className="p-6">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle>Administrasi Bayi Baru Lahir</SectionTitle>
            <span className="text-xs font-bold" style={{ color: donePct === 100 ? "#22c55e" : t.active }}>{donePct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: t.soft }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${donePct}%`, background: donePct === 100 ? "#22c55e" : t.primary }} />
          </div>
          <div className="space-y-2">
            {adminSteps.map(s => (
              <button key={s.id} onClick={() => onToggleAdmin(s.id)} disabled={mode !== "mother"}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 disabled:cursor-default"
                style={{ background: checks[s.id] ? "#f0fdf4" : t.soft }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: checks[s.id] ? "#22c55e" : t.primary }}>
                  {checks[s.id] ? <Check size={14} className="text-white" /> : <span className="text-[10px] font-bold text-white">·</span>}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold" style={{ color: checks[s.id] ? "#166534" : t.dark }}>{s.label}</p>
                  <p className="text-[11px]" style={{ color: t.muted }}>Batas: {s.deadline}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card t={t} className="p-6">
          <SectionTitle>Tips Pemulihan Pasca-Melahirkan</SectionTitle>
          <div className="space-y-3">
            {[
              "Istirahat cukup — tidur saat bayi tidur",
              "Susui bayi on-demand (8–12× per hari)",
              "Jaga kebersihan luka jahitan, ganti perban rutin",
              "Perhatikan tanda baby blues vs depresi postpartum",
              "Kunjungi dokter 6 minggu pasca persalinan",
              "Lanjutkan suplemen zat besi dan vitamin D",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: t.soft }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[10px] font-bold" style={{ background: t.primary }}>
                  {i + 1}
                </div>
                <p className="text-sm" style={{ color: t.dark }}>{tip}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Jalan keluar bila tombol "Bayi Telah Lahir" tidak sengaja ditekan */}
      {mode === "mother" && (
        <div className="flex flex-col items-center gap-2 pt-1">
          {cancelling ? (
            <div className="flex items-center gap-3 rounded-full pl-4 pr-1.5 py-1.5 text-xs" style={{ background: t.soft, color: t.dark }}>
              <span>Kembali ke mode kehamilan? Progres administrasi akan dihapus.</span>
              <button onClick={() => setCancelling(false)} disabled={saving} className="font-bold px-3 py-1.5 rounded-full hover:bg-black/5" style={{ color: t.muted }}>Batal</button>
              <button onClick={() => void handleCancel()} disabled={saving} className="font-bold px-3 py-1.5 rounded-full text-white" style={{ background: t.active }}>
                {saving ? "Menyimpan…" : "Ya, kembalikan"}
              </button>
            </div>
          ) : (
            <button onClick={() => setCancelling(true)} className="text-xs font-semibold underline" style={{ color: t.muted }}>
              Salah tekan? Kembali ke mode kehamilan
            </button>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}

