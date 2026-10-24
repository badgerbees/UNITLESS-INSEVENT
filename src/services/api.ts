import { getSupabaseClient } from "../lib/supabase";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = (configuredApiUrl || (import.meta.env.DEV ? "http://localhost:8000/api" : "")).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const FIELD_LABELS: Record<string, string> = {
  pregnancy_week: "Minggu kehamilan", blood_pressure: "Tekanan darah", weight: "Berat badan",
  fundal_height: "Tinggi fundus", hemoglobin: "Hemoglobin", fetal_movement: "Gerakan janin", notes: "Catatan",
  duration_seconds: "Durasi", gap_minutes: "Jarak kontraksi", kick_count: "Jumlah gerakan",
};

// Error validasi FastAPI berupa daftar {loc, msg}; ubah jadi kalimat yang bisa dibaca user
function formatValidationErrors(details: { loc?: (string | number)[]; msg?: string; ctx?: { le?: number; ge?: number } }[]) {
  return details.map(d => {
    const field = String(d.loc?.[d.loc.length - 1] ?? "");
    const label = FIELD_LABELS[field] ?? field;
    if (d.ctx?.le !== undefined) return `${label} maksimal ${d.ctx.le}`;
    if (d.ctx?.ge !== undefined) return `${label} minimal ${d.ctx.ge}`;
    return `${label} tidak valid`;
  }).join(", ");
}

// Pesan error yang ramah untuk ditampilkan ke user
export function friendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Sesi login berakhir. Silakan keluar lalu login ulang.";
    if (error.status === 403) return "Hanya akun ibu yang bisa menyimpan data ini.";
    if (error.status === 422) return `Data ditolak server: ${error.message}.`;
    if (error.status >= 500) return "Server sedang bermasalah. Coba lagi beberapa saat lagi.";
    return error.message;
  }
  if (error instanceof TypeError) return "Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.";
  return "Terjadi kesalahan. Coba lagi.";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) {
    throw new Error("VITE_API_URL is required in production.");
  }
  const { data } = await getSupabaseClient().auth.getSession();
  const token = data.session?.access_token;

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    let message = "API request failed";
    try {
      const body = await response.json();
      message = Array.isArray(body.detail) ? formatValidationErrors(body.detail) : body.detail || message;
    } catch {
      // Keep the generic error when the response is not JSON.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "mother" | "companion";
  created_at: string;
  notif_vitamin: boolean;
  notif_anc: boolean;
  notif_emergency_sound: boolean;
  notif_weekly_report: boolean;
};

export type Pregnancy = {
  id: string;
  mother_id: string;
  companion_id: string | null;
  hpht_date: string;
  due_date: string;
  blood_type: string | null;
  hospital: string | null;
  doctor: string | null;
  sync_code: string;
  created_at: string;
};

export type PregnancyMember = Pick<Profile, "id" | "full_name" | "phone" | "role">;

export type VitalLog = {
  id: string;
  recorded_at: string;
  pregnancy_week: number;
  blood_pressure: string;
  weight: number | null;
  fundal_height: number | null;
  fetal_movement: string | null;
  hemoglobin: number | null;
  urine_protein: "Negatif" | "+" | "++" | "+++";
  notes: string | null;
};

export type Vitamin = { id: string; label: string; dose: string | null; color: string; active: boolean };
export type SymptomLog = { id: string; symptom_code: string; label: string; risk_level: "green" | "yellow" | "red"; is_active: boolean; recorded_on: string };
export type CalendarEvent = { id: string; event_date: string; label: string; event_type: "anc" | "vitamin" | "hpl" | "other"; notes: string | null; completed: boolean };
export type ChecklistItem = { id: string; category_id: string; label: string; completed: boolean; position: number };
export type ChecklistCategory = { id: string; name: string; position: number; items: ChecklistItem[] };
export type BirthPlanOption = { id: string; option_key: string; selected: boolean };
export type ReportSummary = {
  total_vitals: number;
  latest: VitalLog | null;
  average_weight: number | null;
  average_hemoglobin: number | null;
  protein_flags: number;
  weeks_recorded: number[];
};

export type KickSession = { id: string; started_at: string; ended_at: string | null; kick_count: number };
export type ContractionSession = { id: string; started_at: string; ended_at: string; duration_seconds: number; gap_minutes: number | null };

export type AppNotification = {
  id: string;
  kind: "emergency" | "emergency_ack" | "emergency_resolved" | "vitamin" | "anc" | "weekly_report" | "info";
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};
export type EmergencyAlertRow = {
  id: string;
  pregnancy_id: string;
  trigger: "manual" | "511" | "symptom";
  message: string;
  location: string | null;
  lat: number | null;
  lng: number | null;
  acknowledged_at: string | null;
  eta_minutes: number | null;
  resolved_at: string | null;
  created_at: string;
};

