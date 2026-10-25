import React, { useState, useEffect } from "react";
import { Theme, VitalLog, EmergencyAlert, Risk, Mode } from "../types";
import { Card } from "../components/Card";
import { PillBtn } from "../components/PillBtn";
import { SectionTitle } from "../components/SectionTitle";
import { StatTile } from "../components/StatTile";
import { fmtDate, addDays, localIsoDate } from "../utils/helpers";
import { api, ApiError } from "../services/api";
import {
  Home, Activity, Calendar, FileText, Package, Bell,
  Plus, Minus, Check, X, AlertTriangle, Download, Baby,
  PhoneCall, ArrowRight, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, Search, Heart,
  MapPin, Navigation, Send, CheckCheck, Clock, Zap, Printer, Mail, Lock, LogOut, Settings, History, Users, Scissors, Droplets, Brain, HeartPulse, Eye, Bone, Wind, Activity as ActivityIcon,
  User, Smartphone, Copy, Headphones, MessageCircle, HelpCircle
} from "lucide-react";
type CalEvent = { id?: string; date: string; label: string; type: "anc" | "vitamin" | "hpl" | "other"; notes?: string; completed?: boolean };


export function CalendarScreen({ t, dueDate, weeksPreg, daysUntilDue, trimester }: {
  t: Theme; dueDate: Date; weeksPreg: number; daysUntilDue: number; trimester: number;
}) {
  const today      = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  // Tanggal lokal (bukan UTC) agar "hari ini" benar untuk WIB sebelum pukul 07.00
  const todayIso = localIsoDate(today);
  const [selectedDay, setSelectedDay] = useState<string | null>(todayIso);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());

  const [listTab, setListTab] = useState<"upcoming" | "history">("upcoming");

  const [events, setEvents] = useState<CalEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", label: "", type: "anc" as CalEvent["type"] });

  useEffect(() => {
    let active = true;
    api.getCalendarEvents()
      .then(remoteEvents => {
        if (!active) return;
        setEvents(remoteEvents.map(event => ({
          id: event.id,
          date: event.event_date,
          label: event.label,
          type: event.event_type,
          notes: event.notes || undefined,
          completed: event.completed,
        })));
      })
      .catch(error => {
        if (!(error instanceof ApiError && error.status === 404)) console.error("Failed to load calendar events", error);
      });
    return () => { active = false; };
  }, []);

  async function addEvent() {
    if (!form.date || !form.label) return;
    const localId = `local-${Date.now()}`;
    setEvents(p => [...p, { id: localId, ...form }]);
    setForm({ date: selectedDay ?? "", label: "", type: "anc" });
    setShowForm(false);
    try {
      const event = await api.createCalendarEvent({ event_date: form.date, label: form.label, event_type: form.type });
      setEvents(previous => previous.map(item => item.id === localId ? {
        id: event.id,
        date: event.event_date,
        label: event.label,
        type: event.event_type,
        notes: event.notes || undefined,
        completed: event.completed,
      } : item));
    } catch (error) {
      console.error("Failed to save calendar event", error);
    }
  }
  function deleteEvent(idx: number) {
    const event = events[idx];
    setEvents(p => p.filter((_, i) => i !== idx));
    if (event?.id && !event.id.startsWith("local-")) {
      void api.deleteCalendarEvent(event.id).catch(error => console.error("Failed to delete calendar event", error));
    }
  }

  const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const DAYS_ID   = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDays   = new Date(viewYear, viewMonth, 0).getDate();

  function isoDate(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  function eventsOn(iso: string) { return events.filter(e => e.date === iso); }

  function navigate(dir: number) {
    let m = viewMonth + dir, y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setViewMonth(m); setViewYear(y);
  }

  const hplIso    = localIsoDate(dueDate);
  // Selisih hari kalender dari hari ini ke HPL (negatif = sudah lewat)
  const daysToHpl = Math.round((new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime()
    - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 864e5);
  const selEvents = selectedDay ? eventsOn(selectedDay) : [];

  const typeColor: Record<CalEvent["type"], string> = {
    anc:    "#14b8a6", // Teal/Tosca yang lebih terang dan cerah
    vitamin:"#22c55e",
    hpl:    "#f59e0b",
    other:  t.primary,
  };
  const typeLabel: Record<CalEvent["type"], string> = {
    anc:    "ANC",
    vitamin:"Vitamin",
    hpl:    "HPL",
    other:  "Lainnya",
  };

  // Build grid: 6 rows × 7 cols
  const cells: { iso: string; day: number; cur: boolean }[] = [];
  for (let i = 0; i < firstDay; i++) {
    const d = prevDays - firstDay + i + 1;
    cells.push({ iso: isoDate(viewYear, viewMonth - 1, d), day: d, cur: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: isoDate(viewYear, viewMonth, d), day: d, cur: true });
  }
  while (cells.length % 7 !== 0) {
    const d = cells.length - daysInMonth - firstDay + 1;
    cells.push({ iso: isoDate(viewYear, viewMonth + 1, d), day: d, cur: false });
  }

  return (
    <div className="space-y-5 w-full">
      {/* HPL banner — redesigned */}
      <div className="rounded-3xl overflow-hidden" style={{ background: t.grad }}>
        <div className="flex items-stretch">
          {/* Left — main info */}
          <div className="flex-1 px-8 py-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              Perkiraan Persalinan (HPL)
            </p>
            <p className="text-3xl font-extrabold text-white leading-tight">{fmtDate(dueDate)}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                {daysToHpl > 0 ? `${daysToHpl} hari lagi` : daysToHpl === 0 ? "Hari ini HPL" : `Lewat ${-daysToHpl} hari dari HPL`}
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                Trimester {trimester}
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                Minggu ke-{weeksPreg}
              </span>
            </div>
          </div>

          {/* Right — stats strip */}
              <div className="flex divide-x" style={{ borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
            {(daysToHpl >= 0 ? [
              { label: "Sisa Hari",   value: daysToHpl },
              { label: "Sisa Minggu", value: Math.ceil(daysToHpl / 7) },
              { label: "Trimester",   value: trimester },
            ] : [
              { label: "Hari Lewat HPL", value: -daysToHpl },
              { label: "Trimester",      value: trimester },
            ]).map(s => (
              <div key={s.label} className="flex flex-col items-center justify-center px-7 py-4 gap-1"
                style={{ borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
                <p className="text-2xl font-extrabold text-white leading-none">{s.value}</p>
                <p className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</p>
              </div>
            ))}

            {/* Calendar icon — jumps to HPL month */}
            <button
              onClick={() => { setViewYear(dueDate.getFullYear()); setViewMonth(dueDate.getMonth()); }}
              title="Pergi ke bulan HPL"
              className="ui-interactive flex flex-col items-center justify-center px-6 py-4 gap-1.5"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.12)" }}>
              <Calendar size={22} color="#fff" />
              <p className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.65)" }}>Lihat HPL</p>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* Full monthly calendar */}
        <Card t={t} className="p-6">
          {/* Header & Legend */}
          <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: `1px solid ${t.border}` }}>
            <div className="flex gap-4">
              {[
                { color: "#14b8a6", label: "Jadwal ANC" },
                { color: "#f59e0b", label: "HPL"        },
                { color: t.primary, label: "Lainnya"    },
              ].map(leg => (
                <div key={leg.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: leg.color }} />
                  <span className="text-[11px] font-semibold" style={{ color: t.muted }}>{leg.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setForm(f => ({ ...f, date: selectedDay ?? isoDate(viewYear, viewMonth, today.getDate()) })); setShowForm(v => !v); }}
              className="ui-interactive flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: showForm ? t.active : t.soft, color: showForm ? "#fff" : t.active }}>
              {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Batal Tambah" : "Tambah Jadwal"}
            </button>
          </div>

          {/* Month / Year nav */}
          {/* Judul bulan (klik = pilih bulan/tahun) di kiri; navigasi per bulan & "Hari ini" dikelompokkan di kanan */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { setShowPicker(p => !p); setPickerYear(viewYear); }}
              title="Pilih bulan & tahun" aria-expanded={showPicker}
              className="flex items-center gap-1 -ml-3 pl-3 pr-2 py-1.5 rounded-xl font-extrabold text-lg transition-colors hover:bg-black/5"
              style={{ background: showPicker ? t.soft : undefined, color: t.dark }}>
              {MONTHS_ID[viewMonth]} {viewYear}
              <ChevronDown size={18} color={t.muted}
                className="transition-transform duration-200" style={{ transform: showPicker ? "rotate(180deg)" : undefined }} />
            </button>

            <div className="flex items-center gap-2">
              {(viewMonth !== today.getMonth() || viewYear !== today.getFullYear() || selectedDay !== todayIso) && (
                <button onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDay(todayIso); setShowPicker(false); }}
                  className="ui-interactive text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: t.soft, color: t.active }}>
                  Hari ini
                </button>
              )}
              <button onClick={() => navigate(-1)} aria-label="Bulan sebelumnya"
                className="ui-interactive w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: t.soft }}>
                <ChevronLeft size={16} color={t.active} />
              </button>
              <button onClick={() => navigate(1)} aria-label="Bulan berikutnya"
                className="ui-interactive w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: t.soft }}>
                <ChevronRight size={16} color={t.active} />
              </button>
            </div>
          </div>

          {/* Month / Year Picker Panel */}
          {showPicker && (
            <div className="mb-4 rounded-3xl p-5 shadow-sm transition-all" style={{ background: t.soft, border: `1px solid ${t.border}` }}>
              {/* Baris tahun: ‹ 2026 › — format sama dengan navigasi bulan di kalender */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setPickerYear(y => y - 1)} aria-label="Tahun sebelumnya"
                  className="ui-interactive w-8 h-8 rounded-full flex items-center justify-center" style={{ background: t.card }}>
                  <ChevronLeft size={16} color={t.active} />
                </button>
                <p className="text-base font-extrabold" style={{ color: t.dark }}>{pickerYear}</p>
                <button onClick={() => setPickerYear(y => y + 1)} aria-label="Tahun berikutnya"
                  className="ui-interactive w-8 h-8 rounded-full flex items-center justify-center" style={{ background: t.card }}>
                  <ChevronRight size={16} color={t.active} />
                </button>
              </div>
              {/* Month grid */}
              <div className="grid grid-cols-4 gap-2">
                {MONTHS_ID.map((m, i) => {
                  const isSelected = i === viewMonth && pickerYear === viewYear;
                  // Bulan berjalan diberi garis tepi agar mudah ditemukan saat berpindah tahun
                  const isCurrent = i === today.getMonth() && pickerYear === today.getFullYear();
                  return (
                    <button key={m} onClick={() => { setViewMonth(i); setViewYear(pickerYear); setShowPicker(false); }}
                      className="py-2 rounded-xl text-xs font-bold"
                      style={{
                        background: isSelected ? t.active : t.card,
                        color: isSelected ? "#fff" : isCurrent ? t.active : t.dark,
                        border: `1.5px solid ${isCurrent && !isSelected ? t.active : "transparent"}`,
                        boxShadow: isSelected ? `0 4px 12px ${t.shadow}` : `0 2px 6px ${t.shadow}`,
                      }}>
                      {m.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_ID.map(d => (
              <div key={d} className="text-center py-1">
                <span className="text-[11px] font-bold" style={{ color: t.muted }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              const events   = eventsOn(cell.iso);
              const isToday  = cell.iso === todayIso;
              const isSel    = cell.iso === selectedDay;
              
              const isHpl    = cell.iso === hplIso;
              const mainEvent = events.find(e => e.type === "hpl") || (isHpl ? { type: "hpl" as const } : undefined) || events.find(e => e.type === "anc") || events[0];

              let bg = "transparent";
              let borderCol = "transparent";
              let textCol = t.dark;

              if (isSel) {
                bg = t.active;
                textCol = "#fff";
              } else if (mainEvent) {
                bg = typeColor[mainEvent.type] + "15"; // Very soft background
                borderCol = typeColor[mainEvent.type] + "40"; // Slight border
                textCol = typeColor[mainEvent.type];
              } else if (isToday) {
                bg = t.soft;
                textCol = t.active;
              }

              return (
                <button key={idx} onClick={() => cell.cur && setSelectedDay(cell.iso)} title={isHpl ? "Perkiraan persalinan (HPL)" : undefined}
                  className="flex flex-col items-center justify-center rounded-xl py-1.5 px-1 min-h-[52px]"
                  style={{
                    background: bg,
                    border: `1.5px solid ${borderCol}`,
                    opacity: cell.cur ? 1 : 0.3,
                    cursor: cell.cur ? "pointer" : "default",
                  }}
                >
                  <span className="text-[13px] font-bold leading-none"
                    style={{ color: textCol }}>
                    {cell.day}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected day events */}
          <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${t.border}` }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: t.muted }}>
                {selectedDay
                  ? new Date(selectedDay + "T00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })
                  : "Pilih tanggal"}
              </p>
            </div>

            {showForm ? (
              <div className="mb-4 p-5 rounded-2xl" style={{ background: t.soft }}>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold block mb-1.5" style={{ color: t.dark }}>Keterangan Jadwal</label>
                    <input
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border-2 transition-all"
                      style={{ borderColor: form.label ? t.primary : t.border, background: t.card, color: t.dark }}
                      placeholder="cth: ANC Minggu 32 – Biometri"
                      value={form.label}
                      onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold block mb-1.5" style={{ color: t.dark }}>Kategori</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["anc", "hpl", "other"] as CalEvent["type"][]).map(tp => (
                        <button key={tp} onClick={() => setForm(f => ({ ...f, type: tp }))}
                          className="py-2.5 rounded-xl text-[11px] font-bold border"
                          style={{
                            background: form.type === tp ? typeColor[tp] : t.card,
                            color: form.type === tp ? "#fff" : t.muted,
                            borderColor: form.type === tp ? "transparent" : t.border,
                          }}>
                          {typeLabel[tp]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={addEvent} disabled={!form.date || !form.label}
                    className="ui-interactive w-full py-3 rounded-xl text-sm font-bold mt-2 flex items-center justify-center gap-2"
                    style={{ background: form.date && form.label ? t.active : t.border, color: "#fff" }}>
                    <Check size={16} /> Simpan Jadwal
                  </button>
                </div>
              </div>
            ) : (
              <>
                {selectedDay === hplIso && !selEvents.some(e => e.type === "hpl") && (
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2" style={{ background: "#fff7ed", border: "1.5px solid #fcd34d" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg">🌟</div>
                    <div>
                      <p className="text-sm font-bold text-orange-700">Perkiraan persalinan (HPL)</p>
                      <p className="text-[11px] text-orange-500">Dihitung otomatis dari HPHT</p>
                    </div>
                  </div>
                )}
                {selectedDay && selEvents.length === 0 && selectedDay !== hplIso && (
                  <p className="text-xs" style={{ color: t.muted }}>Tidak ada jadwal. Klik "Tambah Jadwal" untuk menambahkan.</p>
                )}
                <div className="space-y-2">
                  {selEvents.map((ev, i) => {
                    const globalIdx = events.indexOf(ev);
                    if (ev.type === "hpl") {
                      return (
                        <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3 relative" style={{ background: "#fff7ed", border: "1.5px solid #fcd34d" }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg">🌟</div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-orange-700">{ev.label}</p>
                            <p className="text-[11px] text-orange-500">Perkiraan kelahiran si kecil</p>
                          </div>
                          <button onClick={() => deleteEvent(globalIdx)}
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:bg-orange-200"
                            style={{ color: "#d97706" }}>
                            <X size={12} />
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3"
                        style={{ background: t.soft }}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: typeColor[ev.type] }} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: t.dark }}>{ev.label}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: typeColor[ev.type] }}>
                          {typeLabel[ev.type]}
                        </span>
                        <button onClick={() => deleteEvent(globalIdx)}
                          className="w-6 h-6 rounded-full flex items-center justify-center ml-1 transition-all hover:bg-red-100"
                          style={{ color: "#ef4444" }}>
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Right sidebar: event lists (Tabs) */}
        <div className="space-y-4">
          <Card t={t} className="p-5 h-full flex flex-col">
            <div className="flex rounded-full p-1 gap-1 mb-4" style={{ background: "#f2f2f2" }}>
              <button onClick={() => setListTab("upcoming")}
                className="flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: listTab === "upcoming" ? t.active : "transparent",
                  color: listTab === "upcoming" ? "#fff" : t.muted,
                  boxShadow: listTab === "upcoming" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                }}>
                Mendatang
              </button>
              <button onClick={() => setListTab("history")}
                className="flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: listTab === "history" ? t.active : "transparent",
                  color: listTab === "history" ? "#fff" : t.muted,
                  boxShadow: listTab === "history" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                }}>
                Riwayat
              </button>
            </div>

            <div className="space-y-2 mt-1 overflow-y-auto pr-1 flex-1" style={{ maxHeight: 'calc(100vh - 280px)', scrollbarWidth: "thin" }}>
              {listTab === "upcoming" && (
                <>
                  {[...events]
                    .filter(ev => ev.date >= todayIso)
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((ev, i) => {
                    const globalIdx = events.indexOf(ev);
                    return (
                      <div key={`up-${i}`}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer"
                        style={{ background: t.soft }}
                        onClick={() => { setSelectedDay(ev.date); setViewYear(parseInt(ev.date.slice(0,4))); setViewMonth(parseInt(ev.date.slice(5,7)) - 1); }}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: typeColor[ev.type] }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold truncate" style={{ color: t.dark }}>{ev.label}</p>
                          <p className="text-[10px]" style={{ color: t.muted }}>
                            {new Date(ev.date + "T00:00").toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                          </p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); deleteEvent(globalIdx); }}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-100 transition-all flex-shrink-0"
                          style={{ color: "#ef4444" }}>
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                  {events.filter(ev => ev.date >= todayIso).length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: t.muted }}>Tidak ada jadwal mendatang.</p>
                  )}
                </>
              )}

              {listTab === "history" && (
                <>
                  {[...events]
                    .filter(ev => ev.date < todayIso)
                    .sort((a, b) => b.date.localeCompare(a.date)) // Sort descending for history
                    .map((ev, i) => {
                    const globalIdx = events.indexOf(ev);
                    return (
                      <div key={`hist-${i}`}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer opacity-60"
                        style={{ background: t.soft }}
                        onClick={() => { setSelectedDay(ev.date); setViewYear(parseInt(ev.date.slice(0,4))); setViewMonth(parseInt(ev.date.slice(5,7)) - 1); }}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: typeColor[ev.type] }} />
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-[11px] font-semibold truncate" style={{ color: t.dark }}>{ev.label}</p>
                          <p className="text-[10px]" style={{ color: t.muted }}>
                            {new Date(ev.date + "T00:00").toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {events.filter(ev => ev.date < todayIso).length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: t.muted }}>Belum ada riwayat jadwal.</p>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

