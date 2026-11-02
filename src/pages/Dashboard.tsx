import { useState } from "react";
import { Check, Hourglass, Layers, Scale, Ruler, Pill, ClipboardList, ChevronRight, CalendarDays } from "lucide-react";
import type { Theme } from "../types";
import { FruitIllustration } from "../components/FruitIllustration";
import { OrganChip } from "../components/OrganChip";
import { OrganIllustration, OrganKey } from "../components/OrganIllustration";
import { StatTile } from "../components/StatTile";
import { PregnancyTimeline } from "../components/PregnancyTimeline";
import { SectionTitle } from "../components/SectionTitle";
import { Card } from "../components/Card";
import { fmtDate, getFruit } from "../utils/helpers";
import type { CalendarEvent } from "../services/api";
import { useDashboardData } from "../hooks/useDashboardData";
import { summarizeDashboard } from "../utils/dashboardSummary";
import { DashboardHealthCard } from "../components/DashboardHealthCard";

// Label & warna tipe acara, sama seperti di halaman Kalender
const EVENT_TYPE: Record<CalendarEvent["event_type"], { label: string; color?: string }> = {
  anc: { label: "ANC", color: "#14b8a6" },
  vitamin: { label: "Vitamin", color: "#22c55e" },
  hpl: { label: "HPL", color: "#f59e0b" },
  other: { label: "Lainnya" },
};