export const api = {
  getMe: () => request<Profile>("/me"),
  updateMe: (payload: { full_name?: string | null; phone?: string | null }) => request<Profile>("/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),
  updatePreferences: (payload: Partial<Pick<Profile, "notif_vitamin" | "notif_anc" | "notif_emergency_sound" | "notif_weekly_report">>) => request<Profile>("/me/preferences", {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),
  getCurrentPregnancy: () => request<Pregnancy>("/pregnancies/current"),
  getPregnancyMembers: () => request<{ pregnancy_id: string; members: PregnancyMember[] }>("/pregnancies/members"),
  createPregnancy: (payload: {
    hpht_date: string;
    blood_type?: string;
    hospital?: string;
    doctor?: string;
  }) => request<Pregnancy>("/pregnancies", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  updateCurrentPregnancy: (payload: {
    hpht_date?: string;
    blood_type?: string;
    hospital?: string;
    doctor?: string;
  }) => request<Pregnancy>("/pregnancies/current", {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),
  pairPregnancy: (sync_code: string) => request<Pregnancy>("/pregnancies/pair", {
    method: "POST",
    body: JSON.stringify({ sync_code }),
  }),
  unpairPregnancy: () => request<Pregnancy>("/pregnancies/unpair", { method: "POST" }),
  getVitals: () => request<VitalLog[]>("/health/vitals"),
  createVital: (payload: Omit<VitalLog, "id" | "recorded_at"> & { recorded_at?: string }) => request<VitalLog>("/health/vitals", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  getSymptoms: (day?: string) => request<SymptomLog[]>(`/health/symptoms${day ? `?day=${encodeURIComponent(day)}` : ""}`),
  updateSymptom: (code: string, payload: Omit<SymptomLog, "id" | "symptom_code" | "recorded_on"> & { recorded_on?: string }) => request<SymptomLog>(`/health/symptoms/${encodeURIComponent(code)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }),
  getVitamins: () => request<Vitamin[]>("/health/vitamins"),
  createVitamin: (payload: Pick<Vitamin, "label" | "dose" | "color">) => request<Vitamin>("/health/vitamins", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  updateVitamin: (id: string, payload: Partial<Pick<Vitamin, "label" | "dose" | "color" | "active">>) => request<Vitamin>(`/health/vitamins/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),
  deleteVitamin: (id: string) => request<void>(`/health/vitamins/${id}`, { method: "DELETE" }),
  getVitaminLogs: (day?: string) => request<{ vitamin_id: string; completed_on: string }[]>(`/health/vitamins/logs${day ? `?day=${encodeURIComponent(day)}` : ""}`),
  logVitamin: (id: string, completed_on?: string) => request<{ vitamin_id: string; completed_on: string }>(`/health/vitamins/${id}/logs`, {
    method: "PUT",
    body: JSON.stringify({ completed_on }),
  }),
  unlogVitamin: (id: string, day?: string) => request<void>(`/health/vitamins/${id}/logs${day ? `?day=${encodeURIComponent(day)}` : ""}`, { method: "DELETE" }),
  getKickSessions: () => request<KickSession[]>("/health/kick-sessions"),
  getContractionSessions: () => request<ContractionSession[]>("/health/contraction-sessions"),
  createKickSession: (payload: { started_at: string; ended_at?: string; kick_count: number }) => request("/health/kick-sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  createContractionSession: (payload: { started_at: string; ended_at: string; duration_seconds: number; gap_minutes?: number }) => request("/health/contraction-sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  getCalendarEvents: () => request<CalendarEvent[]>("/calendar/events"),
  createCalendarEvent: (payload: { event_date: string; label: string; event_type: CalendarEvent["event_type"]; notes?: string }) => request<CalendarEvent>("/calendar/events", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  updateCalendarEvent: (id: string, payload: Partial<{ event_date: string; label: string; event_type: CalendarEvent["event_type"]; notes: string; completed: boolean }>) => request<CalendarEvent>(`/calendar/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),
  deleteCalendarEvent: (id: string) => request<void>(`/calendar/events/${id}`, { method: "DELETE" }),
  getChecklist: () => request<ChecklistCategory[]>("/resources/checklist"),
  createChecklistCategory: (payload: { name: string; position?: number }) => request<Omit<ChecklistCategory, "items">>("/resources/checklist/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  createChecklistItem: (payload: { category_id: string; label: string; position?: number }) => request<ChecklistItem>("/resources/checklist/items", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  updateChecklistItem: (id: string, payload: Partial<Pick<ChecklistItem, "label" | "completed" | "position">>) => request<ChecklistItem>(`/resources/checklist/items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),
  deleteChecklistItem: (id: string) => request<void>(`/resources/checklist/items/${id}`, { method: "DELETE" }),
  getBirthPlan: () => request<BirthPlanOption[]>("/resources/birth-plan"),
  updateBirthPlan: (optionKey: string, selected: boolean) => request<BirthPlanOption>(`/resources/birth-plan/${encodeURIComponent(optionKey)}`, {
    method: "PUT",
    body: JSON.stringify({ selected }),
  }),
  getReportSummary: () => request<ReportSummary>("/reports/summary"),
  getReportVitals: () => request<VitalLog[]>("/reports/vitals"),
  getNotifications: () => request<AppNotification[]>("/notifications"),
  markNotificationRead: (id: string) => request<AppNotification>(`/notifications/${id}/read`, { method: "POST" }),
  markAllNotificationsRead: () => request<void>("/notifications/read-all", { method: "POST" }),
  getActiveEmergency: () => request<EmergencyAlertRow | null>("/emergency/alerts/active"),
  sendEmergency: (payload: { message: string; trigger?: EmergencyAlertRow["trigger"]; location?: string | null; lat?: number | null; lng?: number | null }) => request<EmergencyAlertRow & { companion_notified: boolean }>("/emergency/alerts", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  ackEmergency: (id: string, eta_minutes: number | null) => request<EmergencyAlertRow>(`/emergency/alerts/${id}/ack`, {
    method: "POST",
    body: JSON.stringify({ eta_minutes }),
  }),
  resolveEmergency: (id: string) => request<EmergencyAlertRow>(`/emergency/alerts/${id}/resolve`, { method: "POST" }),
  exportReport: () =>request<{ generated_at: string; pregnancy: Pregnancy; summary: ReportSummary; vitals: VitalLog[] }>("/reports/export"),
};
