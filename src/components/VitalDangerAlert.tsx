import React from "react";
import { AlertTriangle } from "lucide-react";
import { VitalLog } from "../types";
import { assessVital } from "../utils/vitalValidation";

// Peringatan bila data vital terakhir berisi nilai berbahaya (mis. TD ≥160/110, HB <7, gerakan janin <10)
export function VitalDangerAlert({ vital, onEmergency, compact = false }: { vital: VitalLog | undefined; onEmergency?: () => void; compact?: boolean }) {
  if (!vital) return null;
  const dangers = Object.values(assessVital(vital, vital.minggu).dangers);
  if (dangers.length === 0) return null;

  // Versi ringkas untuk di dalam kotak Data Vital: tombol kecil di samping judul agar kotak tidak memanjang
  if (compact) {
    return (
      <div className="rounded-xl px-3 py-2" style={{ background: "#fef2f2", border: "1.5px solid #fca5a5" }}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
          <p className="flex-1 text-xs font-extrabold text-red-700">Tanda bahaya · segera hubungi bidan/dokter</p>
          {onEmergency && (
            <button onClick={onEmergency} className="ui-interactive flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
              style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
              Mode Darurat
            </button>
          )}
        </div>
        <ul className="mt-1 ml-[22px] space-y-0.5">
          {dangers.map(d => <li key={d} className="text-[11px] leading-snug text-red-600">• {d}</li>)}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl px-4 py-3" style={{ background: "#fef2f2", border: "1.5px solid #fca5a5" }}>
      <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-extrabold text-red-700">Data vital terakhir menunjukkan tanda bahaya</p>
        <ul className="mt-1 space-y-0.5">
          {dangers.map(d => <li key={d} className="text-xs text-red-600">• {d}</li>)}
        </ul>
        <p className="text-xs text-red-600 mt-1.5 font-semibold">Segera hubungi bidan/dokter atau datang ke fasilitas kesehatan terdekat.</p>
      </div>
      {onEmergency && (
        <button onClick={onEmergency} className="ui-interactive flex-shrink-0 text-xs font-bold px-3 py-2 rounded-full text-white"
          style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
          Mode Darurat
        </button>
      )}
    </div>
  );
}