function daysUntil(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const today = new Date();
  const diff = Math.round((new Date(y, m - 1, d).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
  return diff === 0 ? "Hari ini" : diff === 1 ? "Besok" : `${diff} hari lagi`;
}


// Rentang minggu kasar dari mulai terbentuk hingga matang, untuk bar estimasi kematangan
const ORGAN_RANGE: Record<OrganKey, [number, number]> = {
  brain: [3, 40], heart: [3, 34], lungs: [5, 37], eye: [4, 34], bone: [6, 40], limb: [4, 12], gut: [4, 36],
};

function organMaturity(organ: OrganKey, weeks: number) {
  const [start, end] = ORGAN_RANGE[organ];
  return Math.round(Math.min(1, Math.max(0.05, (weeks - start) / (end - start))) * 100);
}

const TRIMESTER_TIPS: Record<number, string[]> = {
  1: [
    "Konsumsi asam folat 400 mcg setiap hari.",
    "Mual pagi wajar — makan porsi kecil tapi sering.",
    "Istirahat cukup dan hindari asap rokok.",
  ],
  2: [
    "Mulai latihan pernapasan ringan dan senam hamil.",
    "Ajak janin bicara — ia sudah bisa mendengar suara Bunda.",
    "Penuhi kebutuhan zat besi dan kalsium harian.",
  ],
  3: [
    "Pantau gerakan janin setiap hari (min. 10 gerakan / 2 jam).",
    "Siapkan tas persalinan dan dokumen penting.",
    "Kenali tanda persalinan aktif: kontraksi teratur & pecah ketuban.",
  ],
};

export function getOrganData(weeks: number) {
  if (weeks <= 8) return [
    { organ: "brain" as OrganKey, label: "Otak",    desc: "Tabung saraf menutup dan otak mulai membentuk tiga bagian utama: otak depan, tengah, dan belakang." },
    { organ: "heart" as OrganKey, label: "Jantung", desc: "Jantung sudah berdetak! Tabung jantung sederhana mulai memompa darah pertama kalinya." },
    { organ: "eye" as OrganKey, label: "Mata",    desc: "Cekungan mata mulai terbentuk sebagai bintik-bintik gelap di kedua sisi kepala." },
    { organ: "limb" as OrganKey, label: "Kuncup",  desc: "Kuncup lengan dan kaki mulai muncul. Tangan dan kaki berbentuk seperti dayung kecil." },
    { organ: "gut" as OrganKey, label: "Organ",   desc: "Usus, hati, dan ginjal primitif mulai terbentuk dari lapisan sel dalam." },
  ];
  if (weeks <= 13) return [
    { organ: "brain" as OrganKey, label: "Otak",    desc: "Otak berkembang pesat — neuron terbentuk jutaan per menit. Refleks dasar mulai aktif." },
    { organ: "heart" as OrganKey, label: "Jantung", desc: "Empat ruang jantung terbentuk. Detak dapat terdeteksi jelas lewat USG Doppler." },
    { organ: "lungs" as OrganKey, label: "Paru",    desc: "Tunas paru-paru mulai bercabang membentuk bronkus. Belum berfungsi, tapi sudah ada." },
    { organ: "eye" as OrganKey, label: "Mata",    desc: "Kelopak mata terbentuk dan menutup untuk melindungi retina yang sedang berkembang." },
    { organ: "bone" as OrganKey, label: "Tulang",  desc: "Tulang rawan mulai mengeras menjadi tulang sejati. Jari tangan dan kaki sudah terpisah." },
  ];
  if (weeks <= 19) return [
    { organ: "brain" as OrganKey, label: "Otak",    desc: "Permukaan otak mulai menunjukkan lekukan awal. Bayi sudah bisa merasakan sentuhan ringan." },
    { organ: "heart" as OrganKey, label: "Jantung", desc: "Jantung berdetak 140–170 kali/menit. Suaranya bisa didengar dengan stetoskop biasa." },
    { organ: "lungs" as OrganKey, label: "Paru",    desc: "Cabang bronkus terbentuk lebih banyak. Paru masih belum bisa bernapas udara." },
    { organ: "eye" as OrganKey, label: "Mata",    desc: "Alis dan bulu mata mulai tumbuh. Mata masih menutup rapat di balik kelopak." },
    { organ: "bone" as OrganKey, label: "Tulang",  desc: "Kerangka tulang semakin kuat. Gerakan janin mulai terasa sebagai 'flutter' halus." },
  ];
  if (weeks <= 27) return [
    { organ: "brain" as OrganKey, label: "Otak",    desc: "Otak menyimpan memori dan mulai mengatur ritme tidur-bangun. Bayi bisa kaget oleh suara keras." },
    { organ: "heart" as OrganKey, label: "Jantung", desc: "Sistem kardiovaskular matang. Jantung memompa sekitar 25 liter darah per hari." },
    { organ: "lungs" as OrganKey, label: "Paru",    desc: "Surfaktan mulai diproduksi — zat penting agar kantung udara tidak kolaps saat lahir." },
    { organ: "eye" as OrganKey, label: "Mata",    desc: "Mata mulai membuka! Pupil bereaksi terhadap cahaya yang menembus dinding perut." },
    { organ: "bone" as OrganKey, label: "Tulang",  desc: "Sumsum tulang mulai memproduksi sel darah merah. Kalsium dari ibu diserap aktif." },
  ];
  if (weeks <= 35) return [
    { organ: "brain" as OrganKey, label: "Otak",    desc: "Korteks serebral berkembang pesat — otak mulai membentuk lipatan yang meningkatkan kapasitas pemrosesan." },
    { organ: "heart" as OrganKey, label: "Jantung", desc: "Jantung berdetak 120–160 kali/menit. Empat ruang jantung sudah terbentuk sempurna." },
    { organ: "lungs" as OrganKey, label: "Paru",    desc: "Paru-paru berlatih bernapas dengan menghirup cairan amnion. Surfaktan terus meningkat." },
    { organ: "eye" as OrganKey, label: "Mata",    desc: "Mata bisa merespons perubahan cahaya yang masuk melalui dinding perut ibu." },
    { organ: "bone" as OrganKey, label: "Tulang",  desc: "Tulang semakin mengeras. Kalsium dari asupan ibu sangat penting pada fase ini." },
  ];
  return [
    { organ: "brain" as OrganKey, label: "Otak",    desc: "Otak hampir sempurna — lipatan kortikal matang. Bayi sudah belajar dari stimulasi suara dan cahaya." },
    { organ: "heart" as OrganKey, label: "Jantung", desc: "Sistem sirkulasi siap mandiri. Setelah lahir, foramen ovale jantung akan menutup otomatis." },
    { organ: "lungs" as OrganKey, label: "Paru",    desc: "Paru-paru sudah matang dan siap bernapas udara. Produksi surfaktan optimal untuk kelahiran." },
    { organ: "eye" as OrganKey, label: "Mata",    desc: "Penglihatan fokus ±20–30 cm — tepat jarak dari muka ibu saat menyusui." },
    { organ: "bone" as OrganKey, label: "Tulang",  desc: "Tengkorak masih lunak untuk memudahkan persalinan. Tulang-tulang lain sudah keras dan siap." },
  ];
}

export function MotherDashboard({ t, weeksPreg, daysExtra, daysUntilDue, dueDate, fruit, trimester, onEmergency, onGoHealth, onGoCalendar, motherName }: {
  t: Theme; weeksPreg: number; daysExtra: number; daysUntilDue: number;
  dueDate: Date; fruit: ReturnType<typeof getFruit>; trimester: number;
  onEmergency: () => void; onGoHealth: () => void; onGoCalendar: () => void;
  motherName?: string;
}) {
  const [activeChip, setActiveChip] = useState(0);
  const [showOrgans, setShowOrgans] = useState(false);
  const chips = getOrganData(weeksPreg);
  const dashboard = useDashboardData();
  const summary = dashboard.data ? summarizeDashboard(dashboard.data, dashboard.today) : null;
  const nextEvent = { loading: !dashboard.data && !dashboard.error, event: summary?.nextEvent ?? null };
  const eventDate = nextEvent.event ? new Date(`${nextEvent.event.event_date}T00:00:00`) : null;
  const eventType = nextEvent.event ? EVENT_TYPE[nextEvent.event.event_type] : null;

  return (
    <div className="space-y-6 w-full">
      {dashboard.error && <div role="alert" className="rounded-2xl p-4 bg-red-50 text-red-700 text-sm">{dashboard.error} <button onClick={dashboard.retry} className="underline font-bold">Coba lagi</button></div>}
      {/* Salam — di luar kartu hero */}
      <div>
        <h2 className="text-2xl font-extrabold" style={{ color: t.dark }}>Selamat Datang, {motherName || "Bunda"}</h2>
        <p className="text-sm mt-0.5" style={{ color: t.muted }}>Semoga Bunda dan si kecil sehat selalu hari ini.</p>
      </div>

      {/* Hero */}
      <div className="rounded-3xl overflow-hidden flex" style={{ background: t.grad }}>
        <div className="flex-1 px-8 py-7">
          <p className="text-sm font-semibold mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>Usia kehamilan</p>
          <p className="text-[2.1rem] font-extrabold text-white leading-tight">
            Minggu ke-<span style={{ color: "rgba(255,255,255,0.85)" }}>{weeksPreg}</span>
            <span className="text-lg font-semibold ml-2" style={{ color: "rgba(255,255,255,0.5)" }}>+ {daysExtra} hari</span>
          </p>
          <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>HPL: {fmtDate(dueDate)}</p>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => { setShowOrgans(v => !v); setActiveChip(0); }}
              className="ui-interactive rounded-full px-6 py-2.5 text-[13px] font-bold flex items-center gap-2"
              style={{ background: showOrgans ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.22)", color: "#fff" }}>
              {showOrgans ? "Tutup Perkembangan" : "Lihat Perkembangan"}
            </button>
            <button onClick={onEmergency}
              className="ui-interactive rounded-full px-6 py-2.5 text-[13px] font-bold"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
              Darurat
            </button>
          </div>
        </div>
        {/* Clickable fruit */}
        <button
          onClick={() => { setShowOrgans(v => !v); setActiveChip(0); }}
          className="flex flex-col items-center justify-center px-9 py-5 transition-all group relative"
          style={{ background: showOrgans ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)" }}
          title="Lihat perkembangan organ minggu ini"
        >
          <div
            className="w-[84px] h-[84px] mb-2.5 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
            style={{
              background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.75) 60%, rgba(255,255,255,0.35) 100%)",
              boxShadow: showOrgans ? "0 0 0 5px rgba(255,255,255,0.25), 0 6px 18px rgba(0,0,0,0.12)" : "0 6px 18px rgba(0,0,0,0.12)",
            }}>
            <div className="w-14 h-14"><FruitIllustration type={fruit.typeId} /></div>
          </div>
          <p className="text-sm font-bold text-white text-center">{fruit.name}</p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>{fruit.weight} · {fruit.length}</p>
        </button>
      </div>

      {/* Organ panel — slides in below hero when fruit is clicked */}
      {showOrgans && (
        <Card t={t} className="p-6" style={{ borderLeft: `4px solid ${t.active}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: "#4A4E4D", opacity: 0.6 }}>Perkembangan Organ — Minggu {weeksPreg}</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4"><FruitIllustration type={fruit.typeId} /></div>
                <p className="text-xs" style={{ color: t.muted }}>{fruit.name} · {fruit.weight} · {fruit.length}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3 mb-4">
            {chips.map((c, i) => (
              <OrganChip key={i} organ={c.organ} label={c.label} active={activeChip === i} onClick={() => setActiveChip(i)} t={t} />
            ))}
          </div>
          {(() => {
            const c = chips[activeChip];
            const pct = organMaturity(c.organ, weeksPreg);
            return (
              <div key={activeChip} className="organ-fade-in rounded-2xl px-6 py-5 flex items-center gap-6"
                style={{ background: `linear-gradient(135deg, ${t.soft} 0%, #fff 100%)`, border: `1px solid ${t.border}` }}>
                <div className="relative shrink-0 w-24 h-24 rounded-full bg-white flex items-center justify-center">
                  {/* cincin kematangan */}
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="46" stroke={t.border} strokeWidth="4" fill="none" />
                    <circle cx="50" cy="50" r="46" stroke={t.active} strokeWidth="4" fill="none" strokeLinecap="round"
                      strokeDasharray={`${(pct / 100) * 289} 289`} style={{ transition: "stroke-dasharray 0.6s ease" }} />
                  </svg>
                  <div className="w-10 h-10">
                    <OrganIllustration organ={c.organ} color={t.active} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-extrabold" style={{ color: t.dark }}>{c.label}</p>
                  <p className="text-sm leading-relaxed mt-1" style={{ color: "#6b6b6b" }}>{c.desc}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] font-semibold mb-1.5" style={{ color: t.muted }}>
                      <span>Estimasi kematangan</span>
                      <span style={{ color: t.active }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: t.border }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: t.grad, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>
      )}

      {/* Timeline 40 minggu */}
      <PregnancyTimeline t={t} weeksPreg={weeksPreg} daysExtra={daysExtra} daysUntilDue={daysUntilDue} />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatTile icon={Hourglass} label="Sisa Hari"    value={daysUntilDue} sub="hari lagi"       t={t} accent />
        <StatTile icon={Layers}    label="Trimester"    value={trimester}    sub="dari 3"          t={t} />
        <StatTile icon={Scale}     label="Berat Janin"  value={fruit.weight} sub="estimasi"        t={t} />
        <StatTile icon={Ruler}     label="Panjang Janin" value={fruit.length} sub="estimasi"       t={t} />
      </div>

      {/* Bottom grid — 3 kartu sama lebar */}
      <div className="grid grid-cols-3 gap-4">
        <Card t={t} className="p-6 flex flex-col">
          <SectionTitle>Tips Trimester {trimester}</SectionTitle>
          <ul className="space-y-2.5 mb-5">
            {TRIMESTER_TIPS[trimester].map(tip => (
              <li key={tip} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-px" style={{ background: t.soft }}>
                  <Check size={12} color={t.active} strokeWidth={3} />
                </span>
                <span className="text-sm leading-relaxed" style={{ color: "#6b6b6b" }}>{tip}</span>
              </li>
            ))}
          </ul>
          <div onClick={onGoCalendar} role="link" tabIndex={0}
            onKeyDown={e => { if (e.key === "Enter") onGoCalendar(); }}
            className="mt-auto rounded-2xl p-4 flex items-center gap-4 cursor-pointer" style={{ background: t.soft }}>
            <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0" style={{ background: t.grad }}>
              {eventDate ? (
                <>
                  <span className="text-[10px] font-semibold leading-none uppercase">{eventDate.toLocaleDateString("id-ID", { month: "short" })}</span>
                  <span className="text-xl font-extrabold leading-none mt-0.5">{eventDate.getDate()}</span>
                </>
              ) : (
                <CalendarDays size={22} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <CalendarDays size={13} color={t.active} />
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: t.active }}>Jadwal Berikutnya</p>
                {eventType && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: eventType.color ?? t.primary }}>
                    {eventType.label}
                  </span>
                )}
              </div>
              {nextEvent.loading ? (
                <p className="text-sm" style={{ color: t.muted }}>Memuat jadwal…</p>
              ) : dashboard.error ? (
                <p className="text-sm" style={{ color: t.muted }}>Jadwal belum dapat dimuat</p>
              ) : nextEvent.event && eventDate ? (
                <>
                  <p className="text-sm font-bold truncate" style={{ color: t.dark }}>{nextEvent.event.label}</p>
                  <p className="text-xs truncate" style={{ color: t.muted }}>
                    {daysUntil(nextEvent.event.event_date)} · {eventDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                    {nextEvent.event.notes ? ` · ${nextEvent.event.notes}` : ""}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold" style={{ color: t.dark }}>Belum ada jadwal</p>
                  <p className="text-xs" style={{ color: t.muted }}>Tambahkan jadwal kontrol atau acara di Kalender</p>
                </>
              )}
            </div>
            <button onClick={e => { e.stopPropagation(); onGoCalendar(); }}
              className="ui-interactive text-xs font-bold px-4 py-2 rounded-full flex-shrink-0 bg-white" style={{ color: t.active }}>
              {!nextEvent.loading && !nextEvent.event ? "Tambah" : "Detail"}
            </button>
          </div>
        </Card>

        {/* Pemantauan harian — shortcut ke halaman Kesehatan */}
        {(() => {
          if (!summary) return <Card t={t} className="p-6"><SectionTitle>Pemantauan Harian</SectionTitle><p className="text-sm" style={{ color: t.muted }}>{dashboard.error ? "Data belum tersedia" : "Memuat data Ibu…"}</p></Card>;
          const TOTAL_VIT = summary.vitamins.length;
          const vitCount = summary.completedVitamins;
          const symCount = summary.activeSymptoms.length;
          const vitAllDone = TOTAL_VIT > 0 && vitCount === TOTAL_VIT;
          const symLogged  = symCount > 0;
          const shortcuts = [
            {
              Icon: Pill, title: "Vitamin hari ini",
              text: TOTAL_VIT ? `${vitCount} dari ${TOTAL_VIT} sudah diminum` : "Belum ada vitamin",
              done: vitAllDone, pct: TOTAL_VIT ? (vitCount / TOTAL_VIT) * 100 : 0,
            },
            {
              Icon: ClipboardList, title: "Log gejala",
              text: symLogged ? `${symCount} gejala dicatat hari ini` : "Belum diisi hari ini",
              done: symLogged, pct: symLogged ? 100 : 0,
            },
          ];
          return (
            <Card t={t} className="p-6 flex flex-col">
              <SectionTitle>Pemantauan Harian</SectionTitle>
              <div className="flex flex-col gap-3 flex-1">
                {shortcuts.map(({ Icon, title, text, done, pct }) => (
                  <button key={title} onClick={onGoHealth}
                    className="flex-1 flex flex-col justify-center rounded-2xl p-4 text-left"
                    style={{ background: done ? "#f0fdf4" : t.soft }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: done ? "#22c55e" : "#fff" }}>
                        {done ? <Check size={18} className="text-white" /> : <Icon size={18} color={t.active} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: done ? "#166534" : t.dark }}>{title}</p>
                        <p className="text-xs" style={{ color: t.muted }}>{text}</p>
                      </div>
                      <ChevronRight size={16} color={t.muted} />
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mt-3" style={{ background: done ? "#dcfce7" : "#fff" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: done ? "#22c55e" : t.active }} />
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          );
        })()}

        {dashboard.data ? <DashboardHealthCard t={t} data={dashboard.data} today={dashboard.today} onGoHealth={onGoHealth} /> : <Card t={t} className="p-6"><SectionTitle>Catatan Kesehatan Ibu</SectionTitle><p className="text-sm" style={{ color: t.muted }}>{dashboard.error ? "Data belum tersedia" : "Memuat data Ibu…"}</p></Card>}
      </div>
    </div>
  );
}

export { CompanionDashboard } from "./CompanionDashboard";
