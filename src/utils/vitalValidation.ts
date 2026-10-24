// Penilaian isian data vital dalam tiga lapis:
//  - errors   : nilai mustahil/salah ketik → tidak boleh disimpan (sejalan dengan batas backend schemas/health.py)
//  - warnings : di luar rentang normal tapi mungkin terjadi → boleh disimpan setelah konfirmasi
//  - dangers  : nilai yang menandakan kondisi serius → boleh disimpan, dan user diminta segera menghubungi tenaga kesehatan
// Rentang normal & bahaya mengikuti panduan kehamilan yang umum; perlu ditinjau bidan/dokter sebelum rilis.

export type VitalForm = {
  td: string; bb: string; fundus: string; gerakan: string; hb: string;
  protein: "Negatif" | "+" | "++" | "+++"; catatan: string;
};

type Field = keyof VitalForm;
export type VitalMessages = Partial<Record<Field, string>>;
export type VitalAssessment = { errors: VitalMessages; warnings: VitalMessages; dangers: VitalMessages };

export const EMPTY_VITAL_FORM: VitalForm = { td: "", bb: "", fundus: "", gerakan: "", hb: "", protein: "Negatif", catatan: "" };

const num = (raw: string) => (raw === "" ? NaN : Number(raw));
const within = (n: number, min: number, max: number) => Number.isFinite(n) && n >= min && n <= max;

export function assessVital(form: Pick<VitalForm, "td" | "bb" | "fundus" | "gerakan" | "hb" | "protein"> & { catatan?: string }, weeksPreg: number): VitalAssessment {
  const errors: VitalMessages = {};
  const warnings: VitalMessages = {};
  const dangers: VitalMessages = {};

  // Tekanan darah
  const [sysRaw = "", diaRaw = ""] = form.td.split("/");
  const sys = num(sysRaw), dia = num(diaRaw);
  if (!sysRaw || !diaRaw) errors.td = "Isi sistolik dan diastolik, contoh 118/76.";
  else if (!within(sys, 40, 300) || !within(dia, 20, 200)) errors.td = "Angka tidak masuk akal. Periksa kembali, contoh 118/76.";
  else if (sys <= dia) errors.td = "Sistolik (angka pertama) harus lebih besar dari diastolik.";
  else if (sys >= 160 || dia >= 110) dangers.td = "Tekanan darah sangat tinggi (≥160/110), bisa menandakan preeklamsia berat.";
  else if (sys >= 140 || dia >= 90) warnings.td = "Tekanan darah tinggi (≥140/90). Normalnya di bawah 140/90.";
  else if (sys < 90 || dia < 60) warnings.td = "Tekanan darah rendah (di bawah 90/60).";

  // Berat badan
  const bb = num(form.bb);
  if (!form.bb) errors.bb = "Berat badan wajib diisi.";
  else if (!within(bb, 20, 300)) errors.bb = "Angka tidak masuk akal. Periksa kembali (kg).";
  else if (!within(bb, 40, 120)) warnings.bb = "Di luar rentang umum (40–120 kg). Pastikan angkanya benar.";

  // Tinggi fundus — minggu 20–36 normalnya ≈ usia kehamilan (minggu) ± 3 cm.
  // Setelah minggu 36 janin mulai turun ke panggul sehingga fundus bisa mengecil; aturan ini tidak dipakai.
  if (form.fundus) {
    const f = num(form.fundus);
    if (!within(f, 1, 60)) errors.fundus = "Angka tidak masuk akal. Periksa kembali (cm).";
    else if (weeksPreg >= 20 && weeksPreg <= 36 && !within(f, weeksPreg - 3, weeksPreg + 3)) {
      warnings.fundus = `Normalnya sekitar ${weeksPreg - 3}–${weeksPreg + 3} cm di minggu ke-${weeksPreg}. Pastikan angkanya benar.`;
    } else if (f > 45) {
      warnings.fundus = "Di atas rentang umum (maks. ±45 cm). Pastikan angkanya benar.";
    }
  }

  // Hemoglobin — anemia kehamilan < 11, anemia berat < 7
  if (form.hb) {
    const hb = num(form.hb);
    if (!within(hb, 1, 25)) errors.hb = "Angka tidak masuk akal. Periksa kembali (g/dL), contoh 11.8.";
    else if (hb < 7) dangers.hb = "Hemoglobin sangat rendah (<7 g/dL), tanda anemia berat.";
    else if (hb < 11) warnings.hb = "Hemoglobin rendah (<11 g/dL), tanda anemia kehamilan.";
    else if (hb > 16) warnings.hb = "Hemoglobin di atas rentang umum (11–16 g/dL). Pastikan angkanya benar.";
  }

  // Gerakan janin per 2 jam — kurang dari 10 termasuk tanda bahaya (Buku KIA)
  if (form.gerakan) {
    const parts = form.gerakan.split("-").map(num);
    if (parts.length > 2 || parts.some(n => !within(n, 0, 200))) errors.gerakan = "Isi angka atau rentang, contoh 10 atau 8-10.";
    else if (Math.max(...parts) < 10) dangers.gerakan = "Kurang dari 10 gerakan dalam 2 jam: gerakan janin berkurang.";
  }

  if (form.protein === "++" || form.protein === "+++") {
    warnings.protein = "Protein urin positif. Apalagi bila disertai tekanan darah tinggi, segera konsultasikan.";
  }

  if ((form.catatan ?? "").length > 1000) errors.catatan = "Catatan maksimal 1000 karakter.";
  return { errors, warnings, dangers };
}
