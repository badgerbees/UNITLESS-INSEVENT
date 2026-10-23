import { useState } from "react";
import { Baby } from "lucide-react";
import type { Theme, Mode } from "../types";
import { api } from "../services/api";
import { APP_NAME } from "../constants/brand";

export function PregnancySetupScreen({ t, mode, onCreated }: { t: Theme; mode: Mode; onCreated: () => void }) {
  const [hphtDate, setHphtDate] = useState("");
  const [bloodType, setBloodType] = useState("A+");
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [syncCode, setSyncCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      if (mode === "mother") {
        if (!hphtDate) throw new Error("Tanggal HPHT wajib diisi.");
        await api.createPregnancy({ hpht_date: hphtDate, blood_type: bloodType, hospital: hospital || undefined, doctor: doctor || undefined });
      } else {
        if (!syncCode.trim()) throw new Error("Kode sinkronisasi wajib diisi.");
        await api.pairPregnancy(syncCode.trim());
      }
      onCreated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data kehamilan gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-2xl px-4 py-3 text-sm outline-none";
  const inputStyle = { background: "#f2f2f2", color: t.dark, border: `1.5px solid ${t.border}` };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: t.bg }}>
      <div className="w-full max-w-xl rounded-3xl p-8" style={{ background: t.card, boxShadow: `0 12px 40px ${t.shadow}` }}>
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white mb-4" style={{ background: t.grad }}>
            <Baby size={30} />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: t.dark }}>Siapkan data kehamilan</h1>
          <p className="text-sm mt-2" style={{ color: t.muted }}>
            {mode === "mother" ? `Tambahkan data awal agar ${APP_NAME} dapat menampilkan informasi yang sesuai.` : "Masukkan kode dari akun ibu untuk bergabung sebagai pendamping."}
          </p>
        </div>

        {mode === "mother" ? (
          <div className="space-y-4">
            <label className="block text-xs font-bold" style={{ color: t.dark }}>
              Tanggal HPHT
              <input type="date" value={hphtDate} onChange={event => setHphtDate(event.target.value)} className={`${inputClass} mt-1.5`} style={inputStyle} />
            </label>
            <label className="block text-xs font-bold" style={{ color: t.dark }}>
              Golongan darah
              <select value={bloodType} onChange={event => setBloodType(event.target.value)} className={`${inputClass} mt-1.5`} style={inputStyle}>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => <option key={type}>{type}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold" style={{ color: t.dark }}>
                Rumah sakit / klinik
                <input value={hospital} onChange={event => setHospital(event.target.value)} className={`${inputClass} mt-1.5`} style={inputStyle} placeholder="Opsional" />
              </label>
              <label className="block text-xs font-bold" style={{ color: t.dark }}>
                Dokter
                <input value={doctor} onChange={event => setDoctor(event.target.value)} className={`${inputClass} mt-1.5`} style={inputStyle} placeholder="Opsional" />
              </label>
            </div>
          </div>
        ) : (
          <label className="block text-xs font-bold" style={{ color: t.dark }}>
            Kode sinkronisasi pasangan
            <input value={syncCode} onChange={event => setSyncCode(event.target.value.toUpperCase())} className={`${inputClass} mt-1.5`} style={inputStyle} placeholder="Contoh: ABCD1234" />
          </label>
        )}

        {error && <p className="mt-4 text-center text-xs font-semibold text-red-600">{error}</p>}
        <button onClick={() => void submit()} disabled={saving} className="w-full mt-6 rounded-full py-3.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: t.grad }}>
          {saving ? "Menyimpan..." : mode === "mother" ? "Mulai menggunakan aplikasi" : "Gabung dengan pasangan"}
        </button>
      </div>
    </div>
  );
}
