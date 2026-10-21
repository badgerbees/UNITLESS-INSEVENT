import React, { useState, useEffect } from "react";
import { Check, CheckCheck, Zap, Navigation, Heart, Hourglass, Layers, Scale, Ruler, Pill, ClipboardList, ChevronRight, CalendarDays } from "lucide-react";
import { Theme, EmergencyAlert, Vitamin } from "../types";
import { FruitIllustration } from "../components/FruitIllustration";
import { OrganChip } from "../components/OrganChip";
import { OrganIllustration, OrganKey } from "../components/OrganIllustration";
import { StatTile } from "../components/StatTile";
import { PregnancyTimeline } from "../components/PregnancyTimeline";
import { SectionTitle } from "../components/SectionTitle";
import { PillBtn } from "../components/PillBtn";
import { Card } from "../components/Card";
import { fmtDate, getFruit } from "../utils/helpers";


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

export function MotherDashboard({ t, weeksPreg, daysExtra, daysUntilDue, dueDate, fruit, trimester, onEmergency, onGoHealth, vitDone, vitamins, symptoms, motherName }: {
  t: Theme; weeksPreg: number; daysExtra: number; daysUntilDue: number;
  dueDate: Date; fruit: ReturnType<typeof getFruit>; trimester: number;
  onEmergency: () => void; onGoHealth: () => void;
  vitDone: Record<string, boolean>; vitamins: Vitamin[]; symptoms: Record<string, boolean>;
  motherName?: string;
}) {
  const [activeChip, setActiveChip] = useState(0);
  const [showOrgans, setShowOrgans] = useState(false);
  const chips = getOrganData(weeksPreg);

  return (
    <div className="space-y-6 w-full">
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
              className="rounded-full px-6 py-2.5 text-[13px] font-bold transition-all flex items-center gap-2"
              style={{ background: showOrgans ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.22)", color: "#fff" }}>
              {showOrgans ? "Tutup Perkembangan" : "Lihat Perkembangan"}
            </button>
            <button onClick={onEmergency}
              className="rounded-full px-6 py-2.5 text-[13px] font-bold transition-all"
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
          <div className="mt-auto rounded-2xl p-4 flex items-center gap-4" style={{ background: t.soft }}>
            <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0" style={{ background: t.grad }}>
              <span className="text-[10px] font-semibold leading-none uppercase">Jan</span>
              <span className="text-xl font-extrabold leading-none mt-0.5">23</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <CalendarDays size={13} color={t.active} />
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: t.active }}>ANC Berikutnya</p>
              </div>
              <p className="text-sm font-bold" style={{ color: t.dark }}>Tes Diabetes Gestasional</p>
              <p className="text-xs" style={{ color: t.muted }}>RSIA Bunda · Minggu 24–28</p>
            </div>
            <button className="text-xs font-bold px-4 py-2 rounded-full flex-shrink-0 bg-white" style={{ color: t.active }}>Detail</button>
          </div>
        </Card>

        {/* Pemantauan harian — shortcut ke halaman Kesehatan */}
        {(() => {
          const TOTAL_VIT = vitamins.length;
          const vitCount  = vitamins.filter(v => vitDone[v.id]).length;
          const symCount  = Object.values(symptoms).filter(Boolean).length;
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
                    className="flex-1 flex flex-col justify-center rounded-2xl p-4 text-left transition-all hover:brightness-[0.98]"
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

        <Card t={t} className="p-6 flex flex-col">
          <SectionTitle>Status Kesehatan</SectionTitle>
          <div className="flex items-center gap-3 rounded-2xl p-3 mb-3" style={{ background: "#f0fdf4" }}>
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-700">Normal</p>
              <p className="text-[11px] text-green-600">Tidak ada tanda bahaya</p>
            </div>
          </div>
          <div className="flex-1">
            {[
              { l: "Tekanan Darah", v: "118/76 mmHg" },
              { l: "Kenaikan BB",   v: "+11.2 kg"    },
              { l: "Gerakan Janin", v: "8 / 10 kick" },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between py-2.5 border-b last:border-0" style={{ borderColor: t.border }}>
                <p className="text-xs" style={{ color: t.muted }}>{l}</p>
                <p className="text-xs font-bold" style={{ color: t.dark }}>{v}</p>
              </div>
            ))}
          </div>
          <button onClick={onGoHealth} className="mt-3 text-xs font-bold flex items-center justify-center gap-1 rounded-full py-2"
            style={{ background: t.soft, color: t.active }}>
            Lihat detail kesehatan <ChevronRight size={14} />
          </button>
        </Card>
      </div>
    </div>
  );
}

export function CompanionDashboard({ t, weeksPreg, daysExtra, alert, onAck, onSetEta, motherName }: {
  t: Theme; weeksPreg: number; daysExtra: number;
  alert: EmergencyAlert | null;
  onAck: () => void;
  onSetEta: (eta: number) => void;
  motherName?: string;
}) {
  const [paired, setPaired]       = useState(true);
  const [code, setCode]           = useState("");
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [tracking, setTracking]   = useState(false);
  const [pingCount, setPingCount] = useState(0);

  useEffect(() => {
    if (!alert) return;
    const id = setInterval(() => {
      setSecondsAgo(s => s + 1);
      if (tracking) setPingCount(p => p + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [alert, tracking]);

  function handleAck(eta: number) {
    onAck();
    onSetEta(eta);
    setTracking(true);
  }

  if (!paired) {
    return (
      <div className="max-w-md mx-auto space-y-5">
        <div className="rounded-3xl p-10 text-center" style={{ background: t.grad }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
            <Heart size={36} color={t.primary} fill={t.primary} />
          </div>
          <p className="text-2xl font-extrabold text-white">Masuk sebagai Suami</p>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>Masukkan kode sinkronisasi dari aplikasi istri</p>
        </div>
        <Card t={t} className="p-6 space-y-4">
          <p className="text-sm font-bold" style={{ color: t.dark }}>Kode Sinkronisasi</p>
          <input
            className="w-full rounded-full px-5 py-3 text-center text-xl font-black tracking-widest outline-none border-2 transition-all"
            style={{ borderColor: code ? t.primary : t.border, color: t.dark, background: t.soft, fontFamily: "monospace" }}
            placeholder="MELA-XXXX"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={9}
          />
          <PillBtn full variant="primary" size="lg" disabled={code.length < 4} onClick={() => code.length >= 4 && setPaired(true)} t={t}>
            Sambungkan Akun
          </PillBtn>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full">
      {/* Emergency Alert Banner */}
      {alert && (
        <div className="rounded-2xl p-4 flex items-start gap-4 animate-pulse-once"
          style={{ background: "linear-gradient(135deg,#fef2f2,#fff0f0)", border: "2px solid #fca5a5" }}>
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Zap size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-red-700">NOTIFIKASI DARURAT dari Bunda Sari</p>
            <p className="text-xs text-red-600 mt-0.5">"{alert.message}"</p>
            <p className="text-[10px] text-red-400 mt-0.5">
              {secondsAgo < 60 ? `${secondsAgo} detik yang lalu` : `${Math.floor(secondsAgo/60)} menit yang lalu`}
              {" · "}{alert.location}
            </p>
          </div>
          {!alert.husbandAck && (
            <div className="flex gap-2 flex-shrink-0">
              {[5, 10, 15].map(eta => (
                <button key={eta} onClick={() => handleAck(eta)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
                  ~{eta} mnt
                </button>
              ))}
            </div>
          )}
          {alert.husbandAck && (
            <div className="flex items-center gap-1.5 flex-shrink-0 rounded-full px-3 py-1.5" style={{ background: "#f0fdf4" }}>
              <CheckCheck size={12} className="text-green-600" />
              <span className="text-xs font-bold text-green-700">Dikonfirmasi</span>
            </div>
          )}
        </div>
      )}

      {/* Husband status header */}
      <div className="rounded-3xl p-6 flex items-center gap-6" style={{ background: t.grad, boxShadow: `0 4px 24px ${t.shadow}` }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-xl flex-shrink-0" style={{ background: t.active }}>S</div>
        <div className="flex-1">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Akun tersinkronisasi</p>
          <p className="text-xl font-extrabold text-white">{motherName || "Bunda"}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Minggu {weeksPreg}+{daysExtra} · {alert ? "DARURAT" : "Normal"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[{ l: "Vitamin", v: "Sudah" }, { l: "Gerakan", v: "8/10" }, { l: "ANC", v: "23 Jan" }].map(({ l, v }) => (
            <div key={l} className="text-center rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.12)" }}>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{l}</p>
              <p className="text-sm font-bold text-white">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Location Tracker (shows when alert is active) */}
      {alert && (
        <div className="grid grid-cols-2 gap-4">
          {/* Map panel */}
          <Card t={t} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Navigation size={15} color={t.active} />
              <p className="text-sm font-extrabold" style={{ color: t.dark }}>Lacak Lokasi Bunda</p>
              {tracking && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#22c55e" }}>
                  LIVE
                </span>
              )}
            </div>

            {/* Simulated map */}
            <div className="relative rounded-2xl overflow-hidden mb-3" style={{ height: 180, background: "#e8f4e8" }}>
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 180">
                {[30,60,90,120,150,180,210,240,270].map(x => (
                  <line key={x} x1={x} y1={0} x2={x} y2={180} stroke="#c8e6c8" strokeWidth={1} />
                ))}
                {[30,60,90,120,150].map(y => (
                  <line key={y} x1={0} y1={y} x2={300} y2={y} stroke="#c8e6c8" strokeWidth={1} />
                ))}
                {/* Roads */}
                <path d="M 0 95 Q 150 80 300 95" stroke="#d4d4d4" strokeWidth={6} fill="none" />
                <path d="M 130 0 L 130 180" stroke="#d4d4d4" strokeWidth={6} />
                <path d="M 0 95 Q 150 80 300 95" stroke="white" strokeWidth={2} strokeDasharray="8 6" fill="none" />
                {/* Wife location pin - pulsing */}
                <circle cx={155} cy={90} r={tracking ? 14 : 12} fill="rgba(239,68,68,0.15)" />
                <circle cx={155} cy={90} r={tracking ? 8 : 7} fill="rgba(239,68,68,0.3)" />
                <circle cx={155} cy={90} r={5} fill="#ef4444" />
                {/* Husband location */}
                <circle cx={80} cy={120} r={5} fill={t.active} />
                <circle cx={80} cy={120} r={9} fill={t.active} fillOpacity={0.2} />
                {/* Route */}
                <path d="M 80 120 Q 110 105 155 90" stroke={t.active} strokeWidth={2} strokeDasharray="5 4" fill="none" />
                {/* Labels */}
                <text x={163} y={84} fontSize={9} fill="#ef4444" fontWeight="bold">Bunda</text>
                <text x={55} y={136} fontSize={9} fill={t.active} fontWeight="bold">Ayah</text>
              </svg>
              {/* Pulse ring animation */}
              {tracking && (
                <div className="absolute" style={{ left: "calc(155/300*100% - 20px)", top: "calc(90/180*100% - 20px)" }}>
                  <div className="w-10 h-10 rounded-full border-2 border-red-400 animate-ping opacity-50" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { l: "Jarak",    v: `${(2.3 + (tracking ? (pingCount * 0.01) % 0.2 : 0)).toFixed(1)} km` },
                { l: "ETA",      v: alert.husbandEta ? `~${alert.husbandEta} mnt` : "—" },
                { l: "GPS Ping", v: tracking ? `${pingCount}x` : "Off" },
              ].map(({ l, v }) => (
                <div key={l} className="text-center rounded-xl py-2" style={{ background: t.soft }}>
                  <p className="text-[10px]" style={{ color: t.muted }}>{l}</p>
                  <p className="text-sm font-extrabold" style={{ color: t.dark }}>{v}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-2.5 flex items-center gap-2" style={{ background: t.soft }}>
              <MapPin size={12} color={t.active} className="flex-shrink-0" />
              <p className="text-[10px]" style={{ color: t.muted }}>{alert.location}</p>
            </div>
          </Card>

          {/* Response panel */}
          <Card t={t} className="p-5">
            <p className="text-sm font-extrabold mb-3" style={{ color: t.dark }}>Respons Ayah</p>

            {!alert.husbandAck ? (
              <>
                <p className="text-xs mb-3" style={{ color: t.muted }}>Konfirmasi keberangkatan dan estimasi waktu tiba:</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[5, 10, 15, 20].map(eta => (
                    <button key={eta} onClick={() => handleAck(eta)}
                      className="py-3 rounded-xl font-bold text-white transition-all hover:scale-105 text-sm"
                      style={{ background: t.grad }}>
                      ~{eta} menit
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-center" style={{ color: t.muted }}>Pilih estimasi waktu untuk konfirmasi</p>
              </>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl p-4 text-center" style={{ background: "#f0fdf4", border: "1.5px solid #86efac" }}>
                  <CheckCheck size={24} className="text-green-500 mx-auto mb-1" />
                  <p className="text-sm font-extrabold text-green-700">Dalam Perjalanan!</p>
                  <p className="text-xs text-green-600">ETA: ~{alert.husbandEta} menit</p>
                </div>
                <div className="space-y-2">
                  <a href="tel:119" className="flex items-center gap-3 rounded-xl p-3" style={{ background: "#fef2f2" }}>
                    <PhoneCall size={16} color="#ef4444" />
                    <span className="text-sm font-semibold text-red-700">Hubungi 119 (Ambulans)</span>
                  </a>
                  <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: t.soft }}>
                    <Navigation size={16} color={t.active} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: t.dark }}>Navigasi ke lokasi Bunda</p>
                      <p className="text-[10px]" style={{ color: t.muted }}>{alert.location}</p>
                    </div>
                  </div>
                </div>
                {tracking && (
                  <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: t.soft }}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                    <p className="text-xs" style={{ color: t.muted }}>
                      Lokasi Bunda diperbarui tiap 30 detik · Ping #{pingCount}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card t={t} className="col-span-2 p-6">
          <SectionTitle>Yang Bisa Ayah Lakukan Sekarang</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Siapkan makan bergizi untuk Bunda malam ini",
              "Temani Bunda latihan pernapasan 10 menit",
              "Pastikan tas persalinan sudah 80% terpak",
              "Tanyakan kondisi Bunda setelah makan siang",
              "Siapkan rute ke RS rujukan dan cek BBM kendaraan",
              "Simpan nomor dokter di kecepatan panggil",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl p-3" style={{ background: t.soft }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[10px] font-bold" style={{ background: t.primary }}>
                  {i + 1}
                </div>
                <p className="text-sm leading-snug" style={{ color: t.dark }}>{tip}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card t={t} className="p-5">
          <SectionTitle>Jadwal Bersama</SectionTitle>
          <div className="space-y-3">
            {[
              { date: "23 Jan", label: "ANC Trimester 3",  sub: "RSIA Bunda · 10:00",  active: true  },
              { date: "28 Jan", label: "USG Biometri",      sub: "dr. Ratna · 14:00",   active: false },
              { date: "10 Feb", label: "Kelas Persalinan", sub: "Klinik Bunda Sehat",   active: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: t.soft }}>
                <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white" style={{ background: item.active ? t.active : t.primary }}>
                  <p className="text-[9px] leading-none opacity-70">{item.date.split(" ")[1]}</p>
                  <p className="text-sm font-bold leading-none">{item.date.split(" ")[0]}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: t.dark }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: t.muted }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
