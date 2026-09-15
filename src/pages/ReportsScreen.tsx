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


export function SvgLineChart({ data, series, yMin, yMax }: {
  data: SvgChartPoint[];
  series: { key: string; name: string; color: string }[];
  yMin?: number;
  yMax?: number;
}) {
  const W = 400; const H = 180;
  const pl = 38; const pr = 10; const pt = 8; const pb = 28;
  const cW = W - pl - pr; const cH = H - pt - pb;

  const nums = series.flatMap(s => data.map(d => d[s.key] as number | null).filter((v): v is number => v != null));
  const lo = yMin ?? Math.floor(Math.min(...nums) - 4);
  const hi = yMax ?? Math.ceil(Math.max(...nums) + 4);
  const span = hi - lo || 1;

  function gx(i: number) { return pl + (i / Math.max(data.length - 1, 1)) * cW; }
  function gy(v: number) { return pt + cH - ((v - lo) / span) * cH; }

  const yTicks: number[] = [];
  const step = Math.ceil(span / 4 / 5) * 5 || 1;
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) yTicks.push(v);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {yTicks.map(v => (
          <g key={`yt-${v}`}>
            <line x1={pl} y1={gy(v)} x2={W - pr} y2={gy(v)} stroke="#f0f0f0" strokeWidth={1} />
            <text x={pl - 4} y={gy(v) + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{v}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={`xl-${i}`} x={gx(i)} y={H - 6} textAnchor="middle" fontSize={10} fill="#9ca3af">{d.label}</text>
        ))}
        {series.map(s => {
          const pts = data.map((d, i) => ({ x: gx(i), y: gy(d[s.key] as number), v: d[s.key] })).filter(p => p.v != null);
          const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
          return (
            <g key={s.key}>
              <path d={d} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill={s.color} stroke="#fff" strokeWidth={2} />)}
            </g>
          );
        })}
      </svg>
      <div className="flex gap-4 mt-1">
        {series.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className="w-4 h-2 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SvgAreaChart({ data, seriesKey, seriesName, color }: {
  data: SvgChartPoint[];
  seriesKey: string;
  seriesName: string;
  color: string;
}) {
  const W = 400; const H = 180;
  const pl = 38; const pr = 10; const pt = 8; const pb = 28;
  const cW = W - pl - pr; const cH = H - pt - pb;

  const nums = data.map(d => d[seriesKey] as number | null).filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  const lo = Math.floor(Math.min(...nums) - 3);
  const hi = Math.ceil(Math.max(...nums) + 3);
  const span = hi - lo || 1;

  function gx(i: number) { return pl + (i / Math.max(data.length - 1, 1)) * cW; }
  function gy(v: number) { return pt + cH - ((v - lo) / span) * cH; }

  const yTicks: number[] = [];
  const step = Math.ceil(span / 4 / 1) || 1;
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) yTicks.push(v);

  const pts = data.map((d, i) => ({ x: gx(i), y: gy(d[seriesKey] as number), v: d[seriesKey] })).filter(p => p.v != null);
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = pts.length > 0
    ? `${linePath} L${pts.at(-1)!.x},${pt + cH} L${pts[0].x},${pt + cH} Z`
    : "";

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        <defs>
          <linearGradient id="svg-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {yTicks.map(v => (
          <g key={`yt-${v}`}>
            <line x1={pl} y1={gy(v)} x2={W - pr} y2={gy(v)} stroke="#f0f0f0" strokeWidth={1} />
            <text x={pl - 4} y={gy(v) + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{v}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={`xl-${i}`} x={gx(i)} y={H - 6} textAnchor="middle" fontSize={10} fill="#9ca3af">{d.label}</text>
        ))}
        <path d={areaPath} fill="url(#svg-area-grad)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill={color} stroke="#fff" strokeWidth={2} />)}
      </svg>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-4 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
        <span style={{ fontSize: 11, color: "#9ca3af" }}>{seriesName}</span>
      </div>
    </div>
  );
}

