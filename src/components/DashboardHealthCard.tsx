import { ChevronRight } from "lucide-react";
import type { Theme } from "../types";
import type { DashboardData } from "../hooks/useDashboardData";
import { summarizeDashboard } from "../utils/dashboardSummary";
import { fmtDate } from "../utils/helpers";
import { Card } from "./Card";
import { SectionTitle } from "./SectionTitle";

export function DashboardHealthCard({ t, data, today, onGoHealth }: {
  t: Theme; data: DashboardData; today: string; onGoHealth: () => void;
}) {
  const summary = summarizeDashboard(data, today);
  return (
    <Card t={t} className="p-6 flex flex-col">
      <SectionTitle>Catatan Kesehatan Ibu</SectionTitle>
      <div className="rounded-2xl p-3 mb-3" style={{ background: t.soft }}>
        <p className="text-sm font-bold" style={{ color: summary.healthColor }}>{summary.healthLabel}</p>
        <p className="text-[11px] mt-1" style={{ color: t.muted }}>
          {summary.activeSymptoms.length ? summary.activeSymptoms.map(symptom => symptom.label).join(", ") : "Berdasarkan data yang dicatat; bukan diagnosis medis."}
        </p>
      </div>
      {[
        { label: "Tekanan darah terakhir", value: summary.latest?.blood_pressure ? `${summary.latest.blood_pressure} mmHg` : "Belum dicatat" },
        { label: "Berat badan terakhir", value: summary.latest?.weight != null ? `${summary.latest.weight} kg` : "Belum dicatat" },
        { label: "Perubahan dari catatan pertama", value: summary.weightChange != null ? `${summary.weightChange >= 0 ? "+" : ""}${summary.weightChange.toFixed(1)} kg` : "Perlu minimal 2 catatan berat" },
        { label: "Gerakan terakhir", value: summary.movementText },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between gap-3 py-2.5 border-b last:border-0" style={{ borderColor: t.border }}>
          <p className="text-xs" style={{ color: t.muted }}>{label}</p>
          <p className="text-xs font-bold text-right" style={{ color: t.dark }}>{value}</p>
        </div>
      ))}
      {summary.latest && <p className="text-[10px] mt-2" style={{ color: t.muted }}>Catatan vital: {fmtDate(new Date(summary.latest.recorded_at))}</p>}
      {summary.movementDate && <p className="text-[10px] mt-1" style={{ color: t.muted }}>Catatan gerakan: {fmtDate(new Date(summary.movementDate))}</p>}
      <button onClick={onGoHealth} className="ui-interactive mt-3 text-xs font-bold flex items-center justify-center gap-1 rounded-full py-2" style={{ background: t.soft, color: t.active }}>
        Lihat detail kesehatan <ChevronRight size={14} />
      </button>
    </Card>
  );
}
