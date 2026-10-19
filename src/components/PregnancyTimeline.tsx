import React from "react";
import { HeartPulse, Sparkles, Footprints, Droplet, Eye, Baby, CalendarHeart } from "lucide-react";
import { Theme } from "../types";
import { SectionTitle } from "./SectionTitle";

const TOTAL_WEEKS = 40;

// Batas trimester mengikuti perhitungan di App: T1 < 13, T2 < 27, T3 sisanya
const TRIMESTERS = [
  { label: "Trimester 1", from: 1,  to: 12 },
  { label: "Trimester 2", from: 13, to: 26 },
  { label: "Trimester 3", from: 27, to: TOTAL_WEEKS },
];

// Momen penting — tampil sebagai ikon di dalam blok minggu, penjelasan muncul saat hover/klik
const MILESTONES: Record<number, { title: string; desc: string; Icon: React.ElementType }> = {
  6:  { title: "Detak jantung", desc: "Detak jantung janin mulai bisa terlihat lewat USG.", Icon: HeartPulse },
  12: { title: "Organ utama terbentuk", desc: "Semua organ utama sudah terbentuk; risiko keguguran menurun.", Icon: Sparkles },
  20: { title: "Gerakan pertama", desc: "Bunda mulai bisa merasakan tendangan halus janin.", Icon: Footprints },
  24: { title: "Tes diabetes", desc: "Waktunya tes gula darah (diabetes gestasional), minggu 24–28.", Icon: Droplet },
  28: { title: "Mata membuka", desc: "Bayi mulai membuka mata dan bereaksi terhadap cahaya.", Icon: Eye },
  37: { title: "Cukup bulan", desc: "Bayi dianggap cukup bulan dan siap lahir kapan saja.", Icon: Baby },
  40: { title: "Hari perkiraan lahir", desc: "Minggu HPL — tetap pantau tanda-tanda persalinan.", Icon: CalendarHeart },
};

export function PregnancyTimeline({ t, weeksPreg, daysExtra, daysUntilDue }: {
  t: Theme; weeksPreg: number; daysExtra: number; daysUntilDue: number;
}) {
  const current = Math.min(TOTAL_WEEKS, Math.max(1, weeksPreg));
  const pct = Math.round((Math.min(TOTAL_WEEKS, weeksPreg + daysExtra / 7) / TOTAL_WEEKS) * 100);
  const pastDue = weeksPreg >= TOTAL_WEEKS && daysUntilDue === 0;

  return (
    <div className="rounded-2xl p-6" style={{ background: t.card, boxShadow: `0 2px 16px ${t.shadow}` }}>
      <div className="flex items-start justify-between">
        <SectionTitle>Perjalanan Kehamilan</SectionTitle>
        <p className="text-xs font-semibold -mt-0.5" style={{ color: t.muted }}>
          <span style={{ color: t.active }}>{pct}%</span> perjalanan ·{" "}
          {pastDue ? "sudah melewati HPL" : `${daysUntilDue} hari lagi menuju HPL`}
        </p>
      </div>

      {/* 40 blok minggu, dikelompokkan per trimester */}
      <div className="flex gap-3 pt-7">
        {TRIMESTERS.map(tr => {
          const weeks = Array.from({ length: tr.to - tr.from + 1 }, (_, i) => tr.from + i);
          const activeTri = current >= tr.from && current <= tr.to;
          return (
            <div key={tr.label} className="flex flex-col items-center" style={{ flex: weeks.length }}>
              <div className="w-full flex items-end gap-[3px] h-9">
                {weeks.map(w => {
                  const isNow = w === current;
                  const ms = MILESTONES[w];
                  const isPast = w < current;
                  return (
                    <div key={w} className="group relative flex-1 flex justify-center" title={ms ? undefined : `Minggu ${w}`}>
                      {isNow && (
                        <div className="absolute bottom-full mb-1.5 flex flex-col items-center z-10">
                          <span className="text-[11px] font-bold text-white px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: t.active }}>
                            Minggu {weeksPreg}
                          </span>
                          <span className="w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `5px solid ${t.active}` }} />
                        </div>
                      )}
                      {ms ? (
                        <button type="button" aria-label={`Minggu ${w}: ${ms.title}`}
                          className="w-full rounded-md flex items-center justify-center cursor-pointer transition-all duration-500 outline-none"
                          style={{
                            height: isNow ? 36 : 26,
                            background: isNow ? t.active : isPast ? t.primary : t.soft,
                            boxShadow: isNow ? `0 0 0 3px ${t.active}33` : `inset 0 0 0 1.5px ${isPast || isNow ? "transparent" : t.primary}`,
                          }}>
                          <ms.Icon size={13} strokeWidth={2.4} color={isPast || isNow ? "#fff" : t.active} />
                        </button>
                      ) : (
                        <div className="w-full rounded-md transition-all duration-500"
                          style={{
                            height: isNow ? 36 : 26,
                            background: isNow ? t.active : isPast ? t.primary : t.soft,
                            boxShadow: isNow ? `0 0 0 3px ${t.active}33` : "none",
                          }} />
                      )}
                      {/* pop-up penjelasan: muncul saat hover atau saat ikon diklik/fokus */}
                      {ms && (
                        <div className={`pointer-events-none absolute top-full mt-2 z-20 w-56 rounded-xl p-3 text-left opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 ${w <= 6 ? "left-0" : w >= 36 ? "right-0" : "left-1/2 -translate-x-1/2"}`}
                          style={{ background: "#fff", boxShadow: `0 10px 30px ${t.shadow}, 0 2px 8px rgba(0,0,0,0.06)`, border: `1px solid ${t.border}` }}>
                          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: t.active }}>Minggu {w}</p>
                          <p className="text-[13px] font-bold mt-0.5" style={{ color: t.dark }}>{ms.title}</p>
                          <p className="text-xs leading-snug mt-0.5" style={{ color: "#6b6b6b" }}>{ms.desc}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="mt-3 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: activeTri ? t.soft : "transparent", color: activeTri ? t.active : t.muted }}>
                {tr.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