export function MedicalReportPreview({ t, vitalLogs, weeksPreg, dueDate }: {
  t: Theme; vitalLogs: VitalLog[]; weeksPreg: number; dueDate: Date;
}) {
  const [printing, setPrinting] = useState(false);

  const chartData = Object.values(
    vitalLogs.reduce<Record<number, { label: string; minggu: number; sistolik: number | null; diastolik: number | null; bb: number | null }>>(
      (acc, log) => {
        const parts = log.td.split("/");
        acc[log.minggu] = {
          label: `M${log.minggu}`,
          minggu: log.minggu,
          sistolik: parts[0] ? Number(parts[0]) : null,
          diastolik: parts[1] ? Number(parts[1]) : null,
          bb: log.bb ? Number(log.bb) : null,
        };
        return acc;
      },
      {}
    )
  ).sort((a, b) => a.minggu - b.minggu);

  const latest = vitalLogs.at(-1);
  const risikoKategori = "HIJAU (NORMAL)";

  const patientName = "Bunda Rahma";
  const hplStr = dueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => setPrinting(false), 1500);
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold" style={{ color: t.dark }}>Pratinjau Laporan Rekam Medis</p>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-white text-sm transition-all hover:brightness-95"
          style={{ background: t.grad }}
        >
          {printing
            ? <><RefreshCw size={15} className="animate-spin" /> Memproses…</>
            : <><Printer size={15} /> Cetak / Simpan PDF</>
          }
        </button>
      </div>

      {/* Report card */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "#ffffff", border: "1.5px solid #e5e7eb", boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
        {/* Report header */}
        <div className="px-8 pt-8 pb-6" style={{ borderBottom: "2px solid #1a1a2e" }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight" style={{ color: "#1a1a2e", letterSpacing: "-0.5px" }}>
                LAPORAN REKAM MEDIS MATERNAL
              </h1>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>BundaCare Integrated Clinical Summary System</p>
            </div>
            {/* QR code mock */}
            <div className="flex flex-col items-end gap-1">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#9ca3af" }}>VALIDASI DIGITAL</p>
              <div className="w-20 h-20 rounded-lg grid gap-0 p-1.5" style={{ background: "#1a1a2e" }}>
                <div className="grid grid-cols-7 grid-rows-7 gap-px h-full w-full">
                  {Array.from({ length: 49 }).map((_, i) => {
                    const qrPattern = [
                      0,0,0,0,0,0,0, 0,1,0,1,0,0,1, 0,0,0,0,0,0,0,
                      1,1,1,0,1,1,0, 0,1,0,0,1,0,1, 1,0,1,0,0,1,0,
                      0,1,0,1,1,0,1, 0,0,1,0,1,0,0,
                    ];
                    return (
                      <div key={i} className="rounded-[1px]"
                        style={{ background: qrPattern[i % qrPattern.length] === 0 ? "#ffffff" : "#1a1a2e" }} />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patient info row */}
        <div className="px-8 py-5" style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: "Nama Pasien",      value: patientName,                bold: false },
              { label: "Usia Kandungan",   value: `${weeksPreg} Wk + 0 D`,   bold: false },
              { label: "HPL Target",       value: hplStr,                     bold: false },
              { label: "Kategori Risiko",  value: risikoKategori,             bold: true  },
            ].map(({ label, value, bold }) => (
              <div key={label}>
                <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>{label}</p>
                <p className="text-base font-extrabold" style={{ color: bold ? "#16a34a" : "#1a1a2e" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-0" style={{ borderBottom: "1px solid #e5e7eb", borderRight: "none" }}>
          {/* Blood pressure chart */}
          <div className="px-6 py-6" style={{ borderRight: "1px solid #e5e7eb" }}>
            <p className="text-sm font-extrabold mb-3" style={{ color: "#1a1a2e" }}>Tren Tekanan Darah (mmHg)</p>
            <SvgLineChart
              data={chartData}
              series={[
                { key: "sistolik", name: "Sistolik", color: t.active },
                { key: "diastolik", name: "Diastolik", color: "#f9a8d4" },
              ]}
              yMin={40}
              yMax={160}
            />
          </div>
          {/* Weight chart */}
          <div className="px-6 py-6">
            <p className="text-sm font-extrabold mb-3" style={{ color: "#1a1a2e" }}>Kurva Berat Badan Ibu (kg)</p>
            <SvgAreaChart
              data={chartData}
              seriesKey="bb"
              seriesName="Berat Badan (kg)"
              color="#10b981"
            />
          </div>
        </div>

        {/* Vital summary table */}
        <div className="px-8 py-6">
          <p className="text-sm font-extrabold mb-4" style={{ color: "#1a1a2e" }}>Ringkasan Data Vital</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1.5px solid #e5e7eb" }}>
                {["Tanggal", "Minggu", "Tekanan Darah", "Berat Badan", "TFU", "Gerakan Janin", "Hemoglobin", "Protein Urin", "Catatan"].map(h => (
                  <th key={h} className="pb-2 pr-4 text-left text-[11px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: "#9ca3af" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vitalLogs.map((log, i) => (
                <tr key={log.id} style={{ borderBottom: i < vitalLogs.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td className="py-2.5 pr-4 text-xs font-semibold whitespace-nowrap" style={{ color: "#374151" }}>{log.date}</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: "#6b7280" }}>{log.minggu}</td>
                  <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: "#1a1a2e" }}>{log.td} mmHg</td>
                  <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: "#1a1a2e" }}>{log.bb} kg</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: "#374151" }}>{log.fundus ? `${log.fundus} cm` : "—"}</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: "#374151" }}>{log.gerakan || "—"}</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: "#374151" }}>{log.hb ? `${log.hb} g/dL` : "—"}</td>
                  <td className="py-2.5 pr-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: log.protein === "Negatif" ? "#f0fdf4" : "#fef2f2", color: log.protein === "Negatif" ? "#16a34a" : "#dc2626" }}>
                      {log.protein === "Negatif" ? "Negatif" : log.protein}
                    </span>
                  </td>
                  <td className="py-2.5 text-xs" style={{ color: "#9ca3af" }}>{log.catatan || "—"}</td>
                </tr>
              ))}
              {vitalLogs.length === 0 && (
                <tr><td colSpan={9} className="py-6 text-center text-xs" style={{ color: "#9ca3af" }}>Belum ada data vital yang tercatat.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 flex items-center justify-between" style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
          <p className="text-[10px]" style={{ color: "#9ca3af" }}>BundaCare · Maternal AI Platform · Dokumen ini dicetak secara digital · {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="text-[10px] font-bold" style={{ color: "#16a34a" }}>HIJAU — Risiko Normal</p>
        </div>
      </div>
    </div>
  );
}

export function ReportsScreen({ t, vitalLogs, onAddVital, weeksPreg, dueDate }: {
  t: Theme; weeksPreg: number; dueDate: Date;
  vitalLogs: VitalLog[];
  onAddVital: (v: VitalLog) => void;
}) {
  const [tab, setTab] = useState<"grafik" | "input" | "history" | "analisis">("grafik");
  const [showPdf, setShowPdf] = useState(false);

  const [form, setForm] = useState({ td:"", bb:"", fundus:"", gerakan:"", hb:"", protein:"Negatif" as VitalLog["protein"], catatan:"" });
  function setF(k: keyof typeof form, v: string) { setForm(p => ({ ...p, [k]: v })); }
  const formValid = form.td && form.bb && form.fundus;

  const latest = vitalLogs.at(-1);
  const sorted = [...vitalLogs].reverse();

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1;
  const paginatedLogs = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleSave() {
    if (!formValid) return;
    const now = new Date();
    onAddVital({
      id: `v${Date.now()}`,
      date: now.toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" }),
      minggu: weeksPreg,
      ...form,
    });
    setForm({ td:"", bb:"", fundus:"", gerakan:"", hb:"", protein:"Negatif", catatan:"" });
    setTab("history");
    setPage(1);
  }

  const chartData = Object.values(
    vitalLogs.reduce<Record<number, { label: string; minggu: number; sistolik: number | null; diastolik: number | null; bb: number | null }>>(
      (acc, log) => {
        const parts = log.td.split("/");
        acc[log.minggu] = {
          label: `M${log.minggu}`,
          minggu: log.minggu,
          sistolik: parts[0] ? Number(parts[0]) : null,
          diastolik: parts[1] ? Number(parts[1]) : null,
          bb: log.bb ? Number(log.bb) : null,
        };
        return acc;
      }, {}
    )
  ).sort((a, b) => a.minggu - b.minggu);

  return (
    <div className="space-y-5 w-full">
      <div>
        <Card t={t} className="p-6">
          {/* Tab bar + ekspor button */}
          <div className="flex items-center gap-2 mb-5">
            {([
              { id: "grafik",   label: "Grafik" },
              { id: "analisis", label: "Analisis Tren" },
              { id: "input",    label: "+ Catat Vital" },
              { id: "history",  label: `Riwayat (${vitalLogs.length})` },
            ] as { id: typeof tab; label: string }[]).map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className="px-5 py-2 rounded-full text-sm font-bold transition-all"
                style={{ background: tab === id ? t.active : t.soft, color: tab === id ? "#fff" : t.muted }}>
                {label}
              </button>
            ))}
            <div className="ml-auto">
              <button
                onClick={() => setShowPdf(v => !v)}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all"
                style={{ background: showPdf ? t.active : t.soft, color: showPdf ? "#fff" : t.active, border: `1.5px solid ${showPdf ? "transparent" : t.active}40` }}
              >
                <FileText size={14} /> {showPdf ? "Tutup Laporan" : "Ekspor PDF"}
              </button>
            </div>
          </div>

          {/* ── Grafik tab ── */}
          {tab === "grafik" && (
            <div className="space-y-5">
              {/* Stat tiles */}
              {latest ? (
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: "Tekanan Darah", value: latest.td,      unit: "mmHg",  accent: false },
                    { label: "Berat Badan",   value: latest.bb,      unit: "kg",    accent: false },
                    { label: "TFU",           value: latest.fundus ? `${latest.fundus} cm` : "—", unit: "", accent: false },
                    { label: "Hemoglobin",    value: latest.hb ? `${latest.hb} g/dL` : "—",       unit: "", accent: false },
                    { label: "Protein Urin",  value: latest.protein, unit: "",      accent: latest.protein !== "Negatif" },
                  ].map(({ label, value, unit, accent }) => (
                    <div key={label} className="rounded-2xl p-4 text-center" style={{ background: t.soft }}>
                      <p className="text-[10px] font-semibold mb-1" style={{ color: t.muted }}>{label}</p>
                      <p className="text-lg font-extrabold leading-tight" style={{ color: accent ? "#ef4444" : t.dark }}>{value}</p>
                      {unit && <p className="text-[10px] mt-0.5" style={{ color: t.muted }}>{unit}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl p-5 text-center" style={{ background: t.soft }}>
                  <p className="text-sm" style={{ color: t.muted }}>Belum ada data vital. Gunakan tab "+ Catat Vital" untuk mulai.</p>
                </div>
              )}

              {/* Charts side by side */}
              <div className="grid grid-cols-2 gap-4">
                <Card t={t} className="p-5">
                  <p className="text-sm font-extrabold mb-1" style={{ color: t.dark }}>Tren Tekanan Darah</p>
                  <p className="text-[11px] mb-4" style={{ color: t.muted }}>mmHg · per minggu ANC</p>
                  {chartData.length >= 1 ? (
                    <SvgLineChart
                      data={chartData}
                      series={[
                        { key: "sistolik",  name: "Sistolik",  color: t.active },
                        { key: "diastolik", name: "Diastolik", color: "#f9a8d4" },
                      ]}
                      yMin={40} yMax={160}
                    />
                  ) : (
                    <p className="text-xs py-8 text-center" style={{ color: t.muted }}>Belum cukup data</p>
                  )}
                </Card>
                <Card t={t} className="p-5">
                  <p className="text-sm font-extrabold mb-1" style={{ color: t.dark }}>Kurva Berat Badan</p>
                  <p className="text-[11px] mb-4" style={{ color: t.muted }}>kg · per minggu ANC</p>
                  {chartData.length >= 1 ? (
                    <SvgAreaChart
                      data={chartData}
                      seriesKey="bb"
                      seriesName="Berat Badan (kg)"
                      color="#10b981"
                    />
                  ) : (
                    <p className="text-xs py-8 text-center" style={{ color: t.muted }}>Belum cukup data</p>
                  )}
                </Card>
              </div>

              {latest && (
                <p className="text-[11px] text-center" style={{ color: t.muted }}>
                  Data terakhir: Minggu ke-{latest.minggu} · {latest.date}
                </p>
              )}
            </div>
          )}

          {/* ── Catat Vital tab ── */}
          {tab === "input" && (
            <div>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: t.muted }}>
                Isi data dari hasil pemeriksaan ANC atau pengukuran mandiri.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { key:"td",     label:"Tekanan Darah", placeholder:"cth: 118/76", hint:"mmHg"  },
                  { key:"bb",     label:"Berat Badan",   placeholder:"cth: 68.5",   hint:"kg"    },
                  { key:"fundus", label:"Tinggi Fundus", placeholder:"cth: 32",     hint:"cm"    },
                  { key:"gerakan",label:"Gerakan Janin", placeholder:"cth: 8-10",   hint:"/2jam" },
                  { key:"hb",     label:"Hemoglobin",    placeholder:"cth: 11.8",   hint:"g/dL"  },
                ].map(({ key, label, placeholder, hint }) => (
                  <div key={key}>
                    <label className="text-[11px] font-bold block mb-1" style={{ color: t.dark }}>{label}</label>
                    {key === "td" ? (
                      <div className="relative flex items-center rounded-xl border-2 pr-12 transition-all overflow-hidden"
                        style={{ borderColor: form.td ? t.primary : t.border, background: t.soft, color: t.dark }}>
                        <input className="w-full bg-transparent text-center outline-none py-2.5 text-sm placeholder:text-gray-400"
                          placeholder="118" value={form.td.split('/')[0] || ""}
                          onChange={e => { const sys = e.target.value.replace(/\D/g,"").slice(0,3); const dia = form.td.split('/')[1]||""; setF("td", sys||dia?`${sys}/${dia}`:""); }} />
                        <span className="text-sm font-black opacity-30">/</span>
                        <input className="w-full bg-transparent text-center outline-none py-2.5 text-sm placeholder:text-gray-400"
                          placeholder="76" value={form.td.split('/')[1] || ""}
                          onChange={e => { const sys = form.td.split('/')[0]||""; const dia = e.target.value.replace(/\D/g,"").slice(0,3); setF("td", sys||dia?`${sys}/${dia}`:""); }} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: t.muted }}>{hint}</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <input className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border-2 transition-all pr-12"
                          style={{ borderColor: form[key as keyof typeof form] ? t.primary : t.border, background: t.soft, color: t.dark }}
                          placeholder={placeholder} value={form[key as keyof typeof form]}
                          onChange={e => {
                            let v = e.target.value;
                            if (key==="bb"||key==="fundus"||key==="hb") { v=v.replace(/[^\d.]/g,""); if(v.split(".").length>2) v=v.substring(0,v.length-1); }
                            else if (key==="gerakan") v=v.replace(/[^\d-]/g,"");
                            setF(key as keyof typeof form, v);
                          }} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: t.muted }}>{hint}</span>
                      </div>
                    )}
                  </div>
                ))}
                <div>
                  <label className="text-[11px] font-bold block mb-1" style={{ color: t.dark }}>Protein Urin</label>
                  <select className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border-2 transition-all"
                    style={{ borderColor: t.border, background: t.soft, color: t.dark }}
                    value={form.protein} onChange={e => setF("protein", e.target.value)}>
                    {["Negatif", "+", "++", "+++"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-[11px] font-bold block mb-1" style={{ color: t.dark }}>Catatan Tambahan (opsional)</label>
                <textarea rows={2} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border-2 transition-all resize-none"
                  style={{ borderColor: t.border, background: t.soft, color: t.dark }}
                  placeholder="cth: sedikit pusing, kaki bengkak ringan…"
                  value={form.catatan} onChange={e => setF("catatan", e.target.value)} />
              </div>
              <div className="flex gap-3">
                <PillBtn variant="active" size="md" onClick={handleSave} disabled={!formValid} t={t}>
                  <Check size={15} /> Simpan Data Vital
                </PillBtn>
                <PillBtn variant="outline" size="md" onClick={() => setTab("grafik")} t={t}>Batal</PillBtn>
              </div>
            </div>
          )}

          {/* ── Analisis Tren tab ── */}
          {tab === "analisis" && (() => {
            if (vitalLogs.length === 0) return (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold mb-1" style={{ color: t.muted }}>Belum ada data untuk dianalisis.</p>
                <p className="text-xs" style={{ color: t.muted }}>Catat minimal satu data vital terlebih dahulu.</p>
              </div>
            );

            // ── helpers ──
            function trendArrow(vals: number[]): "naik" | "turun" | "stabil" {
              if (vals.length < 2) return "stabil";
              const delta = vals.at(-1)! - vals.at(-2)!;
              if (delta > 1) return "naik";
              if (delta < -1) return "turun";
              return "stabil";
            }
            const arrowIcon = { naik: "▴", turun: "▾", stabil: "▸" };
            const arrowColor = (trend: "naik"|"turun"|"stabil", goodDir: "turun"|"naik"|"stabil") =>
              trend === "stabil" ? "#6b7280" : trend === goodDir ? "#16a34a" : "#f59e0b";

            // ── blood pressure ──
            const bpEntries = vitalLogs.filter(l => l.td.includes("/"));
            const systolics  = bpEntries.map(l => Number(l.td.split("/")[0]));
            const diastolics = bpEntries.map(l => Number(l.td.split("/")[1]));
            const lastSys  = systolics.at(-1) ?? 0;
            const lastDia  = diastolics.at(-1) ?? 0;
            const bpHigh   = lastSys >= 140 || lastDia >= 90;
            const bpBorder = lastSys >= 130 || lastDia >= 85;
            const bpStatus = bpHigh ? "waspada" : bpBorder ? "perhatian" : "baik";
            const sysTrend = trendArrow(systolics);
            const diaTrend = trendArrow(diastolics);

            // ── weight ──
            const bbEntries = vitalLogs.filter(l => l.bb && Number(l.bb) > 0);
            const bbs = bbEntries.map(l => Number(l.bb));
            const mingguBB = bbEntries.map(l => l.minggu);
            let bbGainPerWeek: number | null = null;
            if (bbs.length >= 2) {
              const dBB = bbs.at(-1)! - bbs.at(-2)!;
              const dW  = Math.max(1, mingguBB.at(-1)! - mingguBB.at(-2)!);
              bbGainPerWeek = dBB / dW;
            }
            const bbTooFast = bbGainPerWeek !== null && bbGainPerWeek > 0.7;
            const bbTooSlow = bbGainPerWeek !== null && bbGainPerWeek < 0.1 && bbGainPerWeek >= 0;
            const bbStatus  = bbTooFast ? "perhatian" : bbTooSlow ? "perhatian" : "baik";
            const bbTrend   = trendArrow(bbs);

            // ── hemoglobin ──
            const hbEntries = vitalLogs.filter(l => l.hb && Number(l.hb) > 0);
            const hbs = hbEntries.map(l => Number(l.hb));
            const lastHb  = hbs.at(-1) ?? null;
            const hbLow   = lastHb !== null && lastHb < 11;
            const hbStatus = hbLow ? (lastHb! < 8 ? "waspada" : "perhatian") : "baik";
            const hbTrend  = trendArrow(hbs);

            // ── protein ──
            const lastProtein = vitalLogs.at(-1)?.protein ?? "Negatif";
            const proteinBad  = lastProtein !== "Negatif";
            const proteinStatus = lastProtein === "+++" || lastProtein === "++" ? "waspada" : proteinBad ? "perhatian" : "baik";

            // ── overall ──
            const allStatuses = [bpStatus, bbStatus, hbStatus, proteinStatus];
            const overallStatus = allStatuses.includes("waspada") ? "waspada" : allStatuses.includes("perhatian") ? "perhatian" : "baik";
            const statusColor  = { baik: "#16a34a", perhatian: "#f59e0b", waspada: "#ef4444" };
            const statusBg     = { baik: "#f0fdf4", perhatian: "#fffbeb", waspada: "#fef2f2" };
            const statusLabel  = { baik: "Semua Indikator Normal", perhatian: "Ada Indikator yang Perlu Diperhatikan", waspada: "Ada Tanda Peringatan — Konsultasikan ke Dokter" };

            const MetricCard = ({ title, value, unit, status, trendLabel, notes }: {
              title: string; value: string; unit?: string; status: "baik"|"perhatian"|"waspada"; trendLabel?: string; notes: string[];
            }) => (
              <div className="rounded-2xl p-5" style={{ background: t.card, boxShadow: `0 2px 12px ${t.shadow}` }}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: t.muted }}>{title}</p>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: statusBg[status], color: statusColor[status] }}>
                    {status === "baik" ? "Normal" : status === "perhatian" ? "Perhatian" : "Waspada"}
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <p className="text-2xl font-extrabold leading-none" style={{ color: t.dark }}>{value}</p>
                  {unit && <p className="text-xs mb-0.5" style={{ color: t.muted }}>{unit}</p>}
                  {trendLabel && (
                    <p className="text-xs font-bold mb-0.5 ml-auto" style={{ color: t.muted }}>{trendLabel}</p>
                  )}
                </div>
                <div className="space-y-1.5 mt-3 pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
                  {notes.map((n, i) => (
                    <p key={i} className="text-[11px] leading-snug" style={{ color: t.muted }}>{n}</p>
                  ))}
                </div>
              </div>
            );

            return (
              <div className="space-y-4">
                {/* Overall banner */}
                <div className="rounded-2xl px-5 py-4 flex items-center gap-4"
                  style={{ background: statusBg[overallStatus], border: `1.5px solid ${statusColor[overallStatus]}25` }}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: statusColor[overallStatus] }} />
                  <div>
                    <p className="text-sm font-extrabold" style={{ color: statusColor[overallStatus] }}>{statusLabel[overallStatus]}</p>
                    <p className="text-xs mt-0.5" style={{ color: t.muted }}>
                      Berdasarkan {vitalLogs.length} catatan · Terakhir: Minggu ke-{vitalLogs.at(-1)?.minggu}
                    </p>
                  </div>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    title="Tekanan Darah"
                    value={bpEntries.length ? `${lastSys}/${lastDia}` : "—"}
                    unit="mmHg"
                    status={bpStatus}
                    trendLabel={bpEntries.length >= 2 ? `Sistolik ${arrowIcon[sysTrend]}  Diastolik ${arrowIcon[diaTrend]}` : undefined}
                    notes={[
                      bpEntries.length >= 2
                        ? `Sistolik ${sysTrend === "stabil" ? "stabil" : sysTrend === "naik" ? "cenderung naik" : "cenderung turun"} dalam ${bpEntries.length} pemeriksaan terakhir.`
                        : "Tambah lebih banyak data untuk melihat tren.",
                      bpHigh
                        ? "Di atas batas normal (≥140/90). Segera konsultasikan ke dokter."
                        : bpBorder
                        ? "Mendekati batas atas normal. Pantau lebih ketat."
                        : "Dalam rentang normal (< 130/85). Pertahankan.",
                    ]}
                  />
                  <MetricCard
                    title="Berat Badan"
                    value={bbs.length ? `${bbs.at(-1)!.toFixed(1)}` : "—"}
                    unit="kg"
                    status={bbStatus}
                    trendLabel={bbs.length >= 2 ? `${bbGainPerWeek! >= 0 ? "+" : ""}${bbGainPerWeek!.toFixed(2)} kg/minggu` : undefined}
                    notes={[
                      bbs.length < 2
                        ? "Butuh minimal 2 data untuk menghitung laju kenaikan."
                        : bbTooFast
                        ? `Kenaikan ${bbGainPerWeek!.toFixed(2)} kg/minggu terlalu cepat (normal 0.3–0.5 kg/minggu).`
                        : bbTooSlow
                        ? `Kenaikan ${bbGainPerWeek!.toFixed(2)} kg/minggu terlalu lambat. Perhatikan asupan nutrisi.`
                        : `Kenaikan ${bbGainPerWeek!.toFixed(2)} kg/minggu dalam rentang normal (0.3–0.5 kg/minggu).`,
                      `Total kenaikan: ${(bbs.at(-1)! - bbs[0]).toFixed(1)} kg sejak data pertama.`,
                    ]}
                  />
                  <MetricCard
                    title="Hemoglobin"
                    value={lastHb !== null ? `${lastHb}` : "—"}
                    unit="g/dL"
                    status={hbStatus}
                    trendLabel={hbs.length >= 2 ? `Tren ${arrowIcon[hbTrend]}` : undefined}
                    notes={[
                      lastHb === null
                        ? "Belum ada data Hb."
                        : lastHb < 8
                        ? "Anemia berat (< 8 g/dL). Perlu penanganan segera."
                        : lastHb < 11
                        ? "Anemia ringan-sedang (< 11 g/dL). Tingkatkan konsumsi zat besi."
                        : "Normal (≥ 11 g/dL). Pertahankan asupan zat besi.",
                      hbs.length >= 2
                        ? `${hbTrend === "naik" ? "Membaik" : hbTrend === "turun" ? "Menurun" : "Stabil"} dibanding pemeriksaan sebelumnya.`
                        : "Tambah lebih banyak data untuk melihat tren.",
                    ]}
                  />
                  <MetricCard
                    title="Protein Urin"
                    value={lastProtein}
                    status={proteinStatus}
                    notes={[
                      lastProtein === "Negatif"
                        ? "Tidak ada protein dalam urin. Normal."
                        : lastProtein === "+"
                        ? "Protein + terdeteksi. Pantau tekanan darah dan beritahu dokter."
                        : `Protein ${lastProtein} — perlu evaluasi lebih lanjut, kemungkinan tanda preeklampsia.`,
                      "Protein urin positif + tekanan darah tinggi = waspada preeklampsia.",
                    ]}
                  />
                </div>

                {/* Rekomendasi */}
                {overallStatus !== "baik" && (
                  <div className="rounded-2xl p-5" style={{ background: t.soft }}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: t.dark }}>Rekomendasi</p>
                    <div className="space-y-2">
                      {bpHigh && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: "#fef2f2", color: "#ef4444" }}>TD</span>
                          <p className="text-xs" style={{ color: t.dark }}>Segera konsultasikan tekanan darah tinggi ke dokter atau bidan sebelum ANC berikutnya.</p>
                        </div>
                      )}
                      {bbTooFast && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: "#fffbeb", color: "#f59e0b" }}>BB</span>
                          <p className="text-xs" style={{ color: t.dark }}>Kurangi asupan gula dan makanan olahan. Pertimbangkan konsultasi gizi.</p>
                        </div>
                      )}
                      {bbTooSlow && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: "#fffbeb", color: "#f59e0b" }}>BB</span>
                          <p className="text-xs" style={{ color: t.dark }}>Pastikan asupan kalori dan protein cukup. Diskusikan dengan bidan di ANC berikutnya.</p>
                        </div>
                      )}
                      {hbLow && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: "#fef2f2", color: "#ef4444" }}>Hb</span>
                          <p className="text-xs" style={{ color: t.dark }}>Konsumsi suplemen zat besi secara rutin dan perbanyak makanan sumber zat besi (daging merah, sayur hijau).</p>
                        </div>
                      )}
                      {proteinBad && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: "#fef2f2", color: "#ef4444" }}>Pro</span>
                          <p className="text-xs" style={{ color: t.dark }}>Protein urin positif harus dilaporkan ke dokter. Jangan tunda jika disertai sakit kepala atau bengkak mendadak.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Riwayat tab ── */}
          {tab === "history" && (
            <div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ borderBottom: `1.5px solid ${t.border}` }}>
                      {[
                        { label: "Waktu", w: "w-[15%]" },
                        { label: "Ibu", w: "w-[20%]" },
                        { label: "Janin", w: "w-[20%]" },
                        { label: "Lab", w: "w-[20%]" },
                        { label: "Catatan", w: "w-[25%]" }
                      ].map(h => (
                        <th key={h.label} className={`text-center pb-3 px-4 text-[12px] font-bold uppercase tracking-widest whitespace-nowrap ${h.w}`} style={{ color: t.muted }}>{h.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((log) => (
                      <tr key={log.id} style={{ borderBottom: `1px solid ${t.border}`, background: "transparent" }}>
                        <td className="py-3 px-4 align-middle text-center min-w-[110px]">
                          <div className="flex flex-col gap-1 items-center justify-center">
                            <span className="text-sm font-bold whitespace-nowrap" style={{ color: t.dark }}>{log.date}</span>
                            <span className="text-[11px] whitespace-nowrap" style={{ color: t.muted }}>Mgg ke-{log.minggu}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 align-middle text-center min-w-[120px]">
                          <div className="flex flex-col gap-1.5 items-center justify-center">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-[11px] uppercase font-bold text-right w-[24px]" style={{ color: t.muted }}>TD</span>
                              <span className="text-[13px] font-bold text-left w-[54px]" style={{ color: t.dark }}>{log.td}</span>
                            </div>
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-[11px] uppercase font-bold text-right w-[24px]" style={{ color: t.muted }}>BB</span>
                              <span className="text-[13px] font-semibold text-left w-[54px]" style={{ color: t.dark }}>{log.bb} <span className="text-[11px] font-normal" style={{ color: t.muted }}>kg</span></span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 align-middle text-center min-w-[120px]">
                          <div className="flex flex-col gap-1.5 items-center justify-center">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-[11px] uppercase font-bold text-right w-[28px]" style={{ color: t.muted }}>TFU</span>
                              <span className="text-[13px] font-semibold text-left w-[50px]" style={{ color: t.dark }}>{log.fundus ? `${log.fundus} cm` : "—"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-[11px] uppercase font-bold text-right w-[28px]" style={{ color: t.muted }}>Ger</span>
                              <span className="text-[13px] font-semibold text-left w-[50px]" style={{ color: t.dark }}>{log.gerakan ? `${log.gerakan}` : "—"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 align-middle text-center min-w-[120px]">
                          <div className="flex flex-col gap-1.5 items-center justify-center">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-[11px] uppercase font-bold text-right w-[24px]" style={{ color: t.muted }}>Hb</span>
                              <span className="text-[13px] font-semibold text-left w-[46px]" style={{ color: t.dark }}>{log.hb ? `${log.hb}` : "—"}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block whitespace-nowrap mx-auto"
                              style={{ background: log.protein === "Negatif" ? "#f0fdf4" : "#fef2f2", color: log.protein === "Negatif" ? "#22c55e" : "#ef4444" }}>
                              {log.protein === "Negatif" ? "Prot: (-)" : `Prot: ${log.protein}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 align-middle text-center">
                          <p className="text-xs leading-relaxed line-clamp-2 mx-auto" style={{ color: t.muted }} title={log.catatan}>
                            {log.catatan || "—"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {vitalLogs.length === 0 && (
                <p className="text-center text-sm py-8" style={{ color: t.muted }}>Belum ada data. Klik "+ Catat Vital Baru" untuk mulai.</p>
              )}
            </div>
          )}
        </Card>

        {/* PDF preview — shown only when user clicks Ekspor PDF */}
        {showPdf && (
          <div className="mt-5">
            <MedicalReportPreview t={t} vitalLogs={vitalLogs} weeksPreg={weeksPreg} dueDate={dueDate} />
          </div>
        )}
      </div>
    </div>
  );
}

