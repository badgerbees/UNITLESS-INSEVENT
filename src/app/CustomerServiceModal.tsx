import React, { useState } from "react";
import { CheckCheck, Headphones, HelpCircle, MessageCircle, PhoneCall, Send, X } from "lucide-react";
import type { Theme } from "../types";
import { APP_NAME } from "../constants/brand";
import { Card } from "../components/Card";

type CustomerServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  t: Theme;
};

export function CustomerServiceModal({ isOpen, onClose, t }: CustomerServiceModalProps) {
  const [topic, setTopic] = useState("Pertanyaan umum");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const topics = [
    "Pertanyaan umum",
    "Kendala aplikasi",
    "Jadwal pemeriksaan",
    "Laporan kesehatan",
  ];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setMessage("");
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5" style={{ background: t.bg, border: `1px solid ${t.border}`, scrollbarWidth: "none" }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: t.active }}>Bantuan {APP_NAME}</p>
            <p className="text-lg font-extrabold" style={{ color: t.dark }}>Customer Service</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors" style={{ color: t.muted }} aria-label="Tutup Customer Service">
            <X size={18} />
          </button>
        </div>

        <div className="rounded-3xl p-6 flex items-center gap-5" style={{ background: t.grad }}>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Headphones size={28} color="#fff" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-white">Ada yang bisa kami bantu?</p>
            <p className="text-sm text-white/80 mt-1">Tim {APP_NAME} siap membantu kebutuhan Anda.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card t={t} className="p-5 lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: t.soft }}>
                <MessageCircle size={20} color={t.active} />
              </div>
              <div>
                <p className="text-base font-extrabold" style={{ color: t.dark }}>Kirim pesan</p>
                <p className="text-xs" style={{ color: t.muted }}>Sampaikan kendala atau pertanyaan Anda.</p>
              </div>
            </div>
            {sent ? (
              <div className="rounded-2xl p-5 text-center" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <CheckCheck size={28} color="#16a34a" className="mx-auto mb-2" />
                <p className="text-sm font-bold" style={{ color: "#166534" }}>Pesan berhasil dikirim</p>
                <p className="text-xs mt-1" style={{ color: "#4d7c0f" }}>Tim kami akan menghubungi Anda dalam jam layanan.</p>
                <button onClick={() => setSent(false)} className="text-xs font-bold mt-4" style={{ color: t.active }}>Kirim pesan lain</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: t.dark }}>Topik bantuan</p>
                  <div className="grid grid-cols-2 gap-2">
                    {topics.map(item => (
                      <button key={item} type="button" onClick={() => setTopic(item)} className="rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all" style={{ background: topic === item ? t.active : t.soft, color: topic === item ? "#fff" : t.dark }}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={message} onChange={event => setMessage(event.target.value)} rows={4} placeholder="Tuliskan kendala atau pertanyaan Anda..." className="w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none" style={{ color: t.dark, border: `1.5px solid ${t.border}`, background: "#fff" }} />
                <button type="submit" disabled={!message.trim()} className="w-full rounded-full py-3 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all" style={{ background: !message.trim() ? "#d8d1d8" : t.grad }}>
                  <Send size={15} /> Kirim ke Customer Service
                </button>
              </form>
            )}
          </Card>

          <div className="space-y-5">
            <Card t={t} className="p-5">
              <p className="text-sm font-extrabold mb-4" style={{ color: t.dark }}>Hubungi kami</p>
              <div className="space-y-3">
                <a href="tel:0215550199" className="flex items-center gap-3 rounded-xl p-3" style={{ background: t.soft }}>
                  <PhoneCall size={17} color={t.active} />
                  <div><p className="text-xs font-bold" style={{ color: t.dark }}>021-555-0199</p><p className="text-[10px]" style={{ color: t.muted }}>Senin - Jumat, 08.00 - 17.00</p></div>
                </a>
                <a href="https://wa.me/6281255550199" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl p-3" style={{ background: t.soft }}>
                  <MessageCircle size={17} color="#16a34a" />
                  <div><p className="text-xs font-bold" style={{ color: t.dark }}>WhatsApp {APP_NAME}</p><p className="text-[10px]" style={{ color: t.muted }}>Balasan biasanya kurang dari 10 menit</p></div>
                </a>
              </div>
            </Card>
            <Card t={t} className="p-5">
              <div className="flex items-center gap-2 mb-3"><HelpCircle size={17} color={t.active} /><p className="text-sm font-extrabold" style={{ color: t.dark }}>Bantuan cepat</p></div>
              <p className="text-xs leading-relaxed" style={{ color: t.muted }}>Untuk kondisi darurat, gunakan menu <span className="font-bold" style={{ color: "#ef4444" }}>Mode Darurat</span> agar bantuan dapat segera diteruskan.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
