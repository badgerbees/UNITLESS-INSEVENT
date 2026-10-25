import React, { useRef, useState } from "react";
import { Check, AlertCircle, AlertTriangle } from "lucide-react";
import { Theme, VitalLog } from "../types";
import { PillBtn } from "./PillBtn";
import { friendlyError } from "../services/api";
import { EMPTY_VITAL_FORM, assessVital, type VitalForm } from "../utils/vitalValidation";

const WARN = "#f59e0b";
const DANGER = "#ea580c";

const FIELDS = [
  { key: "td",      label: "Tekanan Darah", placeholder: "118/76", hint: "mmHg"  },
  { key: "bb",      label: "Berat Badan",   placeholder: "68.5",   hint: "kg"    },
  { key: "fundus",  label: "Tinggi Fundus", placeholder: "32",     hint: "cm"    },
  { key: "gerakan", label: "Gerakan Janin", placeholder: "8-10",   hint: "/2jam" },
  { key: "hb",      label: "Hemoglobin",    placeholder: "11.8",   hint: "g/dL"  },
] as const;

// Form data vital bersama untuk halaman Kesehatan (compact) dan Laporan.
// Nilai mustahil ditolak; nilai tidak normal/berbahaya boleh disimpan setelah dikonfirmasi user.
// Data baru dianggap tersimpan setelah server menjawab sukses.
export function VitalEntryForm({ t, weeksPreg, onAddVital, onCancel, onSaved, compact = false }: {
  t: Theme; weeksPreg: number;
  onAddVital: (vital: VitalLog) => Promise<void>;
  onCancel: () => void; onSaved?: () => void; compact?: boolean;
}) {
  const [form, setForm] = useState<VitalForm>(EMPTY_VITAL_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof VitalForm, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const { errors, warnings, dangers } = assessVital(form, weeksPreg);
  const valid = Object.keys(errors).length === 0;
  const visible = (k: keyof VitalForm) => touched[k] || submitted;
  const showError = (k: keyof VitalForm) => visible(k) ? errors[k] : undefined;
  // Catatan per kolom: error (merah, menahan simpan) > bahaya (oranye) > peringatan (kuning)
  const note = (k: keyof VitalForm): { text: string; color: string; icon: boolean } | null => {
    if (!visible(k)) return null;
    if (errors[k]) return { text: errors[k]!, color: "#ef4444", icon: false };
    if (dangers[k]) return { text: dangers[k]!, color: DANGER, icon: true };
    if (warnings[k]) return { text: warnings[k]!, color: "#b45309", icon: true };
    return null;
  };
  const flagged = Object.keys({ ...warnings, ...dangers }).length;

  function set(k: keyof VitalForm, v: string) {
    setForm(p => ({ ...p, [k]: v }));
    setServerError(null);
    setConfirming(false);
  }
  const touch = (k: keyof VitalForm) => setTouched(p => ({ ...p, [k]: true }));

  async function handleSave(confirmed = false) {
    setSubmitted(true);
    if (saving) return;
    if (!valid) {
      // Arahkan kursor ke kolom pertama yang perlu diperbaiki
      const firstKey = (["td", "bb", "fundus", "gerakan", "hb", "catatan"] as const).find(k => errors[k]);
      const target = firstKey === "td" ? sysRef.current : formRef.current?.querySelector<HTMLInputElement>(`[data-field="${firstKey}"]`);
      target?.focus();
      return;
    }
    // Nilai di luar rentang normal tetap boleh disimpan, tapi user diminta memastikan dulu
    if (flagged > 0 && !confirmed) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    setSaving(true);
    setServerError(null);
    try {
      await onAddVital({
        id: `v${Date.now()}`,
        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        // Minggu kehamilan saat ini (backend hanya menerima 1–45)
        minggu: Math.min(45, Math.max(1, weeksPreg)),
        ...form,
      });
      setForm(EMPTY_VITAL_FORM);
      setTouched({});
      setSubmitted(false);
      onSaved?.();
    } catch (error) {
      console.error("Failed to save vital", error);
      setServerError(friendlyError(error));
    } finally {
      setSaving(false);
    }
  }

  const labelCls = compact ? "text-[10px] font-bold block mb-1" : "text-[11px] font-bold block mb-1";
  const inputText = compact ? "py-2 text-xs" : "py-2.5 text-sm";
  const border = (k: keyof VitalForm) => {
    if (showError(k)) return "#ef4444";
    if (visible(k) && dangers[k]) return DANGER;
    if (visible(k) && warnings[k]) return WARN;
    return form[k] ? t.primary : t.border;
  };
  const renderNote = (k: keyof VitalForm) => {
    const n = note(k);
    return n && (
      <p className="text-[10px] mt-1 leading-snug flex gap-1" style={{ color: n.color }}>
        {n.icon && <AlertTriangle size={10} className="flex-shrink-0 mt-px" />}{n.text}
      </p>
    );
  };
  const [sys = "", dia = ""] = form.td.split("/");
  const formRef = useRef<HTMLDivElement>(null);
  const sysRef = useRef<HTMLInputElement>(null);
  const diaRef = useRef<HTMLInputElement>(null);
  // Pindahkan kursor antar kolom sistolik/diastolik seperti mengetik di satu kolom "118/76"
  function focusAt(el: HTMLInputElement | null, pos: number | "end") {
    if (!el) return;
    el.focus();
    // Atur kursor langsung (bukan di frame berikutnya) agar tidak menimpa ketikan yang sudah masuk
    const at = pos === "end" ? el.value.length : pos;
    el.setSelectionRange(at, at);
  }
  const setTd = (s: string, d: string) => set("td", s || d ? `${s}/${d}` : "");

  const errorCount = Object.keys(errors).length;

  return (
    <div ref={formRef}>
      <div className={`grid grid-cols-3 ${compact ? "gap-3 mb-3" : "gap-3 mb-4"}`}>
        {FIELDS.map(({ key, label, placeholder, hint }) => (
          <div key={key}>
            <label className={labelCls} style={{ color: t.dark }}>{label}{(key === "td" || key === "bb") && <span className="text-red-500"> *</span>}</label>
            {key === "td" ? (
              <div className={`relative flex items-center ${compact ? "rounded-lg pr-9" : "rounded-xl pr-12"} border-2 overflow-hidden`}
                style={{ borderColor: border("td"), background: t.soft, color: t.dark }}>
                <input ref={sysRef} className={`w-full bg-transparent text-center outline-none ${inputText} placeholder:text-gray-400`}
                  placeholder="118" value={sys} inputMode="numeric" aria-label="Sistolik" onBlur={() => touch("td")}
                  onKeyDown={e => {
                    const el = e.currentTarget;
                    const atEnd = el.selectionStart === el.value.length && el.selectionEnd === el.value.length;
                    // "/", spasi, atau titik = selesai isi sistolik (untuk nilai 2 digit seperti 95)
                    if (["/", " ", ".", ","].includes(e.key) || (e.key === "ArrowRight" && atEnd)) {
                      e.preventDefault();
                      focusAt(diaRef.current, 0);
                    }
                  }}
                  onChange={e => {
                    const next = e.target.value.replace(/\D/g, "").slice(0, 3);
                    setTd(next, dia);
                    // Sistolik maksimal 3 digit, jadi lanjut otomatis ke diastolik
                    if (next.length === 3) focusAt(diaRef.current, 0);
                  }} />
                <span className="text-xs font-black opacity-30">/</span>
                <input ref={diaRef} className={`w-full bg-transparent text-center outline-none ${inputText} placeholder:text-gray-400`}
                  placeholder="76" value={dia} inputMode="numeric" aria-label="Diastolik" onBlur={() => touch("td")}
                  onKeyDown={e => {
                    const el = e.currentTarget;
                    const atStart = el.selectionStart === 0 && el.selectionEnd === 0;
                    // Panah kiri / Backspace di awal kolom diastolik = kembali ke ujung kolom sistolik
                    if ((e.key === "ArrowLeft" || e.key === "Backspace") && atStart) {
                      e.preventDefault();
                      focusAt(sysRef.current, "end");
                    }
                  }}
                  onChange={e => setTd(sys, e.target.value.replace(/\D/g, "").slice(0, 3))} />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px]" style={{ color: t.muted }}>{hint}</span>
              </div>
            ) : (
              <div className="relative">
                <input
                  className={`w-full ${compact ? "rounded-lg px-2.5 pr-9" : "rounded-xl px-3 pr-12"} ${inputText} outline-none border-2`}
                  style={{ borderColor: border(key), background: t.soft, color: t.dark }}
                  placeholder={`cth: ${placeholder}`} value={form[key]} inputMode="decimal" data-field={key} onBlur={() => touch(key)}
                  onChange={e => {
                    let v = e.target.value;
                    if (key === "gerakan") v = v.replace(/[^\d-]/g, "");
                    else { v = v.replace(/[^\d.]/g, ""); if (v.split(".").length > 2) v = v.slice(0, -1); }
                    set(key, v);
                  }} />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px]" style={{ color: t.muted }}>{hint}</span>
              </div>
            )}
            {renderNote(key)}
          </div>
        ))}
        <div>
          <label className={labelCls} style={{ color: t.dark }}>Protein Urin</label>
          <select className={`w-full ${compact ? "rounded-lg px-2.5" : "rounded-xl px-3"} ${inputText} outline-none border-2`}
            style={{ borderColor: warnings.protein ? WARN : t.border, background: t.soft, color: t.dark }}
            value={form.protein} onChange={e => { set("protein", e.target.value); touch("protein"); }}>
            {["Negatif", "+", "++", "+++"].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          {renderNote("protein")}
        </div>
      </div>

      <div className={compact ? "mb-3" : "mb-4"}>
        <label className={labelCls} style={{ color: t.dark }}>Catatan (opsional)</label>
        <input className={`w-full ${compact ? "rounded-lg px-2.5" : "rounded-xl px-3"} ${inputText} outline-none border-2`}
          style={{ borderColor: showError("catatan") ? "#ef4444" : t.border, background: t.soft, color: t.dark }}
          placeholder="cth: sedikit pusing pagi" value={form.catatan} data-field="catatan" onBlur={() => touch("catatan")}
          onChange={e => set("catatan", e.target.value)} />
        {renderNote("catatan")}
      </div>

      {serverError && (
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-3" style={{ background: "#fef2f2", border: "1px solid #fca5a5" }}>
          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">
            <span className="font-bold">Data belum tersimpan.</span> {serverError}
          </p>
        </div>
      )}

      {submitted && errorCount > 0 && !serverError && (
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-3" style={{ background: "#fef2f2", border: "1px solid #fca5a5" }}>
          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">
            <span className="font-bold">Belum bisa disimpan.</span> Perbaiki {errorCount} isian yang ditandai merah, lalu klik Simpan lagi.
          </p>
        </div>
      )}

      {confirming && valid && (
        <div className="rounded-xl px-3 py-2.5 mb-3" style={{ background: "#fffbeb", border: "1px solid #fcd34d" }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: WARN }} />
            <p className="text-xs" style={{ color: "#92400e" }}>
              <span className="font-bold">{flagged} nilai di luar rentang normal.</span> Pastikan angkanya sudah benar sebelum disimpan.
              {Object.keys(dangers).length > 0 && " Beberapa nilai bisa menandakan kondisi serius — setelah disimpan, segera hubungi bidan/dokter."}
            </p>
          </div>
          <div className="flex gap-2 mt-2 ml-6">
            <button onClick={() => setConfirming(false)} className="ui-interactive text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: "#fde68a", color: "#92400e" }}>
              Periksa lagi
            </button>
            <button onClick={() => void handleSave(true)} className="ui-interactive text-[11px] font-bold px-3 py-1.5 rounded-full text-white" style={{ background: "#d97706" }}>
              Ya, tetap simpan
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {/* Tombol tetap aktif agar klik selalu memberi penjelasan; hanya nonaktif saat sedang menyimpan */}
        <PillBtn variant="active" size={compact ? "sm" : "md"} onClick={() => void handleSave()} disabled={saving} t={t}>
          <Check size={compact ? 13 : 15} /> {saving ? "Menyimpan…" : compact ? "Simpan" : "Simpan Data Vital"}
        </PillBtn>
        <PillBtn variant="outline" size={compact ? "sm" : "md"} onClick={onCancel} t={t}>Batal</PillBtn>
      </div>
      <p className="text-[10px] mt-2" style={{ color: t.muted }}><span className="text-red-500">*</span> wajib diisi</p>
    </div>
  );
}
