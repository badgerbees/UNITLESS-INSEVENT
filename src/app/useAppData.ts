import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { api, ApiError } from "../services/api";
import { DEFAULT_VITAMINS } from "../pages/HealthScreen";
import type { CustomSymptom, EmergencyAlert, Mode, Risk, UserProfile, VitalLog, Vitamin } from "../types";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage tidak tersedia */ }
}

export function useAppData(user: User | null, mode: Mode) {
  const [hasPregnancy, setHasPregnancy] = useState<boolean | null>(null);
  const [companionConnected, setCompanionConnected] = useState(false);
  const [alert, setAlert] = useState<EmergencyAlert | null>(null);
  const [vitalLogs, setVitalLogs] = useState<VitalLog[]>([]);
  const [vitDone, setVitDone] = useState<Record<string, boolean>>({});
  const [symptoms, setSymptoms] = useState<Record<string, boolean>>({});
  const [vitamins, setVitamins] = useState<Vitamin[]>(() => loadJSON("vitamins", DEFAULT_VITAMINS));
  const [customSymptoms, setCustomSymptoms] = useState<CustomSymptom[]>(() => loadJSON("customSymptoms", []));
  const [userProfile, setUserProfile] = useState<UserProfile>({
    motherName: "Bunda Sari",
    fatherName: "Ayah Ahmad",
    email: "bunda.sari@email.com",
    phone: "0812-3456-7890",
    hphtDate: "2024-12-01",
    hospital: "RSIA Bunda Jakarta",
    doctor: "dr. Ratna, Sp.OG",
    bloodType: "A+",
    syncCode: "MELA-8821",
    syncCodeExpiresAt: "",
    notifVitamin: true,
    notifAnc: true,
    notifEmergencySound: true,
    notifWeeklyReport: true,
  });

  useEffect(() => { saveJSON("vitamins", vitamins); }, [vitamins]);
  useEffect(() => { saveJSON("customSymptoms", customSymptoms); }, [customSymptoms]);

  useEffect(() => {
    if (!user) { setHasPregnancy(null); return; }
    let active = true;
    Promise.all([
      api.getMe(),
      api.getCurrentPregnancy().catch(error => (error instanceof ApiError && error.status === 404 ? null : Promise.reject(error))),
      api.getPregnancyMembers().catch(error => (error instanceof ApiError && error.status === 404 ? null : Promise.reject(error))),
    ])
      .then(([profile, pregnancy, memberResult]) => {
        if (!active) return;
        const mother = memberResult?.members.find(member => member.role === "mother");
        const companion = memberResult?.members.find(member => member.role === "companion");
        setHasPregnancy(Boolean(pregnancy));
        setCompanionConnected(Boolean(pregnancy?.companion_id));
        setUserProfile(previous => ({
          ...previous,
          motherName: mother?.full_name || (profile.role === "mother" ? profile.full_name || previous.motherName : previous.motherName),
          fatherName: companion?.full_name || (profile.role === "companion" ? profile.full_name || previous.fatherName : previous.fatherName),
          email: user.email || previous.email,
          phone: profile.phone || previous.phone,
          hphtDate: pregnancy?.hpht_date || previous.hphtDate,
          hospital: pregnancy?.hospital || previous.hospital,
          doctor: pregnancy?.doctor || previous.doctor,
          bloodType: pregnancy?.blood_type || previous.bloodType,
          syncCode: pregnancy?.sync_code || previous.syncCode,
          syncCodeExpiresAt: pregnancy?.sync_code_expires_at || previous.syncCodeExpiresAt,
          notifVitamin: profile.notif_vitamin,
          notifAnc: profile.notif_anc,
          notifEmergencySound: profile.notif_emergency_sound,
          notifWeeklyReport: profile.notif_weekly_report,
        }));
      })
      .catch(error => console.error("Failed to load account data", error));
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    if (!user || hasPregnancy !== true) return;
    let active = true;
    Promise.all([
      api.getVitals().catch(error => (error instanceof ApiError && error.status === 404 ? [] : Promise.reject(error))),
      api.getVitamins().catch(error => (error instanceof ApiError && error.status === 404 ? [] : Promise.reject(error))),
      api.getSymptoms().catch(error => (error instanceof ApiError && error.status === 404 ? [] : Promise.reject(error))),
      api.getVitaminLogs().catch(error => (error instanceof ApiError && error.status === 404 ? [] : Promise.reject(error))),
    ])
      .then(([remoteVitals, remoteVitamins, remoteSymptoms, remoteVitaminLogs]) => {
        if (!active) return;
        setVitalLogs(remoteVitals.map(vital => ({
          id: vital.id,
          date: new Date(vital.recorded_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          minggu: vital.pregnancy_week,
          td: vital.blood_pressure,
          bb: vital.weight == null ? "" : String(vital.weight),
          fundus: vital.fundal_height == null ? "" : String(vital.fundal_height),
          gerakan: vital.fetal_movement || "",
          hb: vital.hemoglobin == null ? "" : String(vital.hemoglobin),
          protein: vital.urine_protein,
          catatan: vital.notes || "",
        })));
        if (remoteVitamins.length > 0) setVitamins(remoteVitamins.map(v => ({ id: v.id, label: v.label, dose: v.dose || "", color: v.color })));
        setSymptoms(Object.fromEntries(remoteSymptoms.map(symptom => [symptom.symptom_code, symptom.is_active])));
        setVitDone(Object.fromEntries(remoteVitaminLogs.map(log => [log.vitamin_id, true])));
      })
      .catch(error => console.error("Failed to load health data", error));
    return () => { active = false; };
  }, [user?.id, hasPregnancy]);

  function addVital(vital: VitalLog) {
    setVitalLogs(previous => [...previous, vital]);
    void api.createVital({
      pregnancy_week: vital.minggu,
      blood_pressure: vital.td,
      weight: vital.bb ? Number(vital.bb) : null,
      fundal_height: vital.fundus ? Number(vital.fundus) : null,
      fetal_movement: vital.gerakan || null,
      hemoglobin: vital.hb ? Number(vital.hb) : null,
      urine_protein: vital.protein,
      notes: vital.catatan || null,
    }).catch(error => console.error("Failed to save vital", error));
  }

  function toggleVitamin(vitaminId: string, completed: boolean) {
    setVitDone(previous => ({ ...previous, [vitaminId]: completed }));
    const request = completed ? api.logVitamin(vitaminId) : api.unlogVitamin(vitaminId);
    void request.catch(error => console.error("Failed to save vitamin log", error));
  }

  function toggleSymptom(symptomCode: string, active: boolean, label: string, riskLevel: Risk) {
    setSymptoms(previous => ({ ...previous, [symptomCode]: active }));
    void api.updateSymptom(symptomCode, { label, risk_level: riskLevel, is_active: active })
      .catch(error => console.error("Failed to save symptom", error));
  }

  async function unpairPregnancy() {
    await api.unpairPregnancy();
    setCompanionConnected(false);
    setUserProfile(previous => ({ ...previous, syncCode: "", syncCodeExpiresAt: "" }));
    if (mode === "companion") setHasPregnancy(false);
  }

  async function saveVitamins(next: Vitamin[]) {
    const previous = vitamins;
    setVitamins(next);
    const nextIds = new Set(next.map(vitamin => vitamin.id));
    const isPersisted = (id: string) => /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id);
    try {
      await Promise.all(previous
        .filter(vitamin => isPersisted(vitamin.id) && !nextIds.has(vitamin.id))
        .map(vitamin => api.deleteVitamin(vitamin.id)));

      const persisted = await Promise.all(next.map(async vitamin => {
        if (isPersisted(vitamin.id)) {
          return api.updateVitamin(vitamin.id, { label: vitamin.label, dose: vitamin.dose, color: vitamin.color });
        }
        return api.createVitamin({ label: vitamin.label, dose: vitamin.dose, color: vitamin.color });
      }));
      setVitamins(persisted.map(vitamin => ({ id: vitamin.id, label: vitamin.label, dose: vitamin.dose || "", color: vitamin.color })));
    } catch (error) {
      console.error("Failed to save vitamins", error);
    }
  }

  return {
    hasPregnancy,
    companionConnected,
    alert, setAlert, vitalLogs, vitDone, setVitDone, symptoms, setSymptoms,
    vitamins, setVitamins, customSymptoms, setCustomSymptoms, userProfile, setUserProfile,
    addVital, toggleVitamin, toggleSymptom, saveVitamins,
    unpairPregnancy,
    handleAck: () => setAlert(previous => previous ? { ...previous, husbandAck: true } : null),
    handleSetEta: (minutes: number) => setAlert(previous => previous ? { ...previous, husbandEta: minutes } : null),
  };
}
