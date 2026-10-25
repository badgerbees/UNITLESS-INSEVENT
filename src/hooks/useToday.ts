import { useEffect, useState } from "react";
import { localIsoDate } from "../utils/helpers";

// Tanggal lokal hari ini yang ikut berganti saat lewat tengah malam (dicek tiap menit & saat tab kembali aktif),
// supaya data harian (gejala, vitamin, kontraksi, kick) otomatis mulai baru di hari berikutnya.
export function useToday() {
  const [today, setToday] = useState(localIsoDate);
  useEffect(() => {
    const check = () => setToday(prev => (localIsoDate() === prev ? prev : localIsoDate()));
    const id = setInterval(check, 60_000);
    document.addEventListener("visibilitychange", check);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", check); };
  }, []);
  return today;
}
