import { useEffect, useState } from "react";
import { CheckCheck, MapPin, Navigation, PhoneCall, Zap } from "lucide-react";
import type { Theme, EmergencyAlert } from "../types";
import { Card } from "../components/Card";
import { SectionTitle } from "../components/SectionTitle";
import { DashboardHealthCard } from "../components/DashboardHealthCard";
import { useDashboardData } from "../hooks/useDashboardData";
import { summarizeDashboard } from "../utils/dashboardSummary";

export function CompanionDashboard({ t, weeksPreg, daysExtra, alert, onAck, motherName, motherPhone, onGoCalendar, onGoHealth, onEmergency }: {
  t: Theme; weeksPreg: number; daysExtra: number; alert: EmergencyAlert | null;
  onAck: (eta: number) => void; motherName?: string; motherPhone: string;
  onGoCalendar: () => void; onGoHealth: () => void; onEmergency: () => void;
}) {
  const dashboard = useDashboardData();
  const summary = dashboard.data ? summarizeDashboard(dashboard.data, dashboard.today) : null;
  const [secondsAgo, setSecondsAgo] = useState(0);
  useEffect(() => {
    if (!alert) return;
    const update = () => setSecondsAgo(Math.max(0, Math.floor((Date.now() - alert.sentAt.getTime()) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [alert]);

  const unavailable = dashboard.error ? "Tidak tersedia" : "Memuat…";
  const status = alert ? "DARURAT" : summary?.healthLabel ?? unavailable;
  const hasCoordinates = alert?.lat != null && alert?.lng != null;
  const tasks = summary ? [
    summary.vitamins.length
      ? (summary.completedVitamins === summary.vitamins.length ? "Semua vitamin hari ini sudah dicatat diminum." : `Ingatkan Bunda: ${summary.vitamins.length - summary.completedVitamins} vitamin belum dicatat diminum hari ini.`)
      : "Belum ada jadwal vitamin tercatat.",
    summary.totalItems ? `Bantu persiapan persalinan: ${summary.completedItems}/${summary.totalItems} barang selesai (${summary.checklistPercent}%).` : "Belum ada daftar persiapan persalinan.",
    summary.nextEvent ? `Dampingi Bunda: ${summary.nextEvent.label}, ${new Date(`${summary.nextEvent.event_date}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}.` : "Belum ada jadwal bersama mendatang.",
    summary.activeSymptoms.length ? `Tanyakan kondisi Bunda terkait gejala yang dicatat: ${summary.activeSymptoms.map(symptom => symptom.label).join(", ")}.` : "Belum ada gejala aktif tercatat hari ini. Tanyakan kabar Bunda.",
  ] : [];

  return (
    <div className="space-y-5 w-full">
      {dashboard.error && <div role="alert" className="rounded-2xl p-4 bg-red-50 text-red-700 text-sm">{dashboard.error} <button onClick={dashboard.retry} className="underline font-bold">Coba lagi</button></div>}

      {alert && (
        <div className="rounded-2xl p-4 flex items-start gap-4" style={{ background: "#fef2f2", border: "2px solid #fca5a5" }}>
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"><Zap size={18} className="text-white" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-red-700">NOTIFIKASI DARURAT dari {motherName || "Bunda"}</p>
            <p className="text-xs text-red-600 mt-0.5">{alert.message}</p>
            <p className="text-[10px] text-red-500 mt-0.5">{secondsAgo < 60 ? `${secondsAgo} detik yang lalu` : `${Math.floor(secondsAgo / 60)} menit yang lalu`} · {alert.location}</p>
          </div>
          {alert.husbandAck && <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-green-50"><CheckCheck size={12} className="text-green-600" /><span className="text-xs font-bold text-green-700">Dikonfirmasi</span></div>}
        </div>
      )}

      <div className="rounded-3xl p-6 flex items-center gap-6" style={{ background: t.grad, boxShadow: `0 4px 24px ${t.shadow}` }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-xl flex-shrink-0" style={{ background: t.active }}>{motherName?.charAt(0).toUpperCase() || "B"}</div>
        <div className="flex-1">
          <p className="text-xs text-white/70">Akun tersinkronisasi</p>
          <p className="text-xl font-extrabold text-white">{motherName || "Bunda"}</p>
          <p className="text-sm text-white/80 mt-0.5">Minggu {weeksPreg}+{daysExtra} · {status}</p>
        </div>
        <div className="flex gap-2">
          {[
            { label: "Vitamin hari ini", value: summary?.vitaminText ?? unavailable },
            { label: "Gerakan terakhir", value: summary?.movementText ?? unavailable },
            { label: "ANC berikutnya", value: summary ? (summary.nextAnc ? new Date(`${summary.nextAnc.event_date}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "Belum dijadwalkan") : unavailable },
          ].map(({ label, value }) => <div key={label} className="text-center rounded-xl px-3 py-2.5 bg-white/10"><p className="text-[10px] text-white/70">{label}</p><p className="text-sm font-bold text-white">{value}</p></div>)}
        </div>
      </div>

      {alert && (
        <div className="grid grid-cols-2 gap-4">
          <Card t={t} className="p-5 space-y-3">
            <SectionTitle>Lokasi saat Darurat Dikirim</SectionTitle>
            <div className="flex items-center gap-2 text-sm" style={{ color: t.dark }}><MapPin size={16} color={t.active} />{alert.location}</div>
            {hasCoordinates ? <>
              <p className="text-xs" style={{ color: t.muted }}>{alert.lat!.toFixed(5)}, {alert.lng!.toFixed(5)}</p>
              <a className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold" style={{ background: t.soft, color: t.active }} href={`https://www.google.com/maps/dir/?api=1&destination=${alert.lat},${alert.lng}`} target="_blank" rel="noreferrer"><Navigation size={14} /> Navigasi ke lokasi Bunda</a>
            </> : <p className="text-xs" style={{ color: t.muted }}>Koordinat lokasi belum dibagikan oleh Bunda.</p>}
            <p className="text-[10px]" style={{ color: t.muted }}>Lokasi tersimpan pada {alert.sentAt.toLocaleString("id-ID")}; tidak menampilkan pelacakan langsung.</p>
          </Card>
          <Card t={t} className="p-5 space-y-3">
            <SectionTitle>Respons Ayah</SectionTitle>
            {!alert.husbandAck ? <>
              <p className="text-xs" style={{ color: t.muted }}>Konfirmasi keberangkatan dan pilih estimasi waktu tiba:</p>
              <div className="grid grid-cols-2 gap-2">{[5, 10, 15, 20].map(eta => <button key={eta} onClick={() => onAck(eta)} className="ui-interactive py-3 rounded-xl font-bold text-white text-sm" style={{ background: t.grad }}>~{eta} menit</button>)}</div>
            </> : <div className="rounded-2xl p-4 bg-green-50 text-green-700"><p className="text-sm font-bold">Keberangkatan dikonfirmasi</p><p className="text-xs">Estimasi waktu tiba: {alert.husbandEta != null ? `~${alert.husbandEta} menit` : "Belum diisi"}</p></div>}
            {motherPhone && <a href={`tel:${motherPhone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 text-xs font-bold" style={{ color: t.active }}><PhoneCall size={14} /> Hubungi Bunda</a>}
            <button onClick={onEmergency} className="ui-interactive text-xs font-bold underline" style={{ color: t.active }}>Buka Mode Darurat</button>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card t={t} className="p-6">
          <SectionTitle>Yang Bisa Ayah Lakukan Sekarang</SectionTitle>
          {summary ? <div className="space-y-3">{tasks.map((task, index) => <div key={task} className="flex items-start gap-3 rounded-2xl p-3" style={{ background: t.soft }}><span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold" style={{ background: t.primary }}>{index + 1}</span><p className="text-sm leading-snug" style={{ color: t.dark }}>{task}</p></div>)}</div> : <p className="text-sm" style={{ color: t.muted }}>{dashboard.error ? "Data belum tersedia" : "Memuat data Ibu…"}</p>}
        </Card>
        <Card t={t} className="p-5">
          <SectionTitle>Jadwal Bersama</SectionTitle>
          {!summary ? <p className="text-sm" style={{ color: t.muted }}>{dashboard.error ? "Jadwal belum dapat dimuat" : "Memuat jadwal…"}</p> : summary.upcoming.length ? <div className="space-y-3">{summary.upcoming.slice(0, 3).map((event, index) => {
            const date = new Date(`${event.event_date}T00:00:00`);
            return <button key={event.id} onClick={onGoCalendar} className="w-full flex items-center gap-3 rounded-2xl p-3 text-left" style={{ background: t.soft }}><div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white" style={{ background: index === 0 ? t.active : t.primary }}><p className="text-[9px] leading-none opacity-70">{date.toLocaleDateString("id-ID", { month: "short" })}</p><p className="text-sm font-bold leading-none">{date.getDate()}</p></div><div><p className="text-sm font-semibold" style={{ color: t.dark }}>{event.label}</p>{event.notes && <p className="text-[11px]" style={{ color: t.muted }}>{event.notes}</p>}</div></button>;
          })}</div> : <p className="text-sm" style={{ color: t.muted }}>Belum ada jadwal bersama mendatang.</p>}
          <button onClick={onGoCalendar} className="ui-interactive mt-4 text-xs font-bold" style={{ color: t.active }}>Lihat kalender</button>
        </Card>
        {dashboard.data ? <DashboardHealthCard t={t} data={dashboard.data} today={dashboard.today} onGoHealth={onGoHealth} /> : <Card t={t} className="p-6"><SectionTitle>Catatan Kesehatan Ibu</SectionTitle><p className="text-sm" style={{ color: t.muted }}>{dashboard.error ? "Data belum tersedia" : "Memuat data Ibu…"}</p></Card>}
      </div>
    </div>
  );
}
