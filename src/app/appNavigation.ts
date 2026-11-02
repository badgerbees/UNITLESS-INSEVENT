import type { LucideIcon } from "lucide-react";
import { Activity, AlertTriangle, Baby, Calendar, FileText, Home, Package } from "lucide-react";
import type { Mode, Screen } from "../types";

export type NavigationItem = { id: Screen; label: string; Icon: LucideIcon };
export type SearchFeature = NavigationItem & { desc: string; keywords: string };

export function getScreenLabels(mode: Mode): Record<Screen, string> {
  return {
    dashboard: mode === "mother" ? "Dashboard Ibu" : "Dashboard Suami",
    health: "Pemantauan Kesehatan",
    calendar: "Kalender & Jadwal",
    reports: "Laporan Medis",
    resources: "Persiapan Persalinan",
    emergency: "Mode Darurat",
    postpartum: "Pasca-Melahirkan",
  };
}

export function getNavigationItems(isPostpartum: boolean): NavigationItem[] {
  return [
    { id: "dashboard", label: "Beranda", Icon: Home },
    { id: "health", label: "Kesehatan", Icon: Activity },
    { id: "calendar", label: "Kalender", Icon: Calendar },
    { id: "reports", label: "Laporan", Icon: FileText },
    isPostpartum
      ? { id: "postpartum", label: "Pasca-Melahirkan", Icon: Baby }
      : { id: "resources", label: "Persiapan", Icon: Package },
  ];
}

export const SEARCH_FEATURES: SearchFeature[] = [
  { id: "dashboard", label: "Beranda", desc: "Ringkasan kehamilan & perkembangan si kecil", Icon: Home, keywords: "dashboard minggu janin bayi" },
  { id: "health", label: "Kesehatan", desc: "Catat tekanan darah, berat badan & gejala", Icon: Activity, keywords: "vital tekanan darah gejala risiko" },
  { id: "calendar", label: "Kalender", desc: "Jadwal kontrol & pengingat", Icon: Calendar, keywords: "jadwal kontrol pengingat janji" },
  { id: "reports", label: "Laporan", desc: "Laporan medis & ekspor PDF", Icon: FileText, keywords: "laporan medis pdf ekspor dokter" },
  { id: "resources", label: "Persiapan", desc: "Persiapan persalinan & bantuan", Icon: Package, keywords: "persalinan tas checklist bantuan" },
  { id: "emergency", label: "Mode Darurat", desc: "Kirim sinyal darurat ke pendamping", Icon: AlertTriangle, keywords: "darurat sos bahaya" },
  { id: "postpartum", label: "Pasca-Melahirkan", desc: "Pemulihan setelah melahirkan", Icon: Baby, keywords: "nifas pemulihan postpartum" },
];
