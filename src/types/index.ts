export type VitalLog = {
  id: string;
  date: string;
  minggu: number;
  td: string;
  bb: string;
  fundus: string;
  gerakan: string;
  hb: string;
  protein: "Negatif" | "+" | "++" | "+++";
  catatan: string;
};

export type EmergencyAlert = {
  id: string;
  sentAt: Date;
  trigger: "manual" | "511" | "symptom";
  location: string;
  lat: number | null;
  lng: number | null;
  contractions?: string;
  message: string;
  husbandAck: boolean;
  husbandEta: number | null;
};

export type Theme = {
  sidebarBg: string;
  primary: string;
  active: string;
  grad: string;
  bg: string;
  soft: string;
  card: string;
  dark: string;
  muted: string;
  shadow: string;
  border: string;
};

export type Mode = "mother" | "companion";
export type Screen = "dashboard" | "health" | "calendar" | "reports" | "resources" | "emergency" | "postpartum";
export type Risk = "green" | "yellow" | "red";

export type UserProfile = {
  motherName: string;
  fatherName: string;
  // Nomor HP ibu & pendamping dari data anggota kehamilan (untuk tombol telepon di Mode Darurat)
  motherPhone?: string;
  fatherPhone?: string;
  email: string;
  phone: string;
  hphtDate: string;
  hospital: string;
  doctor: string;
  bloodType: string;
  syncCode: string;
  syncCodeExpiresAt: string;
  notifVitamin: boolean;
  notifAnc: boolean;
  notifEmergencySound: boolean;
  notifWeeklyReport: boolean;
};

export type Vitamin = { id: string; label: string; dose: string; color: string };
export type CustomSymptom = { id: string; label: string };
