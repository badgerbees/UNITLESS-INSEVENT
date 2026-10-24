import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { api, ApiError, type EmergencyAlertRow, type VitalLog as ApiVitalLog } from "../services/api";
import { getSupabaseClient } from "../lib/supabase";
import { auth } from "../services/auth";
import { useToday } from "../hooks/useToday";
import { DEFAULT_VITAMINS } from "../pages/HealthScreen";
import type { CustomSymptom, EmergencyAlert, Risk, UserProfile, VitalLog, Vitamin } from "../types";

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

function toVitalLog(vital: ApiVitalLog): VitalLog {
  return {
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
  };
}

function toEmergencyAlert(row: EmergencyAlertRow | null): EmergencyAlert | null {
  if (!row || row.resolved_at) return null;
  return {
    id: row.id,
    sentAt: new Date(row.created_at),
    trigger: row.trigger,
    location: row.location || "Lokasi tidak tersedia",
    lat: row.lat,
    lng: row.lng,
    message: row.message,
    husbandAck: Boolean(row.acknowledged_at),
    husbandEta: row.eta_minutes,
  };
}

export function useAppData(user: User | null) {
  const [hasPregnancy, setHasPregnancy] = useState<boolean | null>(null);
  // Tanggal lokal user dikirim ke server agar "hari ini" mengikuti WIB, bukan jam UTC server
  const today = useToday();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [pregnancyId, setPregnancyId] = useState<string | null>(null);
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
    notifVitamin: true,
    notifAnc: true,
    notifEmergencySound: true,
    notifWeeklyReport: true,
  });

  useEffect(() => { saveJSON("vitamins", vitamins); }, [vitamins]);
  useEffect(() => { saveJSON("customSymptoms", customSymptoms); }, [customSymptoms]);

  useEffect(() => {
    if (!user) { setHasPregnancy(null); return; }
    setLoadError(null);
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
        setPregnancyId(pregnancy?.id ?? null);
        setUserProfile(previous => ({
          ...previous,
          motherName: mother?.full_name || (profile.role === "mother" ? profile.full_name || previous.motherName : previous.motherName),
          // Setelah data asli dimuat, jangan pakai nilai contoh (mis. "Ayah Ahmad", "RSIA Bunda Jakarta"):
          // kosong berarti memang belum diisi, dan tidak boleh tercetak di dokumen seperti Rencana Persalinan.
          fatherName: companion?.full_name || (profile.role === "companion" ? profile.full_name || "" : ""),
          motherPhone: mother?.phone || "",
          fatherPhone: companion?.phone || "",
          email: user.email || previous.email,
          phone: profile.phone || previous.phone,
          hphtDate: pregnancy?.hpht_date || previous.hphtDate,
          hospital: pregnancy ? pregnancy.hospital || "" : previous.hospital,
          doctor: pregnancy ? pregnancy.doctor || "" : previous.doctor,
          bloodType: pregnancy ? pregnancy.blood_type || "" : previous.bloodType,
          syncCode: pregnancy?.sync_code || previous.syncCode,
          notifVitamin: profile.notif_vitamin,
          notifAnc: profile.notif_anc,
          notifEmergencySound: profile.notif_emergency_sound,
          notifWeeklyReport: profile.notif_weekly_report,
        }));
      })
      .catch(error => {
        console.error("Failed to load account data", error);
        if (!active) return;
        // Sesi tidak lagi diterima backend: keluarkan agar user bisa login ulang, bukan tertahan di layar memuat
        if (error instanceof ApiError && error.status === 401) {
          void auth.clearLocalSession();
          return;
        }
        setLoadError(error instanceof Error ? error.message : "Gagal memuat data akun");
      });
    return () => { active = false; };
  }, [user?.id, reloadKey]);

  useEffect(() => {
    if (!user || hasPregnancy !== true) return;
    let active = true;
    Promise.all([
      api.getVitals().catch(error => (error instanceof ApiError && error.status === 404 ? [] : Promise.reject(error))),
      api.getVitamins().catch(error => (error instanceof ApiError && error.status === 404 ? [] : Promise.reject(error))),
      api.getSymptoms(today).catch(error => (error instanceof ApiError && error.status === 404 ? [] : Promise.reject(error))),
      api.getVitaminLogs(today).catch(error => (error instanceof ApiError && error.status === 404 ? [] : Promise.reject(error))),
    ])
      .then(([remoteVitals, remoteVitamins, remoteSymptoms, remoteVitaminLogs]) => {
        if (!active) return;
        setVitalLogs(remoteVitals.map(toVitalLog));
        if (remoteVitamins.length > 0) setVitamins(remoteVitamins.map(v => ({ id: v.id, label: v.label, dose: v.dose || "", color: v.color })));
        setSymptoms(Object.fromEntries(remoteSymptoms.map(symptom => [symptom.symptom_code, symptom.is_active])));
        setVitDone(Object.fromEntries(remoteVitaminLogs.map(log => [log.vitamin_id, true])));
      })
      .catch(error => console.error("Failed to load health data", error));
    return () => { active = false; };
  }, [user?.id, hasPregnancy, today]); // today: muat ulang (reset) saat hari berganti

  // Alert darurat aktif: dimuat dari server lalu diperbarui realtime untuk ibu & suami
  useEffect(() => {
    if (!user || !pregnancyId) { setAlert(null); return; }
    let active = true;
    const load = () => api.getActiveEmergency()
      .then(row => { if (active) setAlert(toEmergencyAlert(row)); })
      .catch(error => console.error("Failed to load emergency alert", error));

    void load();
    const channel = getSupabaseClient()
      .channel(`emergency:${pregnancyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_alerts", filter: `pregnancy_id=eq.${pregnancyId}` }, () => void load())
      .subscribe();
    return () => {
      active = false;
      void getSupabaseClient().removeChannel(channel);
    };
  }, [user?.id, pregnancyId]);

  async function sendAlert(payload: { message: string; location: string | null; lat: number | null; lng: number | null }) {
    const row = await api.sendEmergency(payload);
    setAlert(toEmergencyAlert(row));
    return row.companion_notified;
  }

  function ackAlert(etaMinutes: number) {
    if (!alert) return;
    setAlert({ ...alert, husbandAck: true, husbandEta: etaMinutes });
    void api.ackEmergency(alert.id, etaMinutes)
      .then(row => setAlert(toEmergencyAlert(row)))
      .catch(error => console.error("Failed to acknowledge emergency", error));
  }

  async function resolveAlert() {
    if (!alert) return;
    await api.resolveEmergency(alert.id);
    setAlert(null);
  }

  // Data vital baru tampil setelah server benar-benar menyimpannya; kegagalan dilempar ke form agar user diberi tahu
  async function addVital(vital: VitalLog) {
    const saved = await api.createVital({
      pregnancy_week: vital.minggu,
      blood_pressure: vital.td,
      weight: vital.bb ? Number(vital.bb) : null,
      fundal_height: vital.fundus ? Number(vital.fundus) : null,
      fetal_movement: vital.gerakan || null,
      hemoglobin: vital.hb ? Number(vital.hb) : null,
      urine_protein: vital.protein,
      notes: vital.catatan || null,
    });
    setVitalLogs(previous => [...previous, toVitalLog(saved)]);
  }

  function toggleVitamin(vitaminId: string, completed: boolean) {
    setVitDone(previous => ({ ...previous, [vitaminId]: completed }));
    const request = completed ? api.logVitamin(vitaminId, today) : api.unlogVitamin(vitaminId, today);
    void request.catch(error => console.error("Failed to save vitamin log", error));
  }

  function toggleSymptom(symptomCode: string, active: boolean, label: string, riskLevel: Risk) {
    setSymptoms(previous => ({ ...previous, [symptomCode]: active }));
    void api.updateSymptom(symptomCode, { label, risk_level: riskLevel, is_active: active, recorded_on: today })
      .catch(error => console.error("Failed to save symptom", error));
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
    hasPregnancy, loadError, retryLoad: () => setReloadKey(k => k + 1),
    alert, sendAlert, ackAlert, resolveAlert, vitalLogs, vitDone, setVitDone, symptoms, setSymptoms,
    vitamins, setVitamins, customSymptoms, setCustomSymptoms, userProfile, setUserProfile,
    addVital, toggleVitamin, toggleSymptom, saveVitamins,
  };
}
