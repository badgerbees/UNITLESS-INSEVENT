import React, { useState, useEffect } from "react";
import { Theme, VitalLog, EmergencyAlert, Risk, Mode } from "../types";
import { Card } from "../components/Card";
import { PillBtn } from "../components/PillBtn";
import { SectionTitle } from "../components/SectionTitle";
import { StatTile } from "../components/StatTile";
import { fmtDate, addDays } from "../utils/helpers";
import {
  Home, Activity, Calendar, FileText, Package, Bell,
  Plus, Minus, Check, X, AlertTriangle, Download, Baby,
  PhoneCall, ArrowRight, RefreshCw, ChevronLeft, Search, Heart,
  MapPin, Navigation, Send, CheckCheck, Clock, Zap, Printer, Mail, Lock, LogOut, Settings, History, Users, Scissors, Droplets, Brain, HeartPulse, Eye, Bone, Wind, Activity as ActivityIcon,
  User, Smartphone, Copy, Headphones, MessageCircle, HelpCircle
} from "lucide-react";
import { APP_NAME } from "../constants/brand";
import { api, ApiError } from "../services/api";


export function CustomerServiceModal({ isOpen, onClose, t }: { isOpen: boolean; onClose: () => void; t: Theme }) {
  const [topic, setTopic] = useState("Pertanyaan umum");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const topics = [
    "Pertanyaan umum",
    "Kendala aplikasi",
    "Jadwal pemeriksaan",
    "Laporan kesehatan",
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
                    <button key={item} type="button" onClick={() => setTopic(item)}
                      className="rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all"
                      style={{ background: topic === item ? t.active : t.soft, color: topic === item ? "#fff" : t.dark }}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                placeholder="Tuliskan pesan Anda di sini..."
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none"
                style={{ color: t.dark, border: `1.5px solid ${t.border}`, background: "#fff" }} />
              <button type="submit" disabled={!message.trim()}
                className="w-full rounded-full py-3 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: !message.trim() ? "#d8d1d8" : t.grad }}>
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

export function ResourcesScreen({ t }: { t: Theme }) {
  const [items, setItems] = useState<Record<string, boolean>>({
    baju_ibu: true, pembalut: true, sabun: true,
    baju_bayi: true, selimut: true, popok: false,
    bpjs: false, ktp: false, buku_pink: false, charger: true,
  });
  
  const [cats, setCats] = useState([
    { id: "ibu",  label: "Ibu",       items: [{ id: "baju_ibu", l: "Baju ganti (3 stel)"  }, { id: "pembalut", l: "Pembalut bersalin"   }, { id: "sabun",     l: "Perlengkapan mandi" }] },
    { id: "bayi", label: "Bayi",      items: [{ id: "baju_bayi", l: "Baju bayi (5 stel)"  }, { id: "selimut",  l: "Selimut bedong"     }, { id: "popok",     l: "Popok newborn"      }] },
    { id: "dok",  label: "Dokumen",   items: [{ id: "bpjs", l: "Kartu BPJS"               }, { id: "ktp",      l: "KTP suami-istri"    }, { id: "buku_pink", l: "Buku KIA"           }] },
    { id: "lain", label: "Lain-lain", items: [{ id: "charger", l: "Charger & powerbank"   }] },
  ]);

  const [editMode, setEditMode] = useState(false);
  const [newInputs, setNewInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const total   = cats.reduce((acc, cat) => acc + cat.items.length, 0);
  const doneCnt = cats.reduce((acc, cat) => acc + cat.items.filter(i => items[i.id]).length, 0);
  const pct     = total === 0 ? 0 : Math.round((doneCnt / total) * 100);

  const [birthPlan, setBirthPlan] = useState<Record<string, boolean>>({
    imd: true,
    suami: true,
    epidural: false,
    tali_pusat: true,
    rooming: true,
  });

  useEffect(() => {
    let active = true;
    let pending = 2;
    const completeRequest = () => {
      pending -= 1;
      if (active && pending === 0) setLoading(false);
    };

    api.getChecklist()
      .then(remoteCategories => {
        if (!active || remoteCategories.length === 0) return;
        setCats(remoteCategories.map(category => ({
          id: category.id,
          label: category.name,
          items: category.items.map(item => ({ id: item.id, l: item.label })),
        })));
        setItems(Object.fromEntries(remoteCategories.flatMap(category => category.items.map(item => [item.id, item.completed]))));
      })
      .catch(error => {
        if (active) setLoadError(true);
        if (!(error instanceof ApiError && error.status === 404)) console.error("Failed to load preparation checklist", error);
      })
      .finally(completeRequest);

    api.getBirthPlan()
      .then(remotePlan => {
        if (!active || remotePlan.length === 0) return;
        setBirthPlan(previous => ({ ...previous, ...Object.fromEntries(remotePlan.map(option => [option.option_key, option.selected])) }));
      })
      .catch(error => {
        if (active) setLoadError(true);
        if (!(error instanceof ApiError && error.status === 404)) console.error("Failed to load birth plan", error);
      })
      .finally(completeRequest);

    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="w-full rounded-3xl p-10 text-center" style={{ background: t.card, border: `1px solid ${t.border}` }}>
        <div className="w-10 h-10 rounded-full border-4 mx-auto mb-4 animate-spin" style={{ borderColor: `${t.active}30`, borderTopColor: t.active }} />
        <p className="text-sm font-bold" style={{ color: t.dark }}>Memuat persiapan persalinan...</p>
        <p className="text-xs mt-1" style={{ color: t.muted }}>Mengambil checklist dan rencana persalinan tersimpan.</p>
      </div>
    );
  }

  const birthPlanList = [
    { id: "imd", label: "Inisiasi Menyusui Dini (IMD)", sub: "Jika ibu dan bayi stabil", Icon: Heart },
    { id: "suami", label: "Suami mendampingi", sub: "Selama proses persalinan", Icon: Users },
    { id: "epidural", label: "Opsi pereda nyeri", sub: "Epidural atau ILA", Icon: Activity },
    { id: "tali_pusat", label: "Tunda potong tali pusat", sub: "Delayed Cord Clamping", Icon: Scissors },
    { id: "rooming", label: "Rawat gabung", sub: "Rooming-in dengan bayi", Icon: Baby },
  ];

  function handleAddItem(catId: string) {
    const val = newInputs[catId]?.trim();
    if (!val) return;
    const newId = `custom_${Date.now()}`;
    setCats(prev => prev.map(c => c.id === catId ? { ...c, items: [...c.items, { id: newId, l: val }] } : c));
    setItems(p => ({ ...p, [newId]: false }));
    setNewInputs(p => ({ ...p, [catId]: "" }));
  }

  function handleDelete(catId: string, itemId: string) {
    setCats(prev => prev.map(c => c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c));
    if (!itemId.startsWith("custom_")) {
      void api.deleteChecklistItem(itemId).catch(error => console.error("Failed to delete checklist item", error));
    }
  }

  function toggleChecklistItem(id: string) {
    const completed = !items[id];
    setItems(previous => ({ ...previous, [id]: completed }));
    if (!id.startsWith("custom_")) {
      void api.updateChecklistItem(id, { completed }).catch(error => console.error("Failed to update checklist item", error));
    }
  }

  function toggleBirthPlan(optionKey: string) {
    const selected = !birthPlan[optionKey];
    setBirthPlan(previous => ({ ...previous, [optionKey]: selected }));
    void api.updateBirthPlan(optionKey, selected).catch(error => console.error("Failed to update birth plan", error));
  }

  return (
    <div className="space-y-5 w-full">
      {loadError && (
        <div className="rounded-2xl px-4 py-3 text-xs" style={{ background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }}>
          Data tersimpan belum dapat dimuat. Tampilan sementara digunakan; coba muat ulang halaman.
        </div>
      )}
      <div className="rounded-3xl p-6 flex items-center gap-6" style={{ background: t.grad }}>
        <div className="flex-1">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Kesiapan Tas Persalinan</p>
          <p className="text-4xl font-extrabold mt-1 text-white">
            <span>{pct}%</span>
          </p>
          <div className="h-2 rounded-full mt-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.25)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: t.active }} />
          </div>
        </div>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.22)" }}>
          <Package size={30} color="#fff" />
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-extrabold" style={{ color: t.dark }}>Daftar Bawaan per Kategori</p>
        <button onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          style={{ background: editMode ? t.active : t.soft, color: editMode ? "#fff" : t.active }}>
          {editMode ? <Check size={12} /> : <Plus size={12} />} {editMode ? "Selesai Edit" : "Edit List"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cats.map(cat => (
          <Card key={cat.id} t={t} className="p-5 flex flex-col">
            <p className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: t.dark }}>{cat.label}</p>
            <div className="space-y-2 flex-1">
              {cat.items.map(({ id, l }) => (
                <div key={id} className="flex items-center gap-2">
                  <button onClick={() => toggleChecklistItem(id)}
                    className="flex-1 flex items-center gap-2 rounded-xl px-2 py-2 transition-all"
                    style={{ background: items[id] ? "#f0fdf4" : t.soft }}>
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: items[id] ? "#22c55e" : t.border }}>
                      {items[id] && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-xs text-left leading-tight" style={{ color: items[id] ? "#22c55e" : t.dark, textDecoration: items[id] ? "line-through" : "none" }}>{l}</span>
                  </button>
                  {editMode && (
                    <button onClick={() => handleDelete(cat.id, id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-red-100"
                      style={{ color: "#ef4444", background: t.soft }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {editMode && (
              <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: `1px solid ${t.border}` }}>
                <input
                  className="flex-1 w-full rounded-xl px-3 py-2 text-xs outline-none border-2 transition-all min-w-0"
                  style={{ borderColor: t.border, background: t.card, color: t.dark }}
                  placeholder="Tambah..."
                  value={newInputs[cat.id] || ""}
                  onChange={e => setNewInputs(p => ({ ...p, [cat.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAddItem(cat.id)}
                />
                <button onClick={() => handleAddItem(cat.id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: newInputs[cat.id]?.trim() ? t.active : t.soft, color: newInputs[cat.id]?.trim() ? "#fff" : t.muted }}>
                  <Plus size={14} />
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* Rencana Persalinan (Birth Plan) */}
        <Card t={t} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Rencana Persalinan (Birth Plan)</SectionTitle>
            <button className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all" style={{ background: t.soft, color: t.active }}>
              <Printer size={12} /> Cetak
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {birthPlanList.map(bp => (
              <button key={bp.id} onClick={() => toggleBirthPlan(bp.id)}
                className="flex items-center gap-3 p-3 rounded-xl transition-all text-left hover:brightness-95"
                style={{ background: birthPlan[bp.id] ? t.soft : "#f9f9f9", border: `1.5px solid ${birthPlan[bp.id] ? t.primary : "transparent"}` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm">
                  <bp.Icon size={14} color={birthPlan[bp.id] ? t.active : t.muted} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold" style={{ color: t.dark }}>{bp.label}</p>
                  <p className="text-[10px]" style={{ color: t.muted }}>{bp.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${birthPlan[bp.id] ? 'bg-green-500' : 'bg-gray-200'}`}>
                  {birthPlan[bp.id] && <Check size={12} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Tanda-tanda Persalinan */}
        <Card t={t} className="p-6">
          <SectionTitle>Kapan Harus Ke RS? (Tanda Persalinan)</SectionTitle>
          <div className="space-y-3 mt-1">
            <div className="flex gap-3 rounded-2xl p-4" style={{ background: "#fef2f2", border: "1px solid #fca5a5" }}>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-red-700">Kontraksi 5-1-1</p>
                <p className="text-[11px] font-medium text-red-600 mt-0.5 leading-snug">Berlangsung 1 menit, berjarak 5 menit, konsisten selama 1 jam.</p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl p-4" style={{ background: "#eff6ff", border: "1px solid #93c5fd" }}>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Droplets size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-blue-700">Ketuban Pecah</p>
                <p className="text-[11px] font-medium text-blue-600 mt-0.5 leading-snug">Cairan mengalir tak tertahan. Perhatikan warna dan bau cairan.</p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl p-4" style={{ background: "#fdf4ff", border: "1px solid #f0abfc" }}>
              <div className="w-10 h-10 rounded-full bg-fuchsia-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-fuchsia-600" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-fuchsia-700">Flek Lendir Darah</p>
                <p className="text-[11px] font-medium text-fuchsia-600 mt-0.5 leading-snug">Tanda leher rahim mulai membuka. Jika darah banyak, segera ke IGD.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

