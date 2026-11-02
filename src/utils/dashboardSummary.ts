import type { DashboardData } from "../hooks/useDashboardData";
import { localIsoDate } from "./helpers";

export function summarizeDashboard(data: DashboardData, today: string) {
  const vitals = [...data.vitals].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
  const latest = vitals[vitals.length - 1] ?? null;
  const weights = vitals.map(vital => vital.weight).filter((weight): weight is number => weight != null);
  const weightChange = weights.length >= 2 ? weights[weights.length - 1] - weights[0] : null;
  const vitamins = data.vitamins.filter(vitamin => vitamin.active);
  const completedIds = new Set(data.vitaminLogs.filter(log => log.completed_on === today).map(log => log.vitamin_id));
  const completedVitamins = vitamins.filter(vitamin => completedIds.has(vitamin.id)).length;
  const upcoming = data.events.filter(event => !event.completed && event.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const activeSymptoms = data.symptoms.filter(symptom => symptom.recorded_on === today && symptom.is_active);
  const items = data.checklist.flatMap(category => category.items);
  const completedItems = items.filter(item => item.completed).length;
  const latestKick = data.kickSessions.filter(session => session.ended_at && localIsoDate(new Date(session.ended_at)) === today)
    .sort((a, b) => b.ended_at!.localeCompare(a.ended_at!))[0] ?? null;

  let healthLabel = "Belum ada data kesehatan";
  let healthColor = "#64748b";
  if (activeSymptoms.length) {
    healthLabel = "Ada gejala tercatat";
    healthColor = activeSymptoms.some(symptom => symptom.risk_level === "red") ? "#dc2626" : "#b45309";
  } else if (data.symptoms.some(symptom => symptom.recorded_on === today)) {
    healthLabel = "Tidak ada gejala aktif tercatat";
  } else if (latest) {
    healthLabel = "Catatan kesehatan tersedia";
  }

  return {
    latest, weightChange, activeSymptoms, healthLabel, healthColor,
    vitamins, completedVitamins,
    vitaminText: vitamins.length ? `${completedVitamins}/${vitamins.length} diminum` : "Belum ada vitamin",
    upcoming, nextAnc: upcoming.find(event => event.event_type === "anc") ?? null,
    nextEvent: upcoming[0] ?? null,
    completedItems, totalItems: items.length,
    checklistPercent: items.length ? Math.round(completedItems / items.length * 100) : null,
    movementText: latestKick ? `${latestKick.kick_count} gerakan` : latest?.fetal_movement || "Belum dicatat",
    movementDate: latestKick?.ended_at ?? (latest?.fetal_movement ? latest.recorded_at : null),
  };
}
