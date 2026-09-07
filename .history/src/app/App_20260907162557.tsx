import React, { useState, useEffect, useRef } from "react";
import {
  Home, Activity, Calendar, FileText, Package, Bell,
  Plus, Minus, Check, X, AlertTriangle, Download, Baby,
  PhoneCall, ArrowRight, RefreshCw, ChevronLeft, Search, Heart,
  MapPin, Navigation, Send, CheckCheck, Clock, Zap, Printer, Mail, Lock, LogOut, Settings, History, Users, Scissors, Droplets, Brain, HeartPulse, Eye, Bone, Wind, Activity as ActivityIcon,
  User, Smartphone, Copy, Headphones, MessageCircle, HelpCircle
} from "lucide-react";

type VitalLog = {
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

const SEED_VITALS: VitalLog[] = [
  { id:"v1", date:"5 Nov 2024",  minggu:18, td:"116/74", bb:"62.0", fundus:"18", gerakan:"6-8",  hb:"12.1", protein:"Negatif", catatan:"" },
  { id:"v2", date:"2 Des 2024",  minggu:22, td:"118/76", bb:"64.5", fundus:"22", gerakan:"8-10", hb:"11.9", protein:"Negatif", catatan:"Sedikit pusing pagi" },
  { id:"v3", date:"6 Jan 2025",  minggu:27, td:"120/78", bb:"67.0", fundus:"27", gerakan:"8-10", hb:"11.5", protein:"Negatif", catatan:"" },
  { id:"v4", date:"27 Jan 2025", minggu:31, td:"118/76", bb:"68.5", fundus:"32", gerakan:"8-10", hb:"11.8", protein:"Negatif", catatan:"" },
];

type EmergencyAlert = {
  sentAt: Date;
  trigger: "manual" | "511" | "symptom";
  location: string;
  lat: number;
  lng: number;
  contractions?: string;
  message: string;
  husbandAck: boolean;
  husbandEta: number | null;
};

// ─── Theme per mode ───────────────────────────────────────────────────────────

const THEMES = {
  mother: {
    sidebarBg:"#ffffff",   // sidebar is white
    primary:  "#e899a6",   // soft pink — chips, pills, secondary
    active:   "#cd3a69",   // bold rose — active nav, CTA, badges
    grad:     "linear-gradient(135deg, #e899a6 0%, #cd3a69 100%)", // hero gradient
    bg:       "#fef7f5",   // ivory page background
    soft:     "#fce8ed",   // blush tint — active nav bg, chip bg
    card:     "#ffffff",
    dark:     "#2d2d2d",
    muted:    "#a0a0a0",
    shadow:   "rgba(205,58,105,0.10)",
    border:   "rgba(232,153,166,0.22)",
  },
  companion: {
    sidebarBg:"#ffffff",   // sidebar is white
    primary:  "#c8a2c8",   // soft lilac — chips, pills, secondary
    active:   "#996699",   // bold purple — active nav, CTA, badges
    grad:     "linear-gradient(135deg, #c8a2c8 0%, #7b5c9e 100%)", // hero gradient
    bg:       "#f9f6fc",   // lavender page background
    soft:     "#ede6f5",   // soft purple tint — active nav bg, chip bg
    card:     "#ffffff",
    dark:     "#2d2d2d",
    muted:    "#a0a0a0",
    shadow:   "rgba(153,102,153,0.10)",
    border:   "rgba(200,162,200,0.22)",
  },
} as const;

type Theme = typeof THEMES.mother;
type Mode   = "mother" | "companion";
type Screen = "dashboard" | "health" | "calendar" | "reports" | "resources" | "customerService" | "emergency" | "postpartum";
type Risk   = "green" | "yellow" | "red";

// ─── Utils ────────────────────────────────────────────────────────────────────

function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function fmtDate(d: Date) { return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }); }

const FRUITS: Record<number, { name: string; typeId: number; weight: string; length: string }> = {
  6:  { name: "Kacang Polong", typeId: 6,  weight: "< 1 g",  length: "0.6 cm"  },
  8:  { name: "Raspberry",     typeId: 8,  weight: "1 g",    length: "1.6 cm"  },
  12: { name: "Jeruk Nipis",   typeId: 12, weight: "14 g",   length: "5.4 cm"  },
  16: { name: "Alpukat",       typeId: 16, weight: "100 g",  length: "11.6 cm" },
  20: { name: "Pisang",        typeId: 20, weight: "300 g",  length: "16.4 cm" },
  24: { name: "Jagung",        typeId: 24, weight: "600 g",  length: "30 cm"   },
  28: { name: "Terong",        typeId: 28, weight: "1 kg",   length: "37.6 cm" },
  32: { name: "Nanas",         typeId: 32, weight: "1.7 kg", length: "42.4 cm" },
  36: { name: "Melon",         typeId: 36, weight: "2.6 kg", length: "47.4 cm" },
  40: { name: "Semangka",      typeId: 40, weight: "3.5 kg", length: "51 cm"   },
};
function getFruit(w: number) {
  const keys = Object.keys(FRUITS).map(Number).sort((a, b) => a - b);
  let k = keys[0];
  for (const n of keys) if (w >= n) k = n;
  return FRUITS[k];
}

// ─── Fruit Illustrations ──────────────────────────────────────────────────────

function FruitIllustration({ type, className = "" }: { type: number, className?: string }) {
  const svgProps = { viewBox: "0 0 64 64", className: `w-full h-full ${className}`, fill: "none" };

  switch (type) {
    case 6: // Kacang Polong (Pea)
      return (
        <svg {...svgProps}>
          <path d="M12 32 Q 32 52 52 32 Q 32 12 12 32 Z" fill="#dcfce7" stroke="#22c55e" strokeWidth="3" />
          <circle cx="24" cy="32" r="5" fill="#22c55e" />
          <circle cx="40" cy="32" r="5" fill="#22c55e" />
        </svg>
      );
    case 8: // Raspberry
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="22" r="8" fill="#fce7f3" stroke="#ec4899" strokeWidth="3" />
          <circle cx="22" cy="34" r="8" fill="#fce7f3" stroke="#ec4899" strokeWidth="3" />
          <circle cx="42" cy="34" r="8" fill="#fce7f3" stroke="#ec4899" strokeWidth="3" />
          <circle cx="32" cy="46" r="8" fill="#fce7f3" stroke="#ec4899" strokeWidth="3" />
          <path d="M32 10 L32 14 M26 10 L30 15 M38 10 L34 15" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 12: // Lime
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="24" fill="#ecfccb" stroke="#65a30d" strokeWidth="3" />
          <circle cx="32" cy="32" r="16" stroke="#65a30d" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="32" cy="32" r="2" fill="#65a30d" />
        </svg>
      );
    case 16: // Avocado
      return (
        <svg {...svgProps}>
          <path d="M32 10 C 20 10 16 28 16 40 C 16 52 24 56 32 56 C 40 56 48 52 48 40 C 48 28 44 10 32 10 Z" fill="#f0fdf4" stroke="#16a34a" strokeWidth="3" />
          <circle cx="32" cy="40" r="10" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
        </svg>
      );
    case 20: // Banana
      return (
        <svg {...svgProps}>
          <path d="M14 50 C 20 54 44 54 52 30 C 52 30 40 40 14 36 Z" fill="#fef9c3" stroke="#d97706" strokeWidth="3" />
          <path d="M14 50 C 10 30 20 14 38 10 C 38 10 26 26 14 36" fill="#fef08a" stroke="#d97706" strokeWidth="3" />
        </svg>
      );
    case 24: // Corn
      return (
        <svg {...svgProps}>
          <path d="M32 10 C 20 30 20 50 32 56 C 44 50 44 30 32 10 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />
          <path d="M32 10 L 32 56 M 26 18 L 26 50 M 38 18 L 38 50" stroke="#ca8a04" strokeWidth="2" />
          <path d="M16 48 C 24 30 32 10 32 10" stroke="#22c55e" strokeWidth="3" fill="none" />
          <path d="M48 48 C 40 30 32 10 32 10" stroke="#22c55e" strokeWidth="3" fill="none" />
        </svg>
      );
    case 28: // Eggplant
      return (
        <svg {...svgProps}>
          <path d="M32 18 C 16 18 16 40 16 46 C 16 54 24 58 32 58 C 40 58 48 54 48 46 C 48 40 48 18 32 18 Z" fill="#faf5ff" stroke="#9333ea" strokeWidth="3" />
          <path d="M32 6 C 24 10 26 20 32 24 C 38 20 40 10 32 6 Z" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
        </svg>
      );
    case 32: // Pineapple
      return (
        <svg {...svgProps}>
          <rect x="20" y="24" width="24" height="32" rx="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />
          <path d="M20 34 L 44 44 M 20 44 L 44 34 M 20 28 L 44 38 M 20 50 L 44 40 M 20 38 L 44 28 M 20 40 L 44 50" stroke="#ca8a04" strokeWidth="2" opacity="0.5" />
          <path d="M32 24 C 20 16 24 6 32 6 C 40 6 44 16 32 24 Z" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
          <path d="M32 24 C 16 20 16 10 24 10 C 24 10 28 18 32 24 Z" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
          <path d="M32 24 C 48 20 48 10 40 10 C 40 10 36 18 32 24 Z" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
        </svg>
      );
    case 36: // Melon
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="24" fill="#ecfccb" stroke="#65a30d" strokeWidth="3" />
          <path d="M20 16 C 16 30 16 40 24 54" stroke="#65a30d" strokeWidth="2" opacity="0.4" />
          <path d="M44 16 C 48 30 48 40 40 54" stroke="#65a30d" strokeWidth="2" opacity="0.4" />
          <path d="M32 8 L 32 56" stroke="#65a30d" strokeWidth="2" opacity="0.4" />
        </svg>
      );
    case 40: // Watermelon
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="26" fill="#bbf7d0" stroke="#15803d" strokeWidth="3" />
          <path d="M16 12 C 10 24 10 40 16 52 M 24 8 C 16 20 16 44 24 56 M 40 8 C 48 20 48 44 40 56 M 48 12 C 54 24 54 40 48 52" stroke="#15803d" strokeWidth="4" />
        </svg>
      );
    default:
      return null;
  }
}

// ─── Shared components ────────────────────────────────────────────────────────

function Card({ children, className = "", style = {}, t }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; t: Theme;
}) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ background: t.card, boxShadow: `0 2px 16px ${t.shadow}`, ...style }}>
      {children}
    </div>
  );
}

function PillBtn({ children, onClick, full = false, variant = "primary", size = "md", disabled = false, t }: {
  children: React.ReactNode; onClick?: () => void; full?: boolean; t: Theme;
  variant?: "primary" | "outline" | "sidebar" | "active" | "danger";
  size?: "sm" | "md" | "lg"; disabled?: boolean;
}) {
  const bg   = { primary: t.primary, outline: "transparent", sidebar: t.active, active: t.active, danger: "#ef4444" };
  const fg   = { primary: "#fff", outline: t.active, sidebar: "#fff", active: "#fff", danger: "#fff" };
  const bdr  = variant === "outline" ? `2px solid ${t.active}` : "none";
  const px   = size === "sm" ? "px-4 py-1.5 text-xs" : size === "lg" ? "px-8 py-3.5 text-base" : "px-6 py-2.5 text-sm";
  return (
    <button onClick={onClick} disabled={disabled}
      className={`rounded-full font-bold transition-all flex items-center justify-center gap-2 ${px} ${full ? "w-full" : ""}`}
      style={{ background: disabled ? "#e0d8e0" : bg[variant], color: disabled ? "#b0a8b0" : fg[variant], border: bdr }}
    >
      {children}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-extrabold mb-4 uppercase tracking-wider" style={{ color: "#4A4E4D", opacity: 0.6 }}>{children}</h2>;
}

function StatTile({ label, value, sub, t, accent = false }: {
  label: string; value: string | number; sub?: string; t: Theme; accent?: boolean;
}) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{ background: t.card, boxShadow: `0 2px 12px ${t.shadow}` }}>
      <p className="text-xs font-medium mb-1" style={{ color: t.muted }}>{label}</p>
      <p className="text-2xl font-extrabold leading-none" style={{ color: accent ? t.active : t.dark }}>{value}</p>
      {sub && <p className="text-[10px] mt-1" style={{ color: t.muted }}>{sub}</p>}
    </div>
  );
}

// ─── Profile & Settings ───────────────────────────────────────────────────────

type UserProfile = {
  motherName: string;
  fatherName: string;
  email: string;
  phone: string;
  hphtDate: string;
  hospital: string;
  doctor: string;
  bloodType: string;
  syncCode: string;
  notifVitamin: boolean;
  notifAnc: boolean;
  notifEmergencySound: boolean;
  notifWeeklyReport: boolean;
};

function SettingsModal({
  isOpen,
  onClose,
  t,
  profile,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  t: Theme;
  profile: UserProfile;
  onSave: (newProfile: UserProfile) => void;
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"profile" | "pregnancy" | "sync" | "notif" | "security">("profile");
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(formData.syncCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      setPasswordMsg("Harap isi semua kolom kata sandi.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    setPasswordMsg("Kata sandi berhasil diperbarui!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all"
        style={{ background: "#ffffff", border: `1px solid ${t.border}`, maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b flex-shrink-0" style={{ borderColor: t.border, background: t.soft }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ background: t.grad }}>
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold leading-tight" style={{ color: t.dark }}>Pengaturan Akun & Aplikasi</h2>
              <p className="text-xs mt-0.5" style={{ color: t.muted }}>Kelola profil, data kehamilan, notifikasi, dan keamanan</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
            style={{ color: t.muted }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar Tabs */}
          <div className="w-56 p-4 border-r flex-shrink-0 space-y-1 bg-gray-50/50" style={{ borderColor: t.border }}>
            {[
              { id: "profile", label: "Profil Saya", icon: User },
              { id: "pregnancy", label: "Data Kehamilan", icon: Baby },
              { id: "sync", label: "Sinkronisasi Pasangan", icon: Smartphone },
              { id: "notif", label: "Notifikasi & Pengingat", icon: Bell },
              { id: "security", label: "Keamanan & Sandi", icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left"
                  style={{
                    background: isActive ? t.soft : "transparent",
                    color: isActive ? t.active : t.muted,
                  }}
                >
                  <Icon size={16} color={isActive ? t.active : t.muted} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5" style={{ scrollbarWidth: "none" }}>
            
            {/* TAB 1: PROFIL */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: t.border }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-md" style={{ background: t.grad }}>
                    {formData.motherName[0] || "S"}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: t.dark }}>{formData.motherName}</p>
                    <p className="text-xs" style={{ color: t.muted }}>{formData.email}</p>
                    <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1" style={{ background: t.soft, color: t.active }}>
                      Akun Ibu Hamil & Suami
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Nama Lengkap Ibu</label>
                    <input
                      type="text"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all"
                      style={{ borderColor: t.border, background: "#fafafa", color: t.dark }}
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Nama Suami / Pendamping</label>
                    <input
                      type="text"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all"
                      style={{ borderColor: t.border, background: "#fafafa", color: t.dark }}
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Email Utama</label>
                    <input
                      type="email"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all"
                      style={{ borderColor: t.border, background: "#fafafa", color: t.dark }}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Nomor WhatsApp / HP</label>
                    <input
                      type="text"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all"
                      style={{ borderColor: t.border, background: "#fafafa", color: t.dark }}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KEHAMILAN */}
            {activeTab === "pregnancy" && (
              <div className="space-y-4">
                <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: t.soft }}>
                  <Baby size={24} color={t.active} />
                  <div>
                    <p className="text-xs font-bold" style={{ color: t.dark }}>Informasi Medis & Kehamilan</p>
                    <p className="text-[11px]" style={{ color: t.muted }}>Data ini digunakan untuk menghitung usia kehamilan dan HPL secara akurat.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Tanggal HPHT (Hari Pertama Haid Terakhir)</label>
                    <input
                      type="date"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all bg-white"
                      style={{ borderColor: t.border, color: t.dark }}
                      value={formData.hphtDate}
                      onChange={(e) => setFormData({ ...formData, hphtDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Golongan Darah Ibu</label>
                    <select
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all bg-white"
                      style={{ borderColor: t.border, color: t.dark }}
                      value={formData.bloodType}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Rumah Sakit / Klinik Rujukan</label>
                    <input
                      type="text"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all"
                      style={{ borderColor: t.border, background: "#fafafa", color: t.dark }}
                      value={formData.hospital}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Dokter Kandungan (Sp.OG)</label>
                    <input
                      type="text"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all"
                      style={{ borderColor: t.border, background: "#fafafa", color: t.dark }}
                      value={formData.doctor}
                      onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SINKRONISASI */}
            {activeTab === "sync" && (
              <div className="space-y-4">
                <div className="rounded-2xl p-5 border text-center space-y-3" style={{ borderColor: t.border, background: "#fcfcfc" }}>
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                    <CheckCheck size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-700">Akun Tersinkronisasi</p>
                    <p className="text-xs" style={{ color: t.muted }}>
                      Terhubung dengan perangkat <strong>{formData.fatherName}</strong>
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 border bg-white shadow-sm" style={{ borderColor: t.border }}>
                    <span className="text-xl font-black tracking-widest" style={{ color: t.dark, fontFamily: "monospace" }}>
                      {formData.syncCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Salin Kode"
                    >
                      <Copy size={16} color={t.active} />
                    </button>
                  </div>
                  {copied && <p className="text-xs font-bold text-green-600">Kode berhasil disalin!</p>}
                </div>
                <p className="text-xs text-center" style={{ color: t.muted }}>
                  Suami dapat memasukkan kode di atas saat login sebagai Mode Pendamping untuk memantau grafik kesehatan & menerima notifikasi darurat secara realtime.
                </p>
              </div>
            )}

            {/* TAB 4: NOTIFIKASI */}
            {activeTab === "notif" && (
              <div className="space-y-3">
                {[
                  { key: "notifVitamin", title: "Pengingat Minum Vitamin Harian", desc: "Terima notifikasi jadwal minum asam folat, kalsium & zat besi (08:00 & 20:00)" },
                  { key: "notifAnc", title: "Pengingat Jadwal Kontrol ANC", desc: "Peringatan H-1 sebelum jadwal pemeriksaan ke dokter kandungan" },
                  { key: "notifEmergencySound", title: "Suara Sirine Mode Darurat", desc: "Bunyikan alarm volume maksimal saat menekan tombol darurat" },
                  { key: "notifWeeklyReport", title: "Laporan Mingguan Perkembangan Janin", desc: "Rangkuman kesehatan dan perkembangan organ janin tiap awal minggu" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl border transition-all" style={{ borderColor: t.border, background: "#ffffff" }}>
                    <div>
                      <p className="text-xs font-bold" style={{ color: t.dark }}>{item.title}</p>
                      <p className="text-[11px]" style={{ color: t.muted }}>{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key as keyof UserProfile] })}
                      className="w-12 h-6 rounded-full p-1 transition-colors duration-200 flex items-center flex-shrink-0"
                      style={{ background: formData[item.key as keyof UserProfile] ? t.active : "#e5e7eb" }}
                    >
                      <div
                        className="w-4 h-4 rounded-full bg-white transition-transform duration-200"
                        style={{ transform: formData[item.key as keyof UserProfile] ? "translateX(24px)" : "translateX(0px)" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: KEAMANAN */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Kata Sandi Saat Ini</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all"
                      style={{ borderColor: t.border, background: "#fafafa", color: t.dark }}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Kata Sandi Baru</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all"
                      style={{ borderColor: t.border, background: "#fafafa", color: t.dark }}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Konfirmasi Kata Sandi Baru</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all"
                      style={{ borderColor: t.border, background: "#fafafa", color: t.dark }}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  {passwordMsg && (
                    <p className={`text-xs font-bold ${passwordMsg.includes("berhasil") ? "text-green-600" : "text-red-500"}`}>
                      {passwordMsg}
                    </p>
                  )}

                  <button
                    onClick={handleChangePassword}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                    style={{ background: t.active }}
                  >
                    Perbarui Kata Sandi
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0" style={{ borderColor: t.border, background: t.bg }}>
          {savedSuccess ? (
            <span className="text-xs font-bold text-green-600 flex items-center gap-1.5 animate-pulse">
              <CheckCheck size={16} /> Pengaturan berhasil disimpan!
            </span>
          ) : (
            <span className="text-xs" style={{ color: t.muted }}>Perubahan akan diperbarui secara otomatis di aplikasi</span>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all hover:bg-gray-100"
              style={{ color: t.muted, border: `1px solid ${t.border}` }}
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
              style={{ background: t.grad }}
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode]         = useState<Mode>("mother");
  const [screen, setScreen]     = useState<Screen>("dashboard");
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert]       = useState<EmergencyAlert | null>(null);
  const [vitalLogs, setVitalLogs] = useState<VitalLog[]>(SEED_VITALS);
  const [vitDone, setVitDone]   = useState<Record<string, boolean>>({});
  const [symptoms, setSymptoms] = useState<Record<string, boolean>>({});

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

  const t = THEMES[mode];

  const hpht         = new Date(userProfile.hphtDate || "2024-12-01");
  const dueDate      = addDays(hpht, 280);
  const today        = new Date();
  const daysPreg     = Math.floor((today.getTime() - hpht.getTime()) / 86400000);
  const weeksPreg    = Math.max(1, Math.floor(daysPreg / 7));
  const daysExtra    = Math.max(0, daysPreg % 7);
  const daysUntilDue = Math.max(0, Math.floor((dueDate.getTime() - today.getTime()) / 86400000));
  const fruit        = getFruit(weeksPreg);
  const trimester    = weeksPreg < 13 ? 1 : weeksPreg < 27 ? 2 : 3;

  const screenLabel: Record<Screen, string> = {
    dashboard:  mode === "mother" ? "Dashboard Ibu" : "Dashboard Suami",
    health:     "Pemantauan Kesehatan",
    calendar:   "Kalender & Jadwal",
    reports:    "Laporan Medis",
    resources:  "Persiapan Persalinan",
    emergency:  "Mode Darurat",
    postpartum: "Pasca-Melahirkan",
  };

  const navItems = [
    { id: "dashboard" as Screen, label: "Beranda",   Icon: Home    },
    { id: "health"    as Screen, label: "Kesehatan", Icon: Activity },
    { id: "calendar"  as Screen, label: "Kalender",  Icon: Calendar },
    { id: "reports"   as Screen, label: "Laporan",   Icon: FileText },
    { id: "resources" as Screen, label: "Persiapan", Icon: Package  },
  ];

  if (!isAuthenticated) {
    return <LoginScreen onLogin={(m) => { setMode(m); setIsAuthenticated(true); }} />;
  }

  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen w-full transition-colors duration-300"
      style={{ fontFamily: "'Manrope', sans-serif", background: t.bg }}
    >
      {/* Sidebar */}
      <aside className="flex flex-col flex-shrink-0 sticky top-0 h-screen transition-colors duration-300"
        style={{ width: 240, background: "#ffffff", borderRight: `1px solid ${t.border}` }}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-base"
              style={{ background: t.grad }}>
              M
            </div>
            <div>
              <p className="text-base font-extrabold leading-none" style={{ color: t.dark }}>Mela</p>
              <p className="text-[10px] font-medium mt-0.5" style={{ color: t.muted }}>Pregnancy Companion</p>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="px-4 mb-5 flex-shrink-0">
          <div className="flex rounded-full p-1 gap-1" style={{ background: "#f2f2f2" }}>
            {(["mother", "companion"] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-full text-[12px] font-bold transition-all flex items-center justify-center gap-1"
                style={{
                  background: mode === m ? THEMES[m].grad : "transparent",
                  color: mode === m ? "#fff" : "#999",
                  boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
                }}
              >
                {m === "mother" ? "Ibu" : "Suami"}
              </button>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {navItems.map(({ id, label, Icon }) => {
            const active = screen === id;
            return (
              <button key={id} onClick={() => setScreen(id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  background: active ? t.soft : "transparent",
                  color: active ? t.active : "#999",
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 1.8} color={active ? t.active : "#bbb"} />
                <span className="text-[13px] font-semibold">{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: t.active }} />}
              </button>
            );
          })}
          <div className="pt-2 space-y-1">
            <button onClick={() => setScreen("emergency")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
              style={{ background: screen === "emergency" ? "#fff0f0" : "transparent", color: "#ef4444" }}
            >
              <PhoneCall size={16} strokeWidth={1.8} color="#ef4444" />
              <span className="text-[13px] font-semibold">Mode Darurat</span>
            </button>
          </div>
        </nav>

        {/* Pivot Mode Card */}
        {mode === "mother" && (
          <div className="px-4 pb-4 flex-shrink-0">
            <div onClick={() => setScreen("postpartum")}
              className="rounded-2xl p-3 flex flex-col gap-2.5 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden"
              style={{ background: t.soft, border: `1.5px solid ${t.border}` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Baby size={18} color={t.active} />
                </div>
                <div>
                  <p className="text-[12px] font-extrabold leading-tight" style={{ color: t.dark }}>Bayi Telah Lahir?</p>
                  <p className="text-[10px]" style={{ color: t.muted }}>Beralih ke mode pasca</p>
                </div>
              </div>
              <button className="w-full py-1.5 rounded-xl text-[11px] font-bold text-white transition-all"
                style={{ background: t.grad }}>
                Pivot Mode
              </button>
            </div>
          </div>
        )}

        {/* Profile */}
        <div className="p-4 flex-shrink-0" style={{ borderTop: `1px solid ${t.border}` }}>
          <div 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-all"
            title="Buka Pengaturan"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
              style={{ background: t.grad }}>
              {mode === "mother" ? (userProfile.motherName[0] || "S") : (userProfile.fatherName[0] || "A")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold truncate" style={{ color: t.dark }}>
                {mode === "mother" ? userProfile.motherName : userProfile.fatherName}
              </p>
              <p className="text-[10px] truncate" style={{ color: t.muted }}>
                {mode === "mother" ? `Minggu ke-${weeksPreg}` : "Mode Pendamping"}
              </p>
            </div>
            <Settings size={14} color={t.muted} className="hover:rotate-45 transition-transform" />
          </div>
          <button onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all hover:bg-gray-100"
            style={{ color: t.muted, border: `1px solid ${t.border}` }}>
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 flex-shrink-0 transition-colors duration-300"
          style={{ background: t.bg + "e8", backdropFilter: "blur(12px)", borderBottom: `1px solid ${t.border}` }}
        >
          <div>
            <h1 className="text-xl font-extrabold leading-none" style={{ color: t.dark }}>{screenLabel[screen]}</h1>
            <p className="text-xs mt-0.5" style={{ color: t.muted }}>{fmtDate(today)} · Kehamilan minggu {weeksPreg}+{daysExtra}</p>
          </div>
          <div className="flex items-center gap-3 relative">
            
            {/* Functional Search */}
            <div className="relative">
              <div 
                onClick={() => {
                  setShowSearch(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className="flex items-center gap-2 rounded-full px-4 py-2 cursor-text transition-all" 
                style={{ 
                  background: showSearch ? "#ffffff" : t.card, 
                  border: `1.5px solid ${showSearch ? t.active : t.border}`, 
                  minWidth: showSearch ? 220 : 180,
                  boxShadow: showSearch ? `0 0 0 4px ${t.shadow}` : "none"
                }}
              >
                <Search size={14} color={showSearch ? t.active : t.muted} />
                {showSearch ? (
                  <input
                    ref={searchInputRef}
                    className="w-full text-sm outline-none bg-transparent"
                    style={{ color: t.dark }}
                    placeholder="Cari fitur (mis. Laporan)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  />
                ) : (
                  <span className="text-sm" style={{ color: t.muted }}>Cari fitur…</span>
                )}
              </div>

              {/* Search dropdown results */}
              {showSearch && searchQuery && (
                <div className="absolute top-full mt-2 left-0 right-0 rounded-2xl overflow-hidden z-50 shadow-xl" style={{ background: "#fff", border: `1px solid ${t.border}` }}>
                  {filteredNavItems.length > 0 ? (
                    filteredNavItems.map(item => (
                      <button 
                        key={item.id}
                        onMouseDown={() => {
                          setScreen(item.id);
                          setSearchQuery("");
                          setShowSearch(false);
                        }}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <item.Icon size={14} color={t.muted} />
                        <span className="text-sm font-semibold" style={{ color: t.dark }}>{item.label}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-center" style={{ color: t.muted }}>
                      Fitur tidak ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Functional Notification Bubble */}
            <div className="relative">
              <button 
                onClick={() => setShowNotif(!showNotif)}
                onBlur={() => setTimeout(() => setShowNotif(false), 200)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all focus:outline-none hover:scale-105 shadow-sm"
                style={{ 
                  background: showNotif ? t.soft : t.card,
                  border: `1.5px solid ${t.border}`,
                  boxShadow: showNotif ? `0 0 0 3px ${t.shadow}` : "none"
                }}
              >
                <Bell size={16} color={showNotif ? t.active : t.muted} />
                {alert && mode === "companion" && !alert.husbandAck && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                )}
              </button>

              {/* Notif Popover */}
              {showNotif && (
                <div className="absolute top-full mt-3 right-0 w-72 rounded-2xl p-4 shadow-xl z-50" style={{ background: "#fff", border: `1px solid ${t.border}` }}>
                  <p className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: t.dark }}>Notifikasi</p>
                  {alert && mode === "companion" && !alert.husbandAck ? (
                    <div className="rounded-xl p-3 flex flex-col gap-2" style={{ background: "#fef2f2", border: "1px solid #fca5a5" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <p className="text-[11px] font-bold text-red-700">Panggilan Darurat!</p>
                      </div>
                      <p className="text-xs text-red-600">"{alert.message}"</p>
                      <button onClick={() => { setScreen("emergency"); setShowNotif(false); }} className="w-full mt-1 py-1.5 rounded-lg text-[10px] font-bold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
                        Lihat Detail
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Bell size={24} color={t.muted} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs" style={{ color: t.muted }}>Tidak ada notifikasi baru.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Functional Profile Bubble */}
            <div className="relative">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                onBlur={() => setTimeout(() => setShowProfile(false), 200)}
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm hover:scale-105 transition-all shadow-sm focus:outline-none" 
                style={{ 
                  background: t.grad,
                  boxShadow: showProfile ? `0 0 0 3px ${t.shadow}` : "none"
                }}
              >
                {mode === "mother" ? (userProfile.motherName[0] || "S") : (userProfile.fatherName[0] || "A")}
              </button>

              {/* Profile Popover */}
              {showProfile && (
                <div className="absolute top-full mt-3 right-0 w-64 rounded-2xl p-4 shadow-xl z-50 animate-fade-in" style={{ background: "#fff", border: `1px solid ${t.border}` }}>
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b" style={{ borderColor: t.border }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: t.grad }}>
                      {mode === "mother" ? (userProfile.motherName[0] || "S") : (userProfile.fatherName[0] || "A")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold truncate" style={{ color: t.dark }}>
                        {mode === "mother" ? userProfile.motherName : userProfile.fatherName}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: t.muted }}>
                        {userProfile.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShowSettings(true);
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors text-left" 
                      style={{ color: t.dark }}
                    >
                      <Settings size={15} color={t.muted} /> Pengaturan Akun
                    </button>
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setScreen("reports");
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors text-left" 
                      style={{ color: t.dark }}
                    >
                      <History size={15} color={t.muted} /> Riwayat Medis
                    </button>
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsAuthenticated(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold mt-1 transition-colors flex items-center gap-2.5" 
                      style={{ color: "#ef4444", background: "#fef2f2" }}
                    >
                      <LogOut size={15} /> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: "none" }}>
          {screen === "dashboard"  && mode === "mother"    && <MotherDashboard    t={t} weeksPreg={weeksPreg} daysExtra={daysExtra} daysUntilDue={daysUntilDue} dueDate={dueDate} fruit={fruit} trimester={trimester} onEmergency={() => setScreen("emergency")} onGoHealth={() => setScreen("health")} vitDone={vitDone} symptoms={symptoms} motherName={userProfile.motherName} />}
          {screen === "dashboard"  && mode === "companion" && <CompanionDashboard t={t} weeksPreg={weeksPreg} daysExtra={daysExtra} alert={alert} onAck={() => setAlert(a => a ? { ...a, husbandAck: true } : a)} onSetEta={eta => setAlert(a => a ? { ...a, husbandEta: eta } : a)} motherName={userProfile.motherName} />}
          {screen === "health"     && <HealthScreen    t={t} onEmergency={() => setScreen("emergency")} vitalLogs={vitalLogs} onAddVital={v => setVitalLogs(p => [...p, v])} vitDone={vitDone} setVitDone={setVitDone} symptoms={symptoms} setSymptoms={setSymptoms} />}
          {screen === "calendar"   && <CalendarScreen  t={t} dueDate={dueDate} weeksPreg={weeksPreg} daysUntilDue={daysUntilDue} trimester={trimester} />}
          {screen === "reports"    && <ReportsScreen   t={t} vitalLogs={vitalLogs} onAddVital={v => setVitalLogs(p => [...p, v])} weeksPreg={weeksPreg} dueDate={dueDate} />}
          {screen === "resources"  && <ResourcesScreen t={t} />}
          {screen === "emergency"  && <EmergencyScreen t={t} mode={mode} alert={alert} onSendAlert={a => { setAlert(a); }} onBack={() => setScreen("dashboard")} />}
          {screen === "postpartum" && <PostpartumScreen t={t} onBack={() => setScreen("dashboard")} />}
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        t={t}
        profile={userProfile}
        onSave={(updated) => setUserProfile(updated)}
      />
    </div>
  );
}

// ─── Organ chip ───────────────────────────────────────────────────────────────

function OrganChip({ Icon, label, active, onClick, t }: {
  Icon: React.ElementType; label: string; active: boolean; onClick: () => void; t: Theme;
}) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl px-5 py-3 transition-all"
      style={{
        background: active ? t.active : t.soft,
        border: active ? "none" : `1.5px solid ${t.border}`,
        minWidth: 80,
      }}
    >
      <div className={`p-2 rounded-full ${active ? 'bg-white/20' : 'bg-white'}`}>
        <Icon size={24} color={active ? "#fff" : t.active} strokeWidth={1.5} />
      </div>
      <span className="text-[11px] font-bold leading-tight text-center" style={{ color: active ? "#fff" : t.dark }}>{label}</span>
    </button>
  );
}

// ─── Mother Dashboard ─────────────────────────────────────────────────────────

function getOrganData(weeks: number) {
  if (weeks <= 8) return [
    { Icon: Brain,       label: "Otak",    desc: "Tabung saraf menutup dan otak mulai membentuk tiga bagian utama: otak depan, tengah, dan belakang." },
    { Icon: HeartPulse,  label: "Jantung", desc: "Jantung sudah berdetak! Tabung jantung sederhana mulai memompa darah pertama kalinya." },
    { Icon: Eye,         label: "Mata",    desc: "Cekungan mata mulai terbentuk sebagai bintik-bintik gelap di kedua sisi kepala." },
    { Icon: Bone,        label: "Kuncup",  desc: "Kuncup lengan dan kaki mulai muncul. Tangan dan kaki berbentuk seperti dayung kecil." },
    { Icon: ActivityIcon,label: "Organ",   desc: "Usus, hati, dan ginjal primitif mulai terbentuk dari lapisan sel dalam." },
  ];
  if (weeks <= 13) return [
    { Icon: Brain,       label: "Otak",    desc: "Otak berkembang pesat — neuron terbentuk jutaan per menit. Refleks dasar mulai aktif." },
    { Icon: HeartPulse,  label: "Jantung", desc: "Empat ruang jantung terbentuk. Detak dapat terdeteksi jelas lewat USG Doppler." },
    { Icon: Wind,        label: "Paru",    desc: "Tunas paru-paru mulai bercabang membentuk bronkus. Belum berfungsi, tapi sudah ada." },
    { Icon: Eye,         label: "Mata",    desc: "Kelopak mata terbentuk dan menutup untuk melindungi retina yang sedang berkembang." },
    { Icon: Bone,        label: "Tulang",  desc: "Tulang rawan mulai mengeras menjadi tulang sejati. Jari tangan dan kaki sudah terpisah." },
  ];
  if (weeks <= 19) return [
    { Icon: Brain,       label: "Otak",    desc: "Permukaan otak mulai menunjukkan lekukan awal. Bayi sudah bisa merasakan sentuhan ringan." },
    { Icon: HeartPulse,  label: "Jantung", desc: "Jantung berdetak 140–170 kali/menit. Suaranya bisa didengar dengan stetoskop biasa." },
    { Icon: Wind,        label: "Paru",    desc: "Cabang bronkus terbentuk lebih banyak. Paru masih belum bisa bernapas udara." },
    { Icon: Eye,         label: "Mata",    desc: "Alis dan bulu mata mulai tumbuh. Mata masih menutup rapat di balik kelopak." },
    { Icon: Bone,        label: "Tulang",  desc: "Kerangka tulang semakin kuat. Gerakan janin mulai terasa sebagai 'flutter' halus." },
  ];
  if (weeks <= 27) return [
    { Icon: Brain,       label: "Otak",    desc: "Otak menyimpan memori dan mulai mengatur ritme tidur-bangun. Bayi bisa kaget oleh suara keras." },
    { Icon: HeartPulse,  label: "Jantung", desc: "Sistem kardiovaskular matang. Jantung memompa sekitar 25 liter darah per hari." },
    { Icon: Wind,        label: "Paru",    desc: "Surfaktan mulai diproduksi — zat penting agar kantung udara tidak kolaps saat lahir." },
    { Icon: Eye,         label: "Mata",    desc: "Mata mulai membuka! Pupil bereaksi terhadap cahaya yang menembus dinding perut." },
    { Icon: Bone,        label: "Tulang",  desc: "Sumsum tulang mulai memproduksi sel darah merah. Kalsium dari ibu diserap aktif." },
  ];
  if (weeks <= 35) return [
    { Icon: Brain,       label: "Otak",    desc: "Korteks serebral berkembang pesat — otak mulai membentuk lipatan yang meningkatkan kapasitas pemrosesan." },
    { Icon: HeartPulse,  label: "Jantung", desc: "Jantung berdetak 120–160 kali/menit. Empat ruang jantung sudah terbentuk sempurna." },
    { Icon: Wind,        label: "Paru",    desc: "Paru-paru berlatih bernapas dengan menghirup cairan amnion. Surfaktan terus meningkat." },
    { Icon: Eye,         label: "Mata",    desc: "Mata bisa merespons perubahan cahaya yang masuk melalui dinding perut ibu." },
    { Icon: Bone,        label: "Tulang",  desc: "Tulang semakin mengeras. Kalsium dari asupan ibu sangat penting pada fase ini." },
  ];
  return [
    { Icon: Brain,       label: "Otak",    desc: "Otak hampir sempurna — lipatan kortikal matang. Bayi sudah belajar dari stimulasi suara dan cahaya." },
    { Icon: HeartPulse,  label: "Jantung", desc: "Sistem sirkulasi siap mandiri. Setelah lahir, foramen ovale jantung akan menutup otomatis." },
    { Icon: Wind,        label: "Paru",    desc: "Paru-paru sudah matang dan siap bernapas udara. Produksi surfaktan optimal untuk kelahiran." },
    { Icon: Eye,         label: "Mata",    desc: "Penglihatan fokus ±20–30 cm — tepat jarak dari muka ibu saat menyusui." },
    { Icon: Bone,        label: "Tulang",  desc: "Tengkorak masih lunak untuk memudahkan persalinan. Tulang-tulang lain sudah keras dan siap." },
  ];
}

function MotherDashboard({ t, weeksPreg, daysExtra, daysUntilDue, dueDate, fruit, trimester, onEmergency, onGoHealth, vitDone, symptoms, motherName }: {
  t: Theme; weeksPreg: number; daysExtra: number; daysUntilDue: number;
  dueDate: Date; fruit: ReturnType<typeof getFruit>; trimester: number;
  onEmergency: () => void; onGoHealth: () => void;
  vitDone: Record<string, boolean>; symptoms: Record<string, boolean>;
  motherName?: string;
}) {
  const [activeChip, setActiveChip] = useState(0);
  const [showOrgans, setShowOrgans] = useState(false);
  const chips = getOrganData(weeksPreg);

  return (
    <div className="space-y-6 w-full">
      {/* Hero */}
      <div className="rounded-3xl overflow-hidden flex" style={{ background: t.grad, minHeight: 180 }}>
        <div className="flex-1 p-8">
          <p className="text-sm font-semibold mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>Selamat Datang, {motherName || "Bunda"}</p>
          <p className="text-4xl font-extrabold text-white leading-tight">
            Minggu ke-<span style={{ color: "rgba(255,255,255,0.85)" }}>{weeksPreg}</span>
            <span className="text-xl font-semibold ml-2" style={{ color: "rgba(255,255,255,0.5)" }}>+ {daysExtra} hari</span>
          </p>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>HPL: {fmtDate(dueDate)}</p>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => { setShowOrgans(v => !v); setActiveChip(0); }}
              className="rounded-full px-6 py-2.5 text-sm font-bold transition-all flex items-center gap-2"
              style={{ background: showOrgans ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.22)", color: "#fff" }}>
              {showOrgans ? "Tutup Perkembangan" : "Lihat Perkembangan"}
            </button>
            <button onClick={onEmergency}
              className="rounded-full px-6 py-2.5 text-sm font-bold transition-all"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
              Darurat
            </button>
          </div>
        </div>
        {/* Clickable fruit */}
        <button
          onClick={() => { setShowOrgans(v => !v); setActiveChip(0); }}
          className="flex flex-col items-center justify-center px-10 py-6 transition-all group relative"
          style={{ background: showOrgans ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)" }}
          title="Lihat perkembangan organ minggu ini"
        >
          <div
            className="w-20 h-20 mb-3 transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
            style={{ filter: showOrgans ? "drop-shadow(0 0 16px rgba(255,255,255,0.6))" : "drop-shadow(0 4px 12px rgba(0,0,0,0.1))" }}>
            <FruitIllustration type={fruit.typeId} />
          </div>
          <p className="text-sm font-bold text-white text-center">{fruit.name}</p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>{fruit.weight} · {fruit.length}</p>
          <span className="mt-2 text-[10px] font-semibold rounded-full px-2.5 py-0.5 transition-all"
            style={{ background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)" }}>
            {showOrgans ? "▲ tutup" : "▼ perkembangan"}
          </span>
        </button>
      </div>

      {/* Organ panel — slides in below hero when fruit is clicked */}
      {showOrgans && (
        <Card t={t} className="p-6" style={{ borderLeft: `4px solid ${t.active}` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <SectionTitle>Perkembangan Organ — Minggu {weeksPreg}</SectionTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-5 h-5">
                  <FruitIllustration type={fruit.typeId} />
                </div>
                <p className="text-xs" style={{ color: t.muted }}>
                  {fruit.name} · {fruit.weight} · {fruit.length}
                </p>
              </div>
            </div>
            <button onClick={() => setShowOrgans(false)} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: t.soft, color: t.muted }}>
              Tutup ✕
            </button>
          </div>
          <div className="flex gap-3 flex-wrap mb-4">
            {chips.map((c, i) => (
              <OrganChip key={i} Icon={c.Icon} label={c.label} active={activeChip === i} onClick={() => setActiveChip(i)} t={t} />
            ))}
          </div>
          <div className="rounded-2xl p-5" style={{ background: t.soft }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                {(() => {
                  const ActiveIcon = chips[activeChip].Icon;
                  return <ActiveIcon size={20} color={t.active} strokeWidth={1.5} />;
                })()}
              </div>
              <p className="text-sm font-extrabold" style={{ color: t.dark }}>{chips[activeChip].label}</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: t.muted }}>{chips[activeChip].desc}</p>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatTile label="Sisa Hari"      value={daysUntilDue} sub="Menuju HPL"       t={t} accent />
        <StatTile label="Trimester"      value={trimester}    sub="dari 3 trimester" t={t} />
        <StatTile label="Berat Janin"    value={fruit.weight} sub="estimasi"         t={t} />
        <StatTile label="Status Hari Ini" value="Normal"      sub="Tidak ada bahaya" t={t} />
      </div>

      {/* Widget ringkasan harian */}
      {(() => {
        const TOTAL_VIT = 4;
        const vitCount  = Object.values(vitDone).filter(Boolean).length;
        const symCount  = Object.values(symptoms).filter(Boolean).length;
        const vitAllDone = vitCount === TOTAL_VIT;
        const symLogged  = symCount > 0;
        return (
          <button onClick={onGoHealth} className="w-full text-left">
            <div className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all hover:brightness-95"
              style={{ background: t.soft, border: `1.5px solid ${t.border}` }}>
              <div className="text-xs font-bold uppercase tracking-wide flex-shrink-0" style={{ color: t.muted }}>Pemantauan Harian</div>
              <div className="flex gap-3 flex-1">
                {/* Vitamin */}
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white flex-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: vitAllDone ? "#22c55e" : t.primary }}>
                    {vitAllDone
                      ? <Check size={13} className="text-white" />
                      : <span className="text-[10px] font-bold text-white">V</span>}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold" style={{ color: vitAllDone ? "#166534" : t.dark }}>Vitamin</p>
                    <p className="text-[10px]" style={{ color: t.muted }}>{vitCount}/{TOTAL_VIT} diminum</p>
                  </div>
                </div>
                {/* Gejala */}
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white flex-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: symLogged ? (symCount >= 1 ? "#f59e0b" : "#22c55e") : t.muted }}>
                    <span className="text-[10px] font-bold text-white">{symLogged ? symCount : "—"}</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold" style={{ color: t.dark }}>Log Gejala</p>
                    <p className="text-[10px]" style={{ color: t.muted }}>{symLogged ? `${symCount} gejala dicatat` : "Belum diisi hari ini"}</p>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold flex-shrink-0" style={{ color: t.active }}>Buka →</span>
            </div>
          </button>
        );
      })()}

      {/* Bottom grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card t={t} className="col-span-2 p-6">
          <SectionTitle>Tips Trimester {trimester}</SectionTitle>
          <p className="text-sm leading-relaxed mb-5" style={{ color: t.muted }}>
            {trimester === 1 && "Istirahat cukup dan konsumsi asam folat 400 mcg setiap hari. Mual pagi hari wajar — makan porsi kecil tapi sering."}
            {trimester === 2 && "Mulai latihan pernapasan ringan dan senam hamil. Janin sudah bisa mendengar suara Anda — ajak bicara dan putar musik lembut."}
            {trimester === 3 && "Pantau gerakan janin setiap hari (min. 10 gerakan / 2 jam). Siapkan tas persalinan dan kenali tanda-tanda persalinan aktif."}
          </p>
          <div className="rounded-2xl p-4" style={{ background: t.soft }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold" style={{ color: t.dark }}>ANC Berikutnya</p>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: t.active }}>Akan Datang</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0" style={{ background: t.primary }}>
                <span className="text-[10px] leading-none">Jan</span>
                <span className="text-lg font-extrabold leading-none">23</span>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: t.dark }}>Tes Diabetes Gestasional</p>
                <p className="text-xs" style={{ color: t.muted }}>RSIA Bunda · Minggu 24–28</p>
              </div>
              <button className="ml-auto text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background: t.primary }}>Detail</button>
            </div>
          </div>
        </Card>

        <Card t={t} className="p-5">
          <SectionTitle>Status Kesehatan</SectionTitle>
          <div className="flex items-center gap-3 rounded-2xl p-3 mb-4" style={{ background: "#f0fdf4" }}>
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-700">Normal</p>
              <p className="text-[11px] text-green-600">Tidak ada bahaya</p>
            </div>
          </div>
          {[
            { l: "Tekanan Darah", v: "118/76 mmHg" },
            { l: "Kenaikan BB",    v: "+11.2 kg"    },
            { l: "Gerakan Janin", v: "8 / 10 kick"  },
          ].map(({ l, v }) => (
            <div key={l} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: t.border }}>
              <p className="text-xs" style={{ color: t.muted }}>{l}</p>
              <p className="text-xs font-bold" style={{ color: t.dark }}>{v}</p>
            </div>
          ))}
          <div className="mt-4">
            <PillBtn full variant="active" size="sm" t={t}>Log Harian</PillBtn>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Companion Dashboard ──────────────────────────────────────────────────────

function CompanionDashboard({ t, weeksPreg, daysExtra, alert, onAck, onSetEta, motherName }: {
  t: Theme; weeksPreg: number; daysExtra: number;
  alert: EmergencyAlert | null;
  onAck: () => void;
  onSetEta: (eta: number) => void;
  motherName?: string;
}) {
  const [paired, setPaired]       = useState(true);
  const [code, setCode]           = useState("");
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [tracking, setTracking]   = useState(false);
  const [pingCount, setPingCount] = useState(0);

  useEffect(() => {
    if (!alert) return;
    const id = setInterval(() => {
      setSecondsAgo(s => s + 1);
      if (tracking) setPingCount(p => p + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [alert, tracking]);

  function handleAck(eta: number) {
    onAck();
    onSetEta(eta);
    setTracking(true);
  }

  if (!paired) {
    return (
      <div className="max-w-md mx-auto space-y-5">
        <div className="rounded-3xl p-10 text-center" style={{ background: t.grad }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
            <Heart size={36} color={t.primary} fill={t.primary} />
          </div>
          <p className="text-2xl font-extrabold text-white">Masuk sebagai Suami</p>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>Masukkan kode sinkronisasi dari aplikasi istri</p>
        </div>
        <Card t={t} className="p-6 space-y-4">
          <p className="text-sm font-bold" style={{ color: t.dark }}>Kode Sinkronisasi</p>
          <input
            className="w-full rounded-full px-5 py-3 text-center text-xl font-black tracking-widest outline-none border-2 transition-all"
            style={{ borderColor: code ? t.primary : t.border, color: t.dark, background: t.soft, fontFamily: "monospace" }}
            placeholder="MELA-XXXX"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={9}
          />
          <PillBtn full variant="primary" size="lg" disabled={code.length < 4} onClick={() => code.length >= 4 && setPaired(true)} t={t}>
            Sambungkan Akun
          </PillBtn>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full">
      {/* Emergency Alert Banner */}
      {alert && (
        <div className="rounded-2xl p-4 flex items-start gap-4 animate-pulse-once"
          style={{ background: "linear-gradient(135deg,#fef2f2,#fff0f0)", border: "2px solid #fca5a5" }}>
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Zap size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-red-700">NOTIFIKASI DARURAT dari Bunda Sari</p>
            <p className="text-xs text-red-600 mt-0.5">"{alert.message}"</p>
            <p className="text-[10px] text-red-400 mt-0.5">
              {secondsAgo < 60 ? `${secondsAgo} detik yang lalu` : `${Math.floor(secondsAgo/60)} menit yang lalu`}
              {" · "}{alert.location}
            </p>
          </div>
          {!alert.husbandAck && (
            <div className="flex gap-2 flex-shrink-0">
              {[5, 10, 15].map(eta => (
                <button key={eta} onClick={() => handleAck(eta)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
                  ~{eta} mnt
                </button>
              ))}
            </div>
          )}
          {alert.husbandAck && (
            <div className="flex items-center gap-1.5 flex-shrink-0 rounded-full px-3 py-1.5" style={{ background: "#f0fdf4" }}>
              <CheckCheck size={12} className="text-green-600" />
              <span className="text-xs font-bold text-green-700">Dikonfirmasi</span>
            </div>
          )}
        </div>
      )}

      {/* Husband status header */}
      <div className="rounded-3xl p-6 flex items-center gap-6" style={{ background: t.grad, boxShadow: `0 4px 24px ${t.shadow}` }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-xl flex-shrink-0" style={{ background: t.active }}>S</div>
        <div className="flex-1">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Akun tersinkronisasi</p>
          <p className="text-xl font-extrabold text-white">{motherName || "Bunda"}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Minggu {weeksPreg}+{daysExtra} · {alert ? "DARURAT" : "Normal"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[{ l: "Vitamin", v: "Sudah" }, { l: "Gerakan", v: "8/10" }, { l: "ANC", v: "23 Jan" }].map(({ l, v }) => (
            <div key={l} className="text-center rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.12)" }}>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{l}</p>
              <p className="text-sm font-bold text-white">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Location Tracker (shows when alert is active) */}
      {alert && (
        <div className="grid grid-cols-2 gap-4">
          {/* Map panel */}
          <Card t={t} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Navigation size={15} color={t.active} />
              <p className="text-sm font-extrabold" style={{ color: t.dark }}>Lacak Lokasi Bunda</p>
              {tracking && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#22c55e" }}>
                  LIVE
                </span>
              )}
            </div>

            {/* Simulated map */}
            <div className="relative rounded-2xl overflow-hidden mb-3" style={{ height: 180, background: "#e8f4e8" }}>
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 180">
                {[30,60,90,120,150,180,210,240,270].map(x => (
                  <line key={x} x1={x} y1={0} x2={x} y2={180} stroke="#c8e6c8" strokeWidth={1} />
                ))}
                {[30,60,90,120,150].map(y => (
                  <line key={y} x1={0} y1={y} x2={300} y2={y} stroke="#c8e6c8" strokeWidth={1} />
                ))}
                {/* Roads */}
                <path d="M 0 95 Q 150 80 300 95" stroke="#d4d4d4" strokeWidth={6} fill="none" />
                <path d="M 130 0 L 130 180" stroke="#d4d4d4" strokeWidth={6} />
                <path d="M 0 95 Q 150 80 300 95" stroke="white" strokeWidth={2} strokeDasharray="8 6" fill="none" />
                {/* Wife location pin - pulsing */}
                <circle cx={155} cy={90} r={tracking ? 14 : 12} fill="rgba(239,68,68,0.15)" />
                <circle cx={155} cy={90} r={tracking ? 8 : 7} fill="rgba(239,68,68,0.3)" />
                <circle cx={155} cy={90} r={5} fill="#ef4444" />
                {/* Husband location */}
                <circle cx={80} cy={120} r={5} fill={t.active} />
                <circle cx={80} cy={120} r={9} fill={t.active} fillOpacity={0.2} />
                {/* Route */}
                <path d="M 80 120 Q 110 105 155 90" stroke={t.active} strokeWidth={2} strokeDasharray="5 4" fill="none" />
                {/* Labels */}
                <text x={163} y={84} fontSize={9} fill="#ef4444" fontWeight="bold">Bunda</text>
                <text x={55} y={136} fontSize={9} fill={t.active} fontWeight="bold">Ayah</text>
              </svg>
              {/* Pulse ring animation */}
              {tracking && (
                <div className="absolute" style={{ left: "calc(155/300*100% - 20px)", top: "calc(90/180*100% - 20px)" }}>
                  <div className="w-10 h-10 rounded-full border-2 border-red-400 animate-ping opacity-50" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { l: "Jarak",    v: `${(2.3 + (tracking ? (pingCount * 0.01) % 0.2 : 0)).toFixed(1)} km` },
                { l: "ETA",      v: alert.husbandEta ? `~${alert.husbandEta} mnt` : "—" },
                { l: "GPS Ping", v: tracking ? `${pingCount}x` : "Off" },
              ].map(({ l, v }) => (
                <div key={l} className="text-center rounded-xl py-2" style={{ background: t.soft }}>
                  <p className="text-[10px]" style={{ color: t.muted }}>{l}</p>
                  <p className="text-sm font-extrabold" style={{ color: t.dark }}>{v}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-2.5 flex items-center gap-2" style={{ background: t.soft }}>
              <MapPin size={12} color={t.active} className="flex-shrink-0" />
              <p className="text-[10px]" style={{ color: t.muted }}>{alert.location}</p>
            </div>
          </Card>

          {/* Response panel */}
          <Card t={t} className="p-5">
            <p className="text-sm font-extrabold mb-3" style={{ color: t.dark }}>Respons Ayah</p>

            {!alert.husbandAck ? (
              <>
                <p className="text-xs mb-3" style={{ color: t.muted }}>Konfirmasi keberangkatan dan estimasi waktu tiba:</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[5, 10, 15, 20].map(eta => (
                    <button key={eta} onClick={() => handleAck(eta)}
                      className="py-3 rounded-xl font-bold text-white transition-all hover:scale-105 text-sm"
                      style={{ background: t.grad }}>
                      ~{eta} menit
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-center" style={{ color: t.muted }}>Pilih estimasi waktu untuk konfirmasi</p>
              </>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl p-4 text-center" style={{ background: "#f0fdf4", border: "1.5px solid #86efac" }}>
                  <CheckCheck size={24} className="text-green-500 mx-auto mb-1" />
                  <p className="text-sm font-extrabold text-green-700">Dalam Perjalanan!</p>
                  <p className="text-xs text-green-600">ETA: ~{alert.husbandEta} menit</p>
                </div>
                <div className="space-y-2">
                  <a href="tel:119" className="flex items-center gap-3 rounded-xl p-3" style={{ background: "#fef2f2" }}>
                    <PhoneCall size={16} color="#ef4444" />
                    <span className="text-sm font-semibold text-red-700">Hubungi 119 (Ambulans)</span>
                  </a>
                  <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: t.soft }}>
                    <Navigation size={16} color={t.active} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: t.dark }}>Navigasi ke lokasi Bunda</p>
                      <p className="text-[10px]" style={{ color: t.muted }}>{alert.location}</p>
                    </div>
                  </div>
                </div>
                {tracking && (
                  <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: t.soft }}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                    <p className="text-xs" style={{ color: t.muted }}>
                      Lokasi Bunda diperbarui tiap 30 detik · Ping #{pingCount}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card t={t} className="col-span-2 p-6">
          <SectionTitle>Yang Bisa Ayah Lakukan Sekarang</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Siapkan makan bergizi untuk Bunda malam ini",
              "Temani Bunda latihan pernapasan 10 menit",
              "Pastikan tas persalinan sudah 80% terpak",
              "Tanyakan kondisi Bunda setelah makan siang",
              "Siapkan rute ke RS rujukan dan cek BBM kendaraan",
              "Simpan nomor dokter di kecepatan panggil",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl p-3" style={{ background: t.soft }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[10px] font-bold" style={{ background: t.primary }}>
                  {i + 1}
                </div>
                <p className="text-sm leading-snug" style={{ color: t.dark }}>{tip}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card t={t} className="p-5">
          <SectionTitle>Jadwal Bersama</SectionTitle>
          <div className="space-y-3">
            {[
              { date: "23 Jan", label: "ANC Trimester 3",  sub: "RSIA Bunda · 10:00",  active: true  },
              { date: "28 Jan", label: "USG Biometri",      sub: "dr. Ratna · 14:00",   active: false },
              { date: "10 Feb", label: "Kelas Persalinan", sub: "Klinik Bunda Sehat",   active: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: t.soft }}>
                <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white" style={{ background: item.active ? t.active : t.primary }}>
                  <p className="text-[9px] leading-none opacity-70">{item.date.split(" ")[1]}</p>
                  <p className="text-sm font-bold leading-none">{item.date.split(" ")[0]}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: t.dark }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: t.muted }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (mode: Mode) => void }) {
  const [loginMode, setLoginMode] = useState<Mode>("mother");
  const [authView, setAuthView] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const t = THEMES[loginMode];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 relative overflow-hidden" style={{ background: t.bg }}>
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-3xl opacity-40 transition-colors duration-500" style={{ background: t.primary }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full blur-3xl opacity-40 transition-colors duration-500" style={{ background: t.active }} />

      <div className={`w-full relative z-10 transition-all duration-500 ${authView === "register" ? "max-w-xl" : "max-w-sm"}`}>
        <Card t={t} className="p-8 pb-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center font-extrabold text-white text-3xl mb-4 shadow-lg transition-colors duration-500"
              style={{ background: t.grad }}>
              M
            </div>
            <p className="text-2xl font-extrabold" style={{ color: t.dark }}>
              {authView === "login" 
                ? (loginMode === "mother" ? "Halo, Bunda!" : "Halo, Ayah!")
                : authView === "register" 
                ? (loginMode === "mother" ? "Selamat datang, Bunda!" : "Selamat datang, Ayah!")
                : "Atur Ulang Sandi"
              }
            </p>
            <p className="text-sm mt-1 px-2 leading-relaxed" style={{ color: t.muted }}>
              {authView === "login" 
                ? (loginMode === "mother" ? "Senang melihat Anda kembali. Mari pantau si kecil hari ini." : "Siap mendampingi Bunda dan si kecil hari ini?")
                : authView === "register" 
                ? (loginMode === "mother" ? "Mari mulai perjalanan indah keibuan Anda bersama Mela." : "Mari bersiap jadi pendamping siaga yang hebat untuk Bunda.")
                : "Masukkan email untuk tautan pemulihan sandi akun Anda."
              }
            </p>
          </div>

          {/* Mode Toggle (only in login/register) */}
          {authView !== "forgot" && (
            <div className="flex rounded-full p-1.5 gap-1 mb-8" style={{ background: "#f2f2f2" }}>
              {(["mother", "companion"] as Mode[]).map(m => (
              <button key={m} onClick={() => setLoginMode(m)}
                className="flex-1 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{
                  background: loginMode === m ? THEMES[m].grad : "transparent",
                  color: loginMode === m ? "#fff" : "#999",
                  boxShadow: loginMode === m ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                }}
              >
                {m === "mother" ? "Ibu" : "Suami"}
              </button>
              ))}
            </div>
          )}

          {/* Form */}
          <div className={authView === "register" ? "grid grid-cols-2 gap-x-4 gap-y-4" : "space-y-4"}>
            {authView === "register" ? (
              <>
                <div className="col-span-1">
                  <p className="text-xs font-bold mb-1.5 ml-1" style={{ color: t.dark }}>Nama Lengkap</p>
                  <input
                    type="text"
                    className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none border-2 transition-all focus:bg-white"
                    style={{ borderColor: "transparent", background: "#f2f2f2", color: t.dark }}
                    placeholder="Nama Anda"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={e => e.target.style.borderColor = t.active}
                    onBlur={e => e.target.style.borderColor = "transparent"}
                  />
                </div>
                <div className="col-span-1">
                  <p className="text-xs font-bold mb-1.5 ml-1" style={{ color: t.dark }}>Email atau Nomor HP</p>
                  <div className="relative">
                    <Mail size={16} color={t.muted} className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border-2 transition-all focus:bg-white"
                      style={{ borderColor: "transparent", background: "#f2f2f2", color: t.dark }}
                      placeholder="bunda@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={e => e.target.style.borderColor = t.active}
                      onBlur={e => e.target.style.borderColor = "transparent"}
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <p className="text-xs font-bold mb-1.5 ml-1 leading-none" style={{ color: t.dark }}>Kata Sandi</p>
                  <div className="relative">
                    <Lock size={16} color={t.muted} className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border-2 transition-all focus:bg-white"
                      style={{ borderColor: "transparent", background: "#f2f2f2", color: t.dark }}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={e => e.target.style.borderColor = t.active}
                      onBlur={e => e.target.style.borderColor = "transparent"}
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <p className="text-xs font-bold mb-1.5 ml-1" style={{ color: t.dark }}>Konfirmasi Kata Sandi</p>
                  <div className="relative">
                    <Lock size={16} color={t.muted} className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border-2 transition-all focus:bg-white"
                      style={{ borderColor: "transparent", background: "#f2f2f2", color: t.dark }}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      onFocus={e => e.target.style.borderColor = t.active}
                      onBlur={e => e.target.style.borderColor = "transparent"}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs font-bold mb-1.5 ml-1" style={{ color: t.dark }}>Email atau Nomor HP</p>
                  <div className="relative">
                    <Mail size={16} color={t.muted} className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border-2 transition-all focus:bg-white"
                      style={{ borderColor: "transparent", background: "#f2f2f2", color: t.dark }}
                      placeholder="bunda@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={e => e.target.style.borderColor = t.active}
                      onBlur={e => e.target.style.borderColor = "transparent"}
                    />
                  </div>
                </div>
                {authView !== "forgot" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <p className="text-xs font-bold leading-none" style={{ color: t.dark }}>Kata Sandi</p>
                      <button 
                        onClick={() => setAuthView("forgot")} 
                        className="text-[11px] font-bold leading-none p-0 bg-transparent outline-none hover:underline" 
                        style={{ color: t.active }}
                      >
                        Lupa sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} color={t.muted} className="absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border-2 transition-all focus:bg-white"
                        style={{ borderColor: "transparent", background: "#f2f2f2", color: t.dark }}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={e => e.target.style.borderColor = t.active}
                        onBlur={e => e.target.style.borderColor = "transparent"}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button 
              onClick={() => {
                if (authView === "login" || authView === "register") {
                  onLogin(loginMode);
                } else {
                  setAuthView("login"); // Simulation of reset sent
                  alert("Tautan pemulihan sandi telah dikirim!");
                }
              }}
              className={`w-full py-4 rounded-2xl font-extrabold text-white text-base shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${authView === "register" ? "col-span-2 mt-4" : "mt-2"}`}
              style={{ background: t.grad, boxShadow: `0 8px 24px ${t.shadow}` }}>
              {authView === "login" ? "Masuk" : authView === "register" ? "Daftar Sekarang" : "Kirim Tautan"}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            {authView === "login" ? (
              <p className="text-xs" style={{ color: t.muted }}>
                Belum punya akun? <button onClick={() => setAuthView("register")} className="text-xs font-bold ml-1" style={{ color: t.active }}>Daftar sekarang</button>
              </p>
            ) : authView === "register" ? (
              <p className="text-xs" style={{ color: t.muted }}>
                Sudah punya akun? <button onClick={() => setAuthView("login")} className="text-xs font-bold ml-1" style={{ color: t.active }}>Masuk di sini</button>
              </p>
            ) : (
              <button onClick={() => setAuthView("login")} className="text-xs font-bold" style={{ color: t.active }}>Kembali ke Halaman Masuk</button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Health Screen ────────────────────────────────────────────────────────────

// ─── Vitamin Tracker (reusable, self-contained daily state) ──────────────────

function VitaminTracker({ t, done, setDone, className = "" }: { t: Theme; done: Record<string, boolean>; setDone: React.Dispatch<React.SetStateAction<Record<string, boolean>>>; className?: string }) {
  const VITAMINS = [
    { id: "folat",   label: "Asam Folat", dose: "400 mcg", color: "#e899a6" },
    { id: "besi",    label: "Zat Besi",   dose: "60 mg",   color: "#ef4444" },
    { id: "kalsium", label: "Kalsium",    dose: "500 mg",  color: "#a0a0a0" },
    { id: "vitD",    label: "Vitamin D",  dose: "400 IU",  color: "#f59e0b" },
  ];
  const pct = Math.round((Object.values(done).filter(Boolean).length / VITAMINS.length) * 100);
  const allDone = pct === 100;

  return (
    <Card t={t} className={`p-5 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <SectionTitle>Vitamin Hari Ini</SectionTitle>
        <span className="text-xs font-bold" style={{ color: allDone ? "#22c55e" : t.active }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: t.soft }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: allDone ? "#22c55e" : t.active }} />
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {VITAMINS.map(v => (
          <button key={v.id} onClick={() => setDone(p => ({ ...p, [v.id]: !p[v.id] }))}
            className="flex items-center gap-3 rounded-xl px-3 transition-all text-left w-full"
            style={{ background: done[v.id] ? "#f0fdf4" : t.soft, border: `1.5px solid ${done[v.id] ? "#22c55e40" : "transparent"}` }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: done[v.id] ? "#22c55e" : v.color }}>
              {done[v.id]
                ? <Check size={16} className="text-white" />
                : <span className="text-xs font-bold text-white">{v.label[0]}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: done[v.id] ? "#166534" : t.dark }}>{v.label}</p>
              <p className="text-[10px]" style={{ color: t.muted }}>{v.dose}</p>
            </div>
            {done[v.id] && <CheckCheck size={13} className="text-green-500 flex-shrink-0" />}
          </button>
        ))}
      </div>
      {allDone && (
        <div className="mt-3 rounded-xl py-2.5 text-center" style={{ background: "#f0fdf4" }}>
          <p className="text-sm text-green-600 font-bold">Semua vitamin sudah diminum hari ini</p>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-4" style={{ borderTop: `1px solid ${t.border}` }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50"
                    style={{ background: t.soft, color: t.active }}
                  >
                    &larr; Sebelumnya
                  </button>
                  <span className="text-xs font-semibold" style={{ color: t.muted }}>
                    Halaman {page} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50"
                    style={{ background: t.soft, color: t.active }}
                  >
                    Selanjutnya &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
  );
}

function HealthScreen({ t, onEmergency, vitalLogs, onAddVital, vitDone, setVitDone, symptoms, setSymptoms }: {
  t: Theme; onEmergency: () => void;
  vitalLogs: VitalLog[]; onAddVital: (v: VitalLog) => void;
  vitDone: Record<string, boolean>; setVitDone: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  symptoms: Record<string, boolean>; setSymptoms: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const [kick, setKick]               = useState(0);
  const [kickActive, setKickActive]   = useState(false);
  const [kickSecs, setKickSecs]       = useState(0);
  const [kickStartAt, setKickStartAt] = useState<number | null>(null);
  const [contrActive, setContrActive] = useState(false);
  const [contrStart, setContrStart]   = useState<number | null>(null);
  const [lastEnd, setLastEnd]         = useState<number | null>(null);
  const [elapsed, setElapsed]         = useState(0);
  const [contractions, setContractions] = useState<{ dur: number; gap: number }[]>([]);
  const [showVitalForm, setShowVitalForm] = useState(false);
  const [vForm, setVForm] = useState({ td:"", bb:"", fundus:"", gerakan:"", hb:"", protein:"Negatif" as VitalLog["protein"], catatan:"" });
  function setVF(k: keyof typeof vForm, v: string) { setVForm(p => ({ ...p, [k]: v })); }

  const latestVital = vitalLogs.at(-1);

  const symList = [
    { id: "nausea",   label: "Mual / Muntah",     risk: "green"  as Risk },
    { id: "dizzy",    label: "Pusing / Lemas",     risk: "yellow" as Risk },
    { id: "swelling", label: "Bengkak Kaki",       risk: "yellow" as Risk },
    { id: "bleed",    label: "Bercak Darah",       risk: "red"    as Risk },
    { id: "headache", label: "Sakit Kepala Berat", risk: "red"    as Risk },
    { id: "vision",   label: "Pandangan Kabur",    risk: "red"    as Risk },
    { id: "pain",     label: "Nyeri Perut Hebat",  risk: "red"    as Risk },
    { id: "fever",    label: "Demam Tinggi",        risk: "yellow" as Risk },
  ];

  const activeSyms = symList.filter(s => symptoms[s.id]);
  const risk: Risk = activeSyms.some(s => s.risk === "red") ? "red" : activeSyms.some(s => s.risk === "yellow") ? "yellow" : "green";
  const riskColor  = { green: "#22c55e", yellow: "#f59e0b", red: "#ef4444" };
  const riskLabel  = { green: "Status Normal", yellow: "Perlu Perhatian", red: "Tanda Bahaya" };

  useEffect(() => {
    if (!contrActive) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [contrActive]);

  useEffect(() => {
    if (!kickActive) return;
    const id = setInterval(() => setKickSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [kickActive]);

  function startKickSession() {
    setKick(0); setKickSecs(0); setKickStartAt(Date.now()); setKickActive(true);
  }
  function resetKick() {
    setKick(0); setKickSecs(0); setKickStartAt(null); setKickActive(false);
  }
  function addKick() {
    const next = kick + 1;
    setKick(next);
    if (next === 10) setKickActive(false);
  }

  const kickMins = Math.floor(kickSecs / 60);
  const kickSecRem = kickSecs % 60;
  const kickTimeStr = kickActive || kickSecs > 0
    ? `${String(kickMins).padStart(2,"0")}:${String(kickSecRem).padStart(2,"0")}`
    : "00:00";
  const MAX_SECS = 7200;
  const timerPct = Math.min(100, (kickSecs / MAX_SECS) * 100);

  function toggleContr() {
    const now = Date.now();
    if (!contrActive) {
      setContrStart(now); setElapsed(0); setContrActive(true);
    } else {
      const dur = Math.round((now - (contrStart ?? now)) / 1000);
      const gap = lastEnd ? Math.round((now - lastEnd) / 60000) : 0;
      setContractions(p => [...p, { dur, gap }]);
      setLastEnd(now); setContrActive(false); setContrStart(null);
    }
  }

  const avgGap = contractions.length > 1
    ? Math.round(contractions.slice(-3).reduce((a, c) => a + c.gap, 0) / Math.min(contractions.length, 3))
    : null;
  const is511 = contractions.length >= 3 && avgGap !== null && avgGap <= 5 && (contractions.at(-1)?.dur ?? 0) >= 60;

  function handleSaveVital() {
    if (!vForm.td || !vForm.bb) return;
    const now = new Date();
    onAddVital({
      id: `v${Date.now()}`,
      date: now.toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" }),
      minggu: vitalLogs.at(-1)?.minggu ?? 0,
      ...vForm,
    });
    setVForm({ td:"", bb:"", fundus:"", gerakan:"", hb:"", protein:"Negatif", catatan:"" });
    setShowVitalForm(false);
  }

  return (
    <div className="space-y-5 w-full">
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: risk === "red" ? "#fef2f2" : risk === "yellow" ? "#fffbeb" : "#f0fdf4", border: `1.5px solid ${riskColor[risk]}25` }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: riskColor[risk] }}>
          {risk === "green" ? <Check size={22} className="text-white" /> : <AlertTriangle size={22} className="text-white" />}
        </div>
        <div>
          <p className="text-base font-extrabold" style={{ color: riskColor[risk] }}>{riskLabel[risk]}</p>
          <p className="text-sm" style={{ color: t.muted }}>
            {risk === "green" && "Kondisi baik. Terus pantau gejala harian Anda."}
            {risk === "yellow" && "Perhatikan kondisi dan konsultasikan pada ANC berikutnya."}
            {risk === "red" && "Segera hubungi dokter atau pergi ke unit gawat darurat."}
          </p>
        </div>
        {risk === "red" && (
          <div className="ml-auto">
            <PillBtn variant="danger" onClick={onEmergency} t={t}>Mode Darurat</PillBtn>
          </div>
        )}
      </div>

      {/* Kontraksi Instan */}
      <Card t={t} className="p-6">
        <div className="flex items-center justify-between mb-5">
          <SectionTitle>Kontraksi Instan</SectionTitle>
          {is511 && (
            <span className="text-sm font-bold text-red-600 bg-red-50 px-4 py-1.5 rounded-full animate-pulse">
              Aturan 5-1-1 — Segera ke RS
            </span>
          )}
        </div>
        <div className="flex items-start gap-8">
          <button onClick={toggleContr}
            className="w-44 h-44 rounded-full font-bold text-white flex flex-col items-center justify-center gap-2 flex-shrink-0 transition-all text-base"
            style={{
              background: contrActive ? "linear-gradient(135deg,#ef4444,#b91c1c)" : `linear-gradient(135deg,${t.primary},${t.active})`,
              boxShadow: contrActive ? "0 0 0 10px rgba(239,68,68,0.15)" : `0 0 0 10px ${t.primary}30`,
            }}
          >
            <span className="text-3xl">{contrActive ? "⏹" : "▶"}</span>
            <span>{contrActive ? `${elapsed}s` : "Mulai"}</span>
          </button>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "Total",           v: contractions.length },
                { l: "Rata Jarak",      v: avgGap != null ? `${avgGap} mnt` : "—" },
                { l: "Durasi Terakhir", v: contractions.length ? `${contractions.at(-1)!.dur}s` : "—" },
              ].map(({ l, v }) => (
                <div key={l} className="rounded-2xl p-4 text-center" style={{ background: t.soft }}>
                  <p className="text-[10px]" style={{ color: t.muted }}>{l}</p>
                  <p className="text-xl font-extrabold" style={{ color: t.dark }}>{v}</p>
                </div>
              ))}
            </div>
            {contractions.length > 0 && (
              <div className="space-y-1.5">
                {contractions.slice(-4).reverse().map((c, i) => (
                  <div key={i} className="flex gap-4 text-xs rounded-xl px-4 py-2" style={{ background: t.soft }}>
                    <span style={{ color: t.muted }}>#{contractions.length - i}</span>
                    <span style={{ color: t.dark }}>Durasi: {c.dur}s</span>
                    {c.gap > 0 && <span style={{ color: t.dark }}>Jarak: {c.gap} mnt</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Data Vital + Kick Counter — 2 kolom sejajar */}
      <div className="grid grid-cols-2 gap-4 items-stretch">
        {/* Kiri: Data Vital Terakhir */}
        <Card t={t} className="p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-extrabold" style={{ color: t.dark }}>Data Vital Terakhir</p>
              {latestVital && <p className="text-[11px]" style={{ color: t.muted }}>{latestVital.date} · Minggu ke-{latestVital.minggu}</p>}
            </div>
            <button onClick={() => setShowVitalForm(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{ background: showVitalForm ? t.active : t.soft, color: showVitalForm ? "#fff" : t.active }}>
              <Plus size={12} /> Catat Baru
            </button>
          </div>

          {showVitalForm ? (
            <div className="border-t pt-4" style={{ borderColor: t.border }}>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { key:"td",     label:"Tekanan Darah", placeholder:"118/76", hint:"mmHg" },
                  { key:"bb",     label:"Berat Badan",   placeholder:"68.5",   hint:"kg"   },
                  { key:"fundus", label:"Tinggi Fundus", placeholder:"32",     hint:"cm"   },
                  { key:"gerakan",label:"Gerakan Janin", placeholder:"8-10",   hint:"/2jam"},
                  { key:"hb",     label:"Hemoglobin",    placeholder:"11.8",   hint:"g/dL" },
                ].map(({ key, label, placeholder, hint }) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold block mb-1" style={{ color: t.dark }}>{label}</label>
                    {key === "td" ? (
                      <div className="relative flex items-center rounded-lg border-2 pr-9 transition-all overflow-hidden"
                        style={{ borderColor: vForm.td ? t.primary : t.border, background: t.soft, color: t.dark }}>
                        <input
                          className="w-full bg-transparent text-center outline-none py-2 text-xs placeholder:text-gray-400"
                          placeholder="118"
                          value={vForm.td.split('/')[0] || ""}
                          onChange={e => {
                            const sys = e.target.value.replace(/\D/g, "").slice(0, 3);
                            const dia = vForm.td.split('/')[1] || "";
                            setVF("td", sys || dia ? `${sys}/${dia}` : "");
                          }}
                        />
                        <span className="text-xs font-black opacity-30">/</span>
                        <input
                          className="w-full bg-transparent text-center outline-none py-2 text-xs placeholder:text-gray-400"
                          placeholder="76"
                          value={vForm.td.split('/')[1] || ""}
                          onChange={e => {
                            const sys = vForm.td.split('/')[0] || "";
                            const dia = e.target.value.replace(/\D/g, "").slice(0, 3);
                            setVF("td", sys || dia ? `${sys}/${dia}` : "");
                          }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px]" style={{ color: t.muted }}>{hint}</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          className="w-full rounded-lg px-2.5 py-2 text-xs outline-none border-2 pr-9"
                          style={{ borderColor: vForm[key as keyof typeof vForm] ? t.primary : t.border, background: t.soft, color: t.dark }}
                          placeholder={placeholder}
                          value={vForm[key as keyof typeof vForm]}
                          onChange={e => {
                            let v = e.target.value;
                            if (key === "bb" || key === "fundus" || key === "hb") {
                              v = v.replace(/[^\d.]/g, "");
                              if (v.split(".").length > 2) v = v.substring(0, v.length - 1);
                            } else if (key === "gerakan") {
                              v = v.replace(/[^\d-]/g, "");
                            }
                            setVF(key as keyof typeof vForm, v);
                          }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px]" style={{ color: t.muted }}>{hint}</span>
                      </div>
                    )}
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-bold block mb-1" style={{ color: t.dark }}>Protein Urin</label>
                  <select className="w-full rounded-lg px-2.5 py-2 text-xs outline-none border-2"
                    style={{ borderColor: t.border, background: t.soft, color: t.dark }}
                    value={vForm.protein} onChange={e => setVF("protein", e.target.value)}>
                    {["Negatif", "+", "++", "+++"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-[10px] font-bold block mb-1" style={{ color: t.dark }}>Catatan (opsional)</label>
                <input className="w-full rounded-lg px-2.5 py-2 text-xs outline-none border-2"
                  style={{ borderColor: t.border, background: t.soft, color: t.dark }}
                  placeholder="cth: sedikit pusing pagi"
                  value={vForm.catatan} onChange={e => setVF("catatan", e.target.value)} />
              </div>
              <div className="flex gap-2">
                <PillBtn variant="active" size="sm" onClick={handleSaveVital} disabled={!vForm.td || !vForm.bb} t={t}>
                  <Check size={13} /> Simpan
                </PillBtn>
                <PillBtn variant="outline" size="sm" onClick={() => setShowVitalForm(false)} t={t}>Batal</PillBtn>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {latestVital ? [
                { l:"TD",      v:latestVital.td,      u:"mmHg"  },
                { l:"BB",      v:latestVital.bb,      u:"kg"    },
                { l:"Fundus",  v:latestVital.fundus,  u:"cm"    },
                { l:"Gerakan", v:latestVital.gerakan, u:"/2jam" },
                { l:"HB",      v:latestVital.hb,      u:"g/dL"  },
                { l:"Protein", v:latestVital.protein, u:""      },
              ].map(({ l, v, u }) => (
                <div key={l} className="rounded-xl p-3 text-center" style={{ background: t.soft }}>
                  <p className="text-[10px] mb-1" style={{ color: t.muted }}>{l}</p>
                  <p className="text-sm font-extrabold" style={{ color: t.dark }}>{v || "—"}</p>
                  <p className="text-[10px]" style={{ color: t.muted }}>{u}</p>
                </div>
              )) : (
                <p className="col-span-2 text-center text-xs py-3" style={{ color: t.muted }}>Belum ada data vital.</p>
              )}
            </div>
          )}
        </Card>

        {/* Kanan: Kick Counter */}
        <Card t={t} className="p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle>Kick Counter</SectionTitle>
            {(kickActive || kick > 0) && (
              <button onClick={resetKick} className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background: t.soft, color: t.muted }}>
                Reset
              </button>
            )}
          </div>
          <p className="text-[11px] mb-2" style={{ color: t.muted }}>Target: 10 gerakan dalam 2 jam</p>

          {/* Dot grid — 10 target dots, extra shown as +N */}
          <div className="grid grid-cols-5 place-items-center gap-y-4 mb-5 w-full flex-1 content-center">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-200"
                style={{
                  background: i < kick ? "#22c55e" : t.soft,
                  boxShadow: i < kick ? "0 0 0 3px #22c55e22" : "none",
                }} />
            ))}
          </div>
          {kick > 10 && (
            <p className="text-center text-[10px] font-bold mb-2" style={{ color: t.active }}>
              +{kick - 10} ekstra di atas target
            </p>
          )}

          {/* Count + tap button */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 rounded-2xl py-2.5 text-center" style={{ background: t.soft }}>
              <p className="text-2xl font-extrabold leading-none" style={{ color: kick >= 10 ? "#22c55e" : t.dark }}>{kick}</p>
              <p className="text-[10px] mt-1" style={{ color: t.muted }}>
                {kick < 10 ? `dari 10 target` : kick === 10 ? "target tercapai" : `+${kick - 10} ekstra`}
              </p>
            </div>
            {!kickActive && kick === 0 ? (
              <button onClick={startKickSession}
                className="flex-1 py-2.5 rounded-2xl text-[13px] font-bold text-white transition-all"
                style={{ background: t.grad }}>
                Mulai Sesi
              </button>
            ) : (
              <button onClick={addKick}
                className="flex-1 py-2.5 rounded-2xl text-[13px] font-bold text-white transition-all active:scale-95"
                style={{ background: kick >= 10 ? "#22c55e" : t.active }}>
                + Tendangan
              </button>
            )}
          </div>

          {/* Timer bar */}
          <div className="mt-auto">
            <div className="flex justify-between mb-1">
              <p className="text-[10px] font-bold" style={{ color: t.muted }}>Waktu sesi</p>
              <p className="text-[10px] font-bold" style={{ color: kickActive ? t.active : t.muted }}>{kickTimeStr} / 02:00:00</p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: t.soft }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${timerPct}%`, background: timerPct > 90 ? "#ef4444" : t.primary }} />
            </div>
            {kick >= 10 && (
              <div className="rounded-xl py-2 text-center" style={{ background: "#f0fdf4" }}>
                <p className="text-xs font-bold text-green-600">
                  Target tercapai dalam {kickMins}m {kickSecRem}s
                  {kick > 10 ? ` · total ${kick} gerakan` : ""}
                </p>
              </div>
            )}
            {(kickActive || kick > 0) && kick < 10 && (
              <p className="text-center text-[11px]" style={{ color: t.muted }}>
                {10 - kick} gerakan lagi • sesi berjalan
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Log Gejala + Vitamin — paling bawah */}
      <div className="grid grid-cols-2 gap-4 items-stretch">
        <Card t={t} className="p-5 h-full">
          <SectionTitle>Log Gejala Hari Ini</SectionTitle>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {symList.map(({ id, label, risk: r }) => {
              const rc = { green: "#22c55e", yellow: "#f59e0b", red: "#ef4444" }[r];
              return (
                <button key={id}
                  onClick={() => setSymptoms(p => ({ ...p, [id]: !p[id] }))}
                  className="rounded-xl px-3 py-2.5 text-xs font-semibold transition-all text-center"
                  style={{
                    background: symptoms[id] ? rc + "15" : t.soft,
                    border: `1.5px solid ${symptoms[id] ? rc : "transparent"}`,
                    color: symptoms[id] ? rc : t.muted,
                  }}>
                  {symptoms[id] ? "✓ " : ""}{label}
                </button>
              );
            })}
          </div>
        </Card>
        <VitaminTracker t={t} done={vitDone} setDone={setVitDone} className="h-full" />
      </div>
    </div>
  );
}

// ─── Calendar Screen ──────────────────────────────────────────────────────────

type CalEvent = { date: string; label: string; type: "anc" | "vitamin" | "hpl" | "other" };

const ALL_EVENTS: CalEvent[] = [
  { date: "2025-01-23", label: "ANC – Tes Diabetes Gestasional", type: "anc"     },
  { date: "2025-01-28", label: "USG Biometri Janin",              type: "anc"     },
  { date: "2025-02-10", label: "Kelas Persalinan",                type: "other"   },
  { date: "2025-02-20", label: "ANC – Biometri (Minggu 32)",      type: "anc"     },
  { date: "2025-03-10", label: "ANC – Posisi Janin (Minggu 36)",  type: "anc"     },
  { date: "2025-03-24", label: "ANC – Persiapan Persalinan",      type: "anc"     },
  { date: "2025-09-07", label: "HPL – Perkiraan Lahir",           type: "hpl"     },
];

function CalendarScreen({ t, dueDate, weeksPreg, daysUntilDue, trimester }: {
  t: Theme; dueDate: Date; weeksPreg: number; daysUntilDue: number; trimester: number;
}) {
  const today      = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(
    today.toISOString().slice(0, 10)
  );
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());

  const [listTab, setListTab] = useState<"upcoming" | "history">("upcoming");

  // Editable events state (seeded from hardcoded list)
  const [events, setEvents] = useState<CalEvent[]>(ALL_EVENTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", label: "", type: "anc" as CalEvent["type"] });

  function addEvent() {
    if (!form.date || !form.label) return;
    setEvents(p => [...p, { ...form }]);
    setForm({ date: selectedDay ?? "", label: "", type: "anc" });
    setShowForm(false);
  }
  function deleteEvent(idx: number) {
    setEvents(p => p.filter((_, i) => i !== idx));
  }

  const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const DAYS_ID   = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDays   = new Date(viewYear, viewMonth, 0).getDate();

  function isoDate(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  function eventsOn(iso: string) { return events.filter(e => e.date === iso); }

  function navigate(dir: number) {
    let m = viewMonth + dir, y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setViewMonth(m); setViewYear(y);
  }

  const todayIso  = today.toISOString().slice(0, 10);
  const selEvents = selectedDay ? eventsOn(selectedDay) : [];

  const typeColor: Record<CalEvent["type"], string> = {
    anc:    "#14b8a6", // Teal/Tosca yang lebih terang dan cerah
    vitamin:"#22c55e",
    hpl:    "#f59e0b",
    other:  t.primary,
  };
  const typeLabel: Record<CalEvent["type"], string> = {
    anc:    "ANC",
    vitamin:"Vitamin",
    hpl:    "HPL",
    other:  "Lainnya",
  };

  // Build grid: 6 rows × 7 cols
  const cells: { iso: string; day: number; cur: boolean }[] = [];
  for (let i = 0; i < firstDay; i++) {
    const d = prevDays - firstDay + i + 1;
    cells.push({ iso: isoDate(viewYear, viewMonth - 1, d), day: d, cur: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: isoDate(viewYear, viewMonth, d), day: d, cur: true });
  }
  while (cells.length % 7 !== 0) {
    const d = cells.length - daysInMonth - firstDay + 1;
    cells.push({ iso: isoDate(viewYear, viewMonth + 1, d), day: d, cur: false });
  }

  return (
    <div className="space-y-5 w-full">
      {/* HPL banner — redesigned */}
      <div className="rounded-3xl overflow-hidden" style={{ background: t.grad }}>
        <div className="flex items-stretch">
          {/* Left — main info */}
          <div className="flex-1 px-8 py-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              Perkiraan Persalinan (HPL)
            </p>
            <p className="text-3xl font-extrabold text-white leading-tight">{fmtDate(dueDate)}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                {daysUntilDue > 0 ? `${daysUntilDue} hari lagi` : "Hari ini / sudah lewat"}
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                Trimester {trimester}
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                Minggu ke-{weeksPreg}
              </span>
            </div>
          </div>

          {/* Right — stats strip */}
          <div className="flex divide-x" style={{ borderLeft: "1px solid rgba(255,255,255,0.15)", divideColor: "rgba(255,255,255,0.15)" }}>
            {[
              { label: "Sisa Hari",   value: daysUntilDue },
              { label: "Sisa Minggu", value: Math.max(0, Math.ceil(daysUntilDue / 7)) },
              { label: "Trimester",   value: trimester },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center justify-center px-7 py-4 gap-1"
                style={{ borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
                <p className="text-2xl font-extrabold text-white leading-none">{s.value}</p>
                <p className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</p>
              </div>
            ))}

            {/* Calendar icon — jumps to HPL month */}
            <button
              onClick={() => { setViewYear(dueDate.getFullYear()); setViewMonth(dueDate.getMonth()); }}
              title="Pergi ke bulan HPL"
              className="flex flex-col items-center justify-center px-6 py-4 gap-1.5 transition-all hover:brightness-110 group"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.12)" }}>
              <Calendar size={22} color="#fff" className="group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.65)" }}>Lihat HPL</p>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* Full monthly calendar */}
        <Card t={t} className="p-6">
          {/* Header & Legend */}
          <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: `1px solid ${t.border}` }}>
            <div className="flex gap-4">
              {[
                { color: "#14b8a6", label: "Jadwal ANC" },
                { color: "#f59e0b", label: "HPL"        },
                { color: t.primary, label: "Lainnya"    },
              ].map(leg => (
                <div key={leg.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: leg.color }} />
                  <span className="text-[11px] font-semibold" style={{ color: t.muted }}>{leg.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setForm(f => ({ ...f, date: selectedDay ?? isoDate(viewYear, viewMonth, today.getDate()) })); setShowForm(v => !v); }}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
              style={{ background: showForm ? t.active : t.soft, color: showForm ? "#fff" : t.active }}>
              {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Batal Tambah" : "Tambah Jadwal"}
            </button>
          </div>

          {/* Month / Year nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: t.soft }}>
              <ChevronLeft size={16} color={t.active} />
            </button>

            {/* Clickable header → opens picker */}
            <button onClick={() => { setShowPicker(p => !p); setPickerYear(viewYear); }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full transition-all font-extrabold text-base"
              style={{ background: showPicker ? t.soft : "transparent", color: t.dark }}>
              {MONTHS_ID[viewMonth]} {viewYear}
              <span className="text-[11px]" style={{ color: t.muted }}>{showPicker ? "▲" : "▼"}</span>
            </button>

            <button onClick={() => navigate(1)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: t.soft }}>
              <ArrowRight size={16} color={t.active} />
            </button>
          </div>

          {/* Month / Year Picker Panel */}
          {showPicker && (
            <div className="mb-4 rounded-3xl p-5 shadow-sm transition-all" style={{ background: t.soft, border: `1px solid ${t.border}` }}>
              {/* Year row */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <select 
                    className="appearance-none outline-none text-sm font-extrabold text-center pl-6 pr-9 py-2 rounded-full cursor-pointer transition-all hover:scale-105"
                    style={{ background: t.card, color: t.dark, boxShadow: `0 2px 8px ${t.shadow}` }}
                    value={pickerYear}
                    onChange={(e) => setPickerYear(Number(e.target.value))}
                  >
                    {Array.from({ length: 11 }).map((_, i) => {
                      const y = new Date().getFullYear() - 2 + i;
                      return <option key={y} value={y}>{y}</option>;
                    })}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[9px] font-bold" style={{ color: t.active }}>▼</span>
                </div>
              </div>
              {/* Month grid */}
              <div className="grid grid-cols-4 gap-2">
                {MONTHS_ID.map((m, i) => {
                  const isSelected = i === viewMonth && pickerYear === viewYear;
                  return (
                    <button key={m} onClick={() => { setViewMonth(i); setViewYear(pickerYear); setShowPicker(false); }}
                      className="py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: isSelected ? t.active : t.card,
                        color: isSelected ? "#fff" : t.dark,
                        boxShadow: isSelected ? `0 4px 12px ${t.shadow}` : `0 2px 6px ${t.shadow}`,
                      }}>
                      {m.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_ID.map(d => (
              <div key={d} className="text-center py-1">
                <span className="text-[11px] font-bold" style={{ color: t.muted }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              const events   = eventsOn(cell.iso);
              const isToday  = cell.iso === todayIso;
              const isSel    = cell.iso === selectedDay;
              
              const mainEvent = events.find(e => e.type === "hpl") || events.find(e => e.type === "anc") || events[0];

              let bg = "transparent";
              let borderCol = "transparent";
              let textCol = t.dark;

              if (isSel) {
                bg = t.active;
                textCol = "#fff";
              } else if (mainEvent) {
                bg = typeColor[mainEvent.type] + "15"; // Very soft background
                borderCol = typeColor[mainEvent.type] + "40"; // Slight border
                textCol = typeColor[mainEvent.type];
              } else if (isToday) {
                bg = t.soft;
                textCol = t.active;
              }

              return (
                <button key={idx} onClick={() => cell.cur && setSelectedDay(cell.iso)}
                  className="flex flex-col items-center justify-center rounded-xl py-1.5 px-1 transition-all min-h-[52px]"
                  style={{
                    background: bg,
                    border: `1.5px solid ${borderCol}`,
                    opacity: cell.cur ? 1 : 0.3,
                    cursor: cell.cur ? "pointer" : "default",
                  }}
                >
                  <span className="text-[13px] font-bold leading-none"
                    style={{ color: textCol }}>
                    {cell.day}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected day events */}
          <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${t.border}` }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: t.muted }}>
                {selectedDay
                  ? new Date(selectedDay + "T00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })
                  : "Pilih tanggal"}
              </p>
            </div>

            {showForm ? (
              <div className="mb-4 p-5 rounded-2xl" style={{ background: t.soft }}>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold block mb-1.5" style={{ color: t.dark }}>Keterangan Jadwal</label>
                    <input
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border-2 transition-all"
                      style={{ borderColor: form.label ? t.primary : t.border, background: t.card, color: t.dark }}
                      placeholder="cth: ANC Minggu 32 – Biometri"
                      value={form.label}
                      onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold block mb-1.5" style={{ color: t.dark }}>Kategori</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["anc", "hpl", "other"] as CalEvent["type"][]).map(tp => (
                        <button key={tp} onClick={() => setForm(f => ({ ...f, type: tp }))}
                          className="py-2.5 rounded-xl text-[11px] font-bold transition-all border"
                          style={{
                            background: form.type === tp ? typeColor[tp] : t.card,
                            color: form.type === tp ? "#fff" : t.muted,
                            borderColor: form.type === tp ? "transparent" : t.border,
                          }}>
                          {typeLabel[tp]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={addEvent} disabled={!form.date || !form.label}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all mt-2 flex items-center justify-center gap-2"
                    style={{ background: form.date && form.label ? t.active : t.border, color: "#fff" }}>
                    <Check size={16} /> Simpan Jadwal
                  </button>
                </div>
              </div>
            ) : (
              <>
                {selectedDay && selEvents.length === 0 && (
                  <p className="text-xs" style={{ color: t.muted }}>Tidak ada jadwal. Klik "Tambah Jadwal" untuk menambahkan.</p>
                )}
                <div className="space-y-2">
                  {selEvents.map((ev, i) => {
                    const globalIdx = events.indexOf(ev);
                    if (ev.type === "hpl") {
                      return (
                        <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3 relative" style={{ background: "#fff7ed", border: "1.5px solid #fcd34d" }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg">🌟</div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-orange-700">{ev.label}</p>
                            <p className="text-[11px] text-orange-500">Perkiraan kelahiran si kecil</p>
                          </div>
                          <button onClick={() => deleteEvent(globalIdx)}
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:bg-orange-200"
                            style={{ color: "#d97706" }}>
                            <X size={12} />
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3"
                        style={{ background: t.soft }}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: typeColor[ev.type] }} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: t.dark }}>{ev.label}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: typeColor[ev.type] }}>
                          {typeLabel[ev.type]}
                        </span>
                        <button onClick={() => deleteEvent(globalIdx)}
                          className="w-6 h-6 rounded-full flex items-center justify-center ml-1 transition-all hover:bg-red-100"
                          style={{ color: "#ef4444" }}>
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Right sidebar: event lists (Tabs) */}
        <div className="space-y-4">
          <Card t={t} className="p-5 h-full flex flex-col">
            <div className="flex rounded-full p-1 gap-1 mb-4" style={{ background: "#f2f2f2" }}>
              <button onClick={() => setListTab("upcoming")}
                className="flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: listTab === "upcoming" ? t.active : "transparent",
                  color: listTab === "upcoming" ? "#fff" : t.muted,
                  boxShadow: listTab === "upcoming" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                }}>
                Mendatang
              </button>
              <button onClick={() => setListTab("history")}
                className="flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: listTab === "history" ? t.active : "transparent",
                  color: listTab === "history" ? "#fff" : t.muted,
                  boxShadow: listTab === "history" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                }}>
                Riwayat
              </button>
            </div>

            <div className="space-y-2 mt-1 overflow-y-auto pr-1 flex-1" style={{ maxHeight: 'calc(100vh - 280px)', scrollbarWidth: "thin" }}>
              {listTab === "upcoming" && (
                <>
                  {[...events]
                    .filter(ev => ev.date >= today.toISOString().slice(0, 10))
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((ev, i) => {
                    const globalIdx = events.indexOf(ev);
                    return (
                      <div key={`up-${i}`}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer transition-all hover:brightness-95"
                        style={{ background: t.soft }}
                        onClick={() => { setSelectedDay(ev.date); setViewYear(parseInt(ev.date.slice(0,4))); setViewMonth(parseInt(ev.date.slice(5,7)) - 1); }}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: typeColor[ev.type] }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold truncate" style={{ color: t.dark }}>{ev.label}</p>
                          <p className="text-[10px]" style={{ color: t.muted }}>
                            {new Date(ev.date + "T00:00").toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                          </p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); deleteEvent(globalIdx); }}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-100 transition-all flex-shrink-0"
                          style={{ color: "#ef4444" }}>
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                  {events.filter(ev => ev.date >= today.toISOString().slice(0, 10)).length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: t.muted }}>Tidak ada jadwal mendatang.</p>
                  )}
                </>
              )}

              {listTab === "history" && (
                <>
                  {[...events]
                    .filter(ev => ev.date < today.toISOString().slice(0, 10))
                    .sort((a, b) => b.date.localeCompare(a.date)) // Sort descending for history
                    .map((ev, i) => {
                    const globalIdx = events.indexOf(ev);
                    return (
                      <div key={`hist-${i}`}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer transition-all hover:brightness-95 opacity-60 hover:opacity-100"
                        style={{ background: t.soft }}
                        onClick={() => { setSelectedDay(ev.date); setViewYear(parseInt(ev.date.slice(0,4))); setViewMonth(parseInt(ev.date.slice(5,7)) - 1); }}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: typeColor[ev.type] }} />
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-[11px] font-semibold truncate" style={{ color: t.dark }}>{ev.label}</p>
                          <p className="text-[10px]" style={{ color: t.muted }}>
                            {new Date(ev.date + "T00:00").toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {events.filter(ev => ev.date < today.toISOString().slice(0, 10)).length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: t.muted }}>Belum ada riwayat jadwal.</p>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Pure-SVG chart helpers (no recharts — avoids internal key collision bug) ─

type SvgChartPoint = { label: string; [key: string]: number | string | null };

function SvgLineChart({ data, series, yMin, yMax }: {
  data: SvgChartPoint[];
  series: { key: string; name: string; color: string }[];
  yMin?: number;
  yMax?: number;
}) {
  const W = 400; const H = 180;
  const pl = 38; const pr = 10; const pt = 8; const pb = 28;
  const cW = W - pl - pr; const cH = H - pt - pb;

  const nums = series.flatMap(s => data.map(d => d[s.key] as number | null).filter((v): v is number => v != null));
  const lo = yMin ?? Math.floor(Math.min(...nums) - 4);
  const hi = yMax ?? Math.ceil(Math.max(...nums) + 4);
  const span = hi - lo || 1;

  function gx(i: number) { return pl + (i / Math.max(data.length - 1, 1)) * cW; }
  function gy(v: number) { return pt + cH - ((v - lo) / span) * cH; }

  const yTicks: number[] = [];
  const step = Math.ceil(span / 4 / 5) * 5 || 1;
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) yTicks.push(v);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {yTicks.map(v => (
          <g key={`yt-${v}`}>
            <line x1={pl} y1={gy(v)} x2={W - pr} y2={gy(v)} stroke="#f0f0f0" strokeWidth={1} />
            <text x={pl - 4} y={gy(v) + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{v}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={`xl-${i}`} x={gx(i)} y={H - 6} textAnchor="middle" fontSize={10} fill="#9ca3af">{d.label}</text>
        ))}
        {series.map(s => {
          const pts = data.map((d, i) => ({ x: gx(i), y: gy(d[s.key] as number), v: d[s.key] })).filter(p => p.v != null);
          const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
          return (
            <g key={s.key}>
              <path d={d} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill={s.color} stroke="#fff" strokeWidth={2} />)}
            </g>
          );
        })}
      </svg>
      <div className="flex gap-4 mt-1">
        {series.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className="w-4 h-2 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SvgAreaChart({ data, seriesKey, seriesName, color }: {
  data: SvgChartPoint[];
  seriesKey: string;
  seriesName: string;
  color: string;
}) {
  const W = 400; const H = 180;
  const pl = 38; const pr = 10; const pt = 8; const pb = 28;
  const cW = W - pl - pr; const cH = H - pt - pb;

  const nums = data.map(d => d[seriesKey] as number | null).filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  const lo = Math.floor(Math.min(...nums) - 3);
  const hi = Math.ceil(Math.max(...nums) + 3);
  const span = hi - lo || 1;

  function gx(i: number) { return pl + (i / Math.max(data.length - 1, 1)) * cW; }
  function gy(v: number) { return pt + cH - ((v - lo) / span) * cH; }

  const yTicks: number[] = [];
  const step = Math.ceil(span / 4 / 1) || 1;
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) yTicks.push(v);

  const pts = data.map((d, i) => ({ x: gx(i), y: gy(d[seriesKey] as number), v: d[seriesKey] })).filter(p => p.v != null);
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = pts.length > 0
    ? `${linePath} L${pts.at(-1)!.x},${pt + cH} L${pts[0].x},${pt + cH} Z`
    : "";

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        <defs>
          <linearGradient id="svg-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {yTicks.map(v => (
          <g key={`yt-${v}`}>
            <line x1={pl} y1={gy(v)} x2={W - pr} y2={gy(v)} stroke="#f0f0f0" strokeWidth={1} />
            <text x={pl - 4} y={gy(v) + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{v}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={`xl-${i}`} x={gx(i)} y={H - 6} textAnchor="middle" fontSize={10} fill="#9ca3af">{d.label}</text>
        ))}
        <path d={areaPath} fill="url(#svg-area-grad)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill={color} stroke="#fff" strokeWidth={2} />)}
      </svg>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-4 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
        <span style={{ fontSize: 11, color: "#9ca3af" }}>{seriesName}</span>
      </div>
    </div>
  );
}

// ─── Medical Report Preview ───────────────────────────────────────────────────

function MedicalReportPreview({ t, vitalLogs, weeksPreg, dueDate }: {
  t: Theme; vitalLogs: VitalLog[]; weeksPreg: number; dueDate: Date;
}) {
  const [printing, setPrinting] = useState(false);

  const chartData = Object.values(
    vitalLogs.reduce<Record<number, { label: string; minggu: number; sistolik: number | null; diastolik: number | null; bb: number | null }>>(
      (acc, log) => {
        const parts = log.td.split("/");
        acc[log.minggu] = {
          label: `M${log.minggu}`,
          minggu: log.minggu,
          sistolik: parts[0] ? Number(parts[0]) : null,
          diastolik: parts[1] ? Number(parts[1]) : null,
          bb: log.bb ? Number(log.bb) : null,
        };
        return acc;
      },
      {}
    )
  ).sort((a, b) => a.minggu - b.minggu);

  const latest = vitalLogs.at(-1);
  const risikoKategori = "HIJAU (NORMAL)";

  const patientName = "Bunda Rahma";
  const hplStr = dueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => setPrinting(false), 1500);
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold" style={{ color: t.dark }}>Pratinjau Laporan Rekam Medis</p>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-white text-sm transition-all hover:brightness-95"
          style={{ background: t.grad }}
        >
          {printing
            ? <><RefreshCw size={15} className="animate-spin" /> Memproses…</>
            : <><Printer size={15} /> Cetak / Simpan PDF</>
          }
        </button>
      </div>

      {/* Report card */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "#ffffff", border: "1.5px solid #e5e7eb", boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
        {/* Report header */}
        <div className="px-8 pt-8 pb-6" style={{ borderBottom: "2px solid #1a1a2e" }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight" style={{ color: "#1a1a2e", letterSpacing: "-0.5px" }}>
                LAPORAN REKAM MEDIS MATERNAL
              </h1>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>BundaCare Integrated Clinical Summary System</p>
            </div>
            {/* QR code mock */}
            <div className="flex flex-col items-end gap-1">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#9ca3af" }}>VALIDASI DIGITAL</p>
              <div className="w-20 h-20 rounded-lg grid gap-0 p-1.5" style={{ background: "#1a1a2e" }}>
                <div className="grid grid-cols-7 grid-rows-7 gap-px h-full w-full">
                  {Array.from({ length: 49 }).map((_, i) => {
                    const qrPattern = [
                      0,0,0,0,0,0,0, 0,1,0,1,0,0,1, 0,0,0,0,0,0,0,
                      1,1,1,0,1,1,0, 0,1,0,0,1,0,1, 1,0,1,0,0,1,0,
                      0,1,0,1,1,0,1, 0,0,1,0,1,0,0,
                    ];
                    return (
                      <div key={i} className="rounded-[1px]"
                        style={{ background: qrPattern[i % qrPattern.length] === 0 ? "#ffffff" : "#1a1a2e" }} />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patient info row */}
        <div className="px-8 py-5" style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: "Nama Pasien",      value: patientName,                bold: false },
              { label: "Usia Kandungan",   value: `${weeksPreg} Wk + 0 D`,   bold: false },
              { label: "HPL Target",       value: hplStr,                     bold: false },
              { label: "Kategori Risiko",  value: risikoKategori,             bold: true  },
            ].map(({ label, value, bold }) => (
              <div key={label}>
                <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>{label}</p>
                <p className="text-base font-extrabold" style={{ color: bold ? "#16a34a" : "#1a1a2e" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-0" style={{ borderBottom: "1px solid #e5e7eb", borderRight: "none" }}>
          {/* Blood pressure chart */}
          <div className="px-6 py-6" style={{ borderRight: "1px solid #e5e7eb" }}>
            <p className="text-sm font-extrabold mb-3" style={{ color: "#1a1a2e" }}>Tren Tekanan Darah (mmHg)</p>
            <SvgLineChart
              data={chartData}
              series={[
                { key: "sistolik", name: "Sistolik", color: t.active },
                { key: "diastolik", name: "Diastolik", color: "#f9a8d4" },
              ]}
              yMin={40}
              yMax={160}
            />
          </div>
          {/* Weight chart */}
          <div className="px-6 py-6">
            <p className="text-sm font-extrabold mb-3" style={{ color: "#1a1a2e" }}>Kurva Berat Badan Ibu (kg)</p>
            <SvgAreaChart
              data={chartData}
              seriesKey="bb"
              seriesName="Berat Badan (kg)"
              color="#10b981"
            />
          </div>
        </div>

        {/* Vital summary table */}
        <div className="px-8 py-6">
          <p className="text-sm font-extrabold mb-4" style={{ color: "#1a1a2e" }}>Ringkasan Data Vital</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1.5px solid #e5e7eb" }}>
                {["Tanggal", "Minggu", "Tekanan Darah", "Berat Badan", "TFU", "Gerakan Janin", "Hemoglobin", "Protein Urin", "Catatan"].map(h => (
                  <th key={h} className="pb-2 pr-4 text-left text-[11px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: "#9ca3af" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vitalLogs.map((log, i) => (
                <tr key={log.id} style={{ borderBottom: i < vitalLogs.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td className="py-2.5 pr-4 text-xs font-semibold whitespace-nowrap" style={{ color: "#374151" }}>{log.date}</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: "#6b7280" }}>{log.minggu}</td>
                  <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: "#1a1a2e" }}>{log.td} mmHg</td>
                  <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: "#1a1a2e" }}>{log.bb} kg</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: "#374151" }}>{log.fundus ? `${log.fundus} cm` : "—"}</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: "#374151" }}>{log.gerakan || "—"}</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: "#374151" }}>{log.hb ? `${log.hb} g/dL` : "—"}</td>
                  <td className="py-2.5 pr-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: log.protein === "Negatif" ? "#f0fdf4" : "#fef2f2", color: log.protein === "Negatif" ? "#16a34a" : "#dc2626" }}>
                      {log.protein === "Negatif" ? "Negatif" : log.protein}
                    </span>
                  </td>
                  <td className="py-2.5 text-xs" style={{ color: "#9ca3af" }}>{log.catatan || "—"}</td>
                </tr>
              ))}
              {vitalLogs.length === 0 && (
                <tr><td colSpan={9} className="py-6 text-center text-xs" style={{ color: "#9ca3af" }}>Belum ada data vital yang tercatat.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 flex items-center justify-between" style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
          <p className="text-[10px]" style={{ color: "#9ca3af" }}>BundaCare · Maternal AI Platform · Dokumen ini dicetak secara digital · {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="text-[10px] font-bold" style={{ color: "#16a34a" }}>HIJAU — Risiko Normal</p>
        </div>
      </div>
    </div>
  );
}

// ─── Reports Screen ───────────────────────────────────────────────────────────

function ReportsScreen({ t, vitalLogs, onAddVital, weeksPreg, dueDate }: {
  t: Theme; weeksPreg: number; dueDate: Date;
  vitalLogs: VitalLog[];
  onAddVital: (v: VitalLog) => void;
}) {
  const [tab, setTab] = useState<"grafik" | "input" | "history" | "analisis">("grafik");
  const [showPdf, setShowPdf] = useState(false);

  const [form, setForm] = useState({ td:"", bb:"", fundus:"", gerakan:"", hb:"", protein:"Negatif" as VitalLog["protein"], catatan:"" });
  function setF(k: keyof typeof form, v: string) { setForm(p => ({ ...p, [k]: v })); }
  const formValid = form.td && form.bb && form.fundus;

  const latest = vitalLogs.at(-1);
  const sorted = [...vitalLogs].reverse();

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1;
  const paginatedLogs = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleSave() {
    if (!formValid) return;
    const now = new Date();
    onAddVital({
      id: `v${Date.now()}`,
      date: now.toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" }),
      minggu: weeksPreg,
      ...form,
    });
    setForm({ td:"", bb:"", fundus:"", gerakan:"", hb:"", protein:"Negatif", catatan:"" });
    setTab("history");
    setPage(1);
  }

  const chartData = Object.values(
    vitalLogs.reduce<Record<number, { label: string; minggu: number; sistolik: number | null; diastolik: number | null; bb: number | null }>>(
      (acc, log) => {
        const parts = log.td.split("/");
        acc[log.minggu] = {
          label: `M${log.minggu}`,
          minggu: log.minggu,
          sistolik: parts[0] ? Number(parts[0]) : null,
          diastolik: parts[1] ? Number(parts[1]) : null,
          bb: log.bb ? Number(log.bb) : null,
        };
        return acc;
      }, {}
    )
  ).sort((a, b) => a.minggu - b.minggu);

  return (
    <div className="space-y-5 w-full">
      <div>
        <Card t={t} className="p-6">
          {/* Tab bar + ekspor button */}
          <div className="flex items-center gap-2 mb-5">
            {([
              { id: "grafik",   label: "Grafik" },
              { id: "analisis", label: "Analisis Tren" },
              { id: "input",    label: "+ Catat Vital" },
              { id: "history",  label: `Riwayat (${vitalLogs.length})` },
            ] as { id: typeof tab; label: string }[]).map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className="px-5 py-2 rounded-full text-sm font-bold transition-all"
                style={{ background: tab === id ? t.active : t.soft, color: tab === id ? "#fff" : t.muted }}>
                {label}
              </button>
            ))}
            <div className="ml-auto">
              <button
                onClick={() => setShowPdf(v => !v)}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all"
                style={{ background: showPdf ? t.active : t.soft, color: showPdf ? "#fff" : t.active, border: `1.5px solid ${showPdf ? "transparent" : t.active}40` }}
              >
                <FileText size={14} /> {showPdf ? "Tutup Laporan" : "Ekspor PDF"}
              </button>
            </div>
          </div>

          {/* ── Grafik tab ── */}
          {tab === "grafik" && (
            <div className="space-y-5">
              {/* Stat tiles */}
              {latest ? (
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: "Tekanan Darah", value: latest.td,      unit: "mmHg",  accent: false },
                    { label: "Berat Badan",   value: latest.bb,      unit: "kg",    accent: false },
                    { label: "TFU",           value: latest.fundus ? `${latest.fundus} cm` : "—", unit: "", accent: false },
                    { label: "Hemoglobin",    value: latest.hb ? `${latest.hb} g/dL` : "—",       unit: "", accent: false },
                    { label: "Protein Urin",  value: latest.protein, unit: "",      accent: latest.protein !== "Negatif" },
                  ].map(({ label, value, unit, accent }) => (
                    <div key={label} className="rounded-2xl p-4 text-center" style={{ background: t.soft }}>
                      <p className="text-[10px] font-semibold mb-1" style={{ color: t.muted }}>{label}</p>
                      <p className="text-lg font-extrabold leading-tight" style={{ color: accent ? "#ef4444" : t.dark }}>{value}</p>
                      {unit && <p className="text-[10px] mt-0.5" style={{ color: t.muted }}>{unit}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl p-5 text-center" style={{ background: t.soft }}>
                  <p className="text-sm" style={{ color: t.muted }}>Belum ada data vital. Gunakan tab "+ Catat Vital" untuk mulai.</p>
                </div>
              )}

              {/* Charts side by side */}
              <div className="grid grid-cols-2 gap-4">
                <Card t={t} className="p-5">
                  <p className="text-sm font-extrabold mb-1" style={{ color: t.dark }}>Tren Tekanan Darah</p>
                  <p className="text-[11px] mb-4" style={{ color: t.muted }}>mmHg · per minggu ANC</p>
                  {chartData.length >= 1 ? (
                    <SvgLineChart
                      data={chartData}
                      series={[
                        { key: "sistolik",  name: "Sistolik",  color: t.active },
                        { key: "diastolik", name: "Diastolik", color: "#f9a8d4" },
                      ]}
                      yMin={40} yMax={160}
                    />
                  ) : (
                    <p className="text-xs py-8 text-center" style={{ color: t.muted }}>Belum cukup data</p>
                  )}
                </Card>
                <Card t={t} className="p-5">
                  <p className="text-sm font-extrabold mb-1" style={{ color: t.dark }}>Kurva Berat Badan</p>
                  <p className="text-[11px] mb-4" style={{ color: t.muted }}>kg · per minggu ANC</p>
                  {chartData.length >= 1 ? (
                    <SvgAreaChart
                      data={chartData}
                      seriesKey="bb"
                      seriesName="Berat Badan (kg)"
                      color="#10b981"
                    />
                  ) : (
                    <p className="text-xs py-8 text-center" style={{ color: t.muted }}>Belum cukup data</p>
                  )}
                </Card>
              </div>

              {latest && (
                <p className="text-[11px] text-center" style={{ color: t.muted }}>
                  Data terakhir: Minggu ke-{latest.minggu} · {latest.date}
                </p>
              )}
            </div>
          )}

          {/* ── Catat Vital tab ── */}
          {tab === "input" && (
            <div>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: t.muted }}>
                Isi data dari hasil pemeriksaan ANC atau pengukuran mandiri.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { key:"td",     label:"Tekanan Darah", placeholder:"cth: 118/76", hint:"mmHg"  },
                  { key:"bb",     label:"Berat Badan",   placeholder:"cth: 68.5",   hint:"kg"    },
                  { key:"fundus", label:"Tinggi Fundus", placeholder:"cth: 32",     hint:"cm"    },
                  { key:"gerakan",label:"Gerakan Janin", placeholder:"cth: 8-10",   hint:"/2jam" },
                  { key:"hb",     label:"Hemoglobin",    placeholder:"cth: 11.8",   hint:"g/dL"  },
                ].map(({ key, label, placeholder, hint }) => (
                  <div key={key}>
                    <label className="text-[11px] font-bold block mb-1" style={{ color: t.dark }}>{label}</label>
                    {key === "td" ? (
                      <div className="relative flex items-center rounded-xl border-2 pr-12 transition-all overflow-hidden"
                        style={{ borderColor: form.td ? t.primary : t.border, background: t.soft, color: t.dark }}>
                        <input className="w-full bg-transparent text-center outline-none py-2.5 text-sm placeholder:text-gray-400"
                          placeholder="118" value={form.td.split('/')[0] || ""}
                          onChange={e => { const sys = e.target.value.replace(/\D/g,"").slice(0,3); const dia = form.td.split('/')[1]||""; setF("td", sys||dia?`${sys}/${dia}`:""); }} />
                        <span className="text-sm font-black opacity-30">/</span>
                        <input className="w-full bg-transparent text-center outline-none py-2.5 text-sm placeholder:text-gray-400"
                          placeholder="76" value={form.td.split('/')[1] || ""}
                          onChange={e => { const sys = form.td.split('/')[0]||""; const dia = e.target.value.replace(/\D/g,"").slice(0,3); setF("td", sys||dia?`${sys}/${dia}`:""); }} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: t.muted }}>{hint}</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <input className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border-2 transition-all pr-12"
                          style={{ borderColor: form[key as keyof typeof form] ? t.primary : t.border, background: t.soft, color: t.dark }}
                          placeholder={placeholder} value={form[key as keyof typeof form]}
                          onChange={e => {
                            let v = e.target.value;
                            if (key==="bb"||key==="fundus"||key==="hb") { v=v.replace(/[^\d.]/g,""); if(v.split(".").length>2) v=v.substring(0,v.length-1); }
                            else if (key==="gerakan") v=v.replace(/[^\d-]/g,"");
                            setF(key as keyof typeof form, v);
                          }} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: t.muted }}>{hint}</span>
                      </div>
                    )}
                  </div>
                ))}
                <div>
                  <label className="text-[11px] font-bold block mb-1" style={{ color: t.dark }}>Protein Urin</label>
                  <select className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border-2 transition-all"
                    style={{ borderColor: t.border, background: t.soft, color: t.dark }}
                    value={form.protein} onChange={e => setF("protein", e.target.value)}>
                    {["Negatif", "+", "++", "+++"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-[11px] font-bold block mb-1" style={{ color: t.dark }}>Catatan Tambahan (opsional)</label>
                <textarea rows={2} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border-2 transition-all resize-none"
                  style={{ borderColor: t.border, background: t.soft, color: t.dark }}
                  placeholder="cth: sedikit pusing, kaki bengkak ringan…"
                  value={form.catatan} onChange={e => setF("catatan", e.target.value)} />
              </div>
              <div className="flex gap-3">
                <PillBtn variant="active" size="md" onClick={handleSave} disabled={!formValid} t={t}>
                  <Check size={15} /> Simpan Data Vital
                </PillBtn>
                <PillBtn variant="outline" size="md" onClick={() => setTab("grafik")} t={t}>Batal</PillBtn>
              </div>
            </div>
          )}

          {/* ── Analisis Tren tab ── */}
          {tab === "analisis" && (() => {
            if (vitalLogs.length === 0) return (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold mb-1" style={{ color: t.muted }}>Belum ada data untuk dianalisis.</p>
                <p className="text-xs" style={{ color: t.muted }}>Catat minimal satu data vital terlebih dahulu.</p>
              </div>
            );

            // ── helpers ──
            function trendArrow(vals: number[]): "naik" | "turun" | "stabil" {
              if (vals.length < 2) return "stabil";
              const delta = vals.at(-1)! - vals.at(-2)!;
              if (delta > 1) return "naik";
              if (delta < -1) return "turun";
              return "stabil";
            }
            const arrowIcon = { naik: "▴", turun: "▾", stabil: "▸" };
            const arrowColor = (trend: "naik"|"turun"|"stabil", goodDir: "turun"|"naik"|"stabil") =>
              trend === "stabil" ? "#6b7280" : trend === goodDir ? "#16a34a" : "#f59e0b";

            // ── blood pressure ──
            const bpEntries = vitalLogs.filter(l => l.td.includes("/"));
            const systolics  = bpEntries.map(l => Number(l.td.split("/")[0]));
            const diastolics = bpEntries.map(l => Number(l.td.split("/")[1]));
            const lastSys  = systolics.at(-1) ?? 0;
            const lastDia  = diastolics.at(-1) ?? 0;
            const bpHigh   = lastSys >= 140 || lastDia >= 90;
            const bpBorder = lastSys >= 130 || lastDia >= 85;
            const bpStatus = bpHigh ? "waspada" : bpBorder ? "perhatian" : "baik";
            const sysTrend = trendArrow(systolics);
            const diaTrend = trendArrow(diastolics);

            // ── weight ──
            const bbEntries = vitalLogs.filter(l => l.bb && Number(l.bb) > 0);
            const bbs = bbEntries.map(l => Number(l.bb));
            const mingguBB = bbEntries.map(l => l.minggu);
            let bbGainPerWeek: number | null = null;
            if (bbs.length >= 2) {
              const dBB = bbs.at(-1)! - bbs.at(-2)!;
              const dW  = Math.max(1, mingguBB.at(-1)! - mingguBB.at(-2)!);
              bbGainPerWeek = dBB / dW;
            }
            const bbTooFast = bbGainPerWeek !== null && bbGainPerWeek > 0.7;
            const bbTooSlow = bbGainPerWeek !== null && bbGainPerWeek < 0.1 && bbGainPerWeek >= 0;
            const bbStatus  = bbTooFast ? "perhatian" : bbTooSlow ? "perhatian" : "baik";
            const bbTrend   = trendArrow(bbs);

            // ── hemoglobin ──
            const hbEntries = vitalLogs.filter(l => l.hb && Number(l.hb) > 0);
            const hbs = hbEntries.map(l => Number(l.hb));
            const lastHb  = hbs.at(-1) ?? null;
            const hbLow   = lastHb !== null && lastHb < 11;
            const hbStatus = hbLow ? (lastHb! < 8 ? "waspada" : "perhatian") : "baik";
            const hbTrend  = trendArrow(hbs);

            // ── protein ──
            const lastProtein = vitalLogs.at(-1)?.protein ?? "Negatif";
            const proteinBad  = lastProtein !== "Negatif";
            const proteinStatus = lastProtein === "+++" || lastProtein === "++" ? "waspada" : proteinBad ? "perhatian" : "baik";

            // ── overall ──
            const allStatuses = [bpStatus, bbStatus, hbStatus, proteinStatus];
            const overallStatus = allStatuses.includes("waspada") ? "waspada" : allStatuses.includes("perhatian") ? "perhatian" : "baik";
            const statusColor  = { baik: "#16a34a", perhatian: "#f59e0b", waspada: "#ef4444" };
            const statusBg     = { baik: "#f0fdf4", perhatian: "#fffbeb", waspada: "#fef2f2" };
            const statusLabel  = { baik: "Semua Indikator Normal", perhatian: "Ada Indikator yang Perlu Diperhatikan", waspada: "Ada Tanda Peringatan — Konsultasikan ke Dokter" };

            const MetricCard = ({ title, value, unit, status, trendLabel, notes }: {
              title: string; value: string; unit?: string; status: "baik"|"perhatian"|"waspada"; trendLabel?: string; notes: string[];
            }) => (
              <div className="rounded-2xl p-5" style={{ background: t.card, boxShadow: `0 2px 12px ${t.shadow}` }}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: t.muted }}>{title}</p>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: statusBg[status], color: statusColor[status] }}>
                    {status === "baik" ? "Normal" : status === "perhatian" ? "Perhatian" : "Waspada"}
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <p className="text-2xl font-extrabold leading-none" style={{ color: t.dark }}>{value}</p>
                  {unit && <p className="text-xs mb-0.5" style={{ color: t.muted }}>{unit}</p>}
                  {trendLabel && (
                    <p className="text-xs font-bold mb-0.5 ml-auto" style={{ color: t.muted }}>{trendLabel}</p>
                  )}
                </div>
                <div className="space-y-1.5 mt-3 pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
                  {notes.map((n, i) => (
                    <p key={i} className="text-[11px] leading-snug" style={{ color: t.muted }}>{n}</p>
                  ))}
                </div>
              </div>
            );

            return (
              <div className="space-y-4">
                {/* Overall banner */}
                <div className="rounded-2xl px-5 py-4 flex items-center gap-4"
                  style={{ background: statusBg[overallStatus], border: `1.5px solid ${statusColor[overallStatus]}25` }}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: statusColor[overallStatus] }} />
                  <div>
                    <p className="text-sm font-extrabold" style={{ color: statusColor[overallStatus] }}>{statusLabel[overallStatus]}</p>
                    <p className="text-xs mt-0.5" style={{ color: t.muted }}>
                      Berdasarkan {vitalLogs.length} catatan · Terakhir: Minggu ke-{vitalLogs.at(-1)?.minggu}
                    </p>
                  </div>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    title="Tekanan Darah"
                    value={bpEntries.length ? `${lastSys}/${lastDia}` : "—"}
                    unit="mmHg"
                    status={bpStatus}
                    trendLabel={bpEntries.length >= 2 ? `Sistolik ${arrowIcon[sysTrend]}  Diastolik ${arrowIcon[diaTrend]}` : undefined}
                    notes={[
                      bpEntries.length >= 2
                        ? `Sistolik ${sysTrend === "stabil" ? "stabil" : sysTrend === "naik" ? "cenderung naik" : "cenderung turun"} dalam ${bpEntries.length} pemeriksaan terakhir.`
                        : "Tambah lebih banyak data untuk melihat tren.",
                      bpHigh
                        ? "Di atas batas normal (≥140/90). Segera konsultasikan ke dokter."
                        : bpBorder
                        ? "Mendekati batas atas normal. Pantau lebih ketat."
                        : "Dalam rentang normal (< 130/85). Pertahankan.",
                    ]}
                  />
                  <MetricCard
                    title="Berat Badan"
                    value={bbs.length ? `${bbs.at(-1)!.toFixed(1)}` : "—"}
                    unit="kg"
                    status={bbStatus}
                    trendLabel={bbs.length >= 2 ? `${bbGainPerWeek! >= 0 ? "+" : ""}${bbGainPerWeek!.toFixed(2)} kg/minggu` : undefined}
                    notes={[
                      bbs.length < 2
                        ? "Butuh minimal 2 data untuk menghitung laju kenaikan."
                        : bbTooFast
                        ? `Kenaikan ${bbGainPerWeek!.toFixed(2)} kg/minggu terlalu cepat (normal 0.3–0.5 kg/minggu).`
                        : bbTooSlow
                        ? `Kenaikan ${bbGainPerWeek!.toFixed(2)} kg/minggu terlalu lambat. Perhatikan asupan nutrisi.`
                        : `Kenaikan ${bbGainPerWeek!.toFixed(2)} kg/minggu dalam rentang normal (0.3–0.5 kg/minggu).`,
                      `Total kenaikan: ${(bbs.at(-1)! - bbs[0]).toFixed(1)} kg sejak data pertama.`,
                    ]}
                  />
                  <MetricCard
                    title="Hemoglobin"
                    value={lastHb !== null ? `${lastHb}` : "—"}
                    unit="g/dL"
                    status={hbStatus}
                    trendLabel={hbs.length >= 2 ? `Tren ${arrowIcon[hbTrend]}` : undefined}
                    notes={[
                      lastHb === null
                        ? "Belum ada data Hb."
                        : lastHb < 8
                        ? "Anemia berat (< 8 g/dL). Perlu penanganan segera."
                        : lastHb < 11
                        ? "Anemia ringan-sedang (< 11 g/dL). Tingkatkan konsumsi zat besi."
                        : "Normal (≥ 11 g/dL). Pertahankan asupan zat besi.",
                      hbs.length >= 2
                        ? `${hbTrend === "naik" ? "Membaik" : hbTrend === "turun" ? "Menurun" : "Stabil"} dibanding pemeriksaan sebelumnya.`
                        : "Tambah lebih banyak data untuk melihat tren.",
                    ]}
                  />
                  <MetricCard
                    title="Protein Urin"
                    value={lastProtein}
                    status={proteinStatus}
                    notes={[
                      lastProtein === "Negatif"
                        ? "Tidak ada protein dalam urin. Normal."
                        : lastProtein === "+"
                        ? "Protein + terdeteksi. Pantau tekanan darah dan beritahu dokter."
                        : `Protein ${lastProtein} — perlu evaluasi lebih lanjut, kemungkinan tanda preeklampsia.`,
                      "Protein urin positif + tekanan darah tinggi = waspada preeklampsia.",
                    ]}
                  />
                </div>

                {/* Rekomendasi */}
                {overallStatus !== "baik" && (
                  <div className="rounded-2xl p-5" style={{ background: t.soft }}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: t.dark }}>Rekomendasi</p>
                    <div className="space-y-2">
                      {bpHigh && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: "#fef2f2", color: "#ef4444" }}>TD</span>
                          <p className="text-xs" style={{ color: t.dark }}>Segera konsultasikan tekanan darah tinggi ke dokter atau bidan sebelum ANC berikutnya.</p>
                        </div>
                      )}
                      {bbTooFast && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: "#fffbeb", color: "#f59e0b" }}>BB</span>
                          <p className="text-xs" style={{ color: t.dark }}>Kurangi asupan gula dan makanan olahan. Pertimbangkan konsultasi gizi.</p>
                        </div>
                      )}
                      {bbTooSlow && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: "#fffbeb", color: "#f59e0b" }}>BB</span>
                          <p className="text-xs" style={{ color: t.dark }}>Pastikan asupan kalori dan protein cukup. Diskusikan dengan bidan di ANC berikutnya.</p>
                        </div>
                      )}
                      {hbLow && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: "#fef2f2", color: "#ef4444" }}>Hb</span>
                          <p className="text-xs" style={{ color: t.dark }}>Konsumsi suplemen zat besi secara rutin dan perbanyak makanan sumber zat besi (daging merah, sayur hijau).</p>
                        </div>
                      )}
                      {proteinBad && (
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: "#fef2f2", color: "#ef4444" }}>Pro</span>
                          <p className="text-xs" style={{ color: t.dark }}>Protein urin positif harus dilaporkan ke dokter. Jangan tunda jika disertai sakit kepala atau bengkak mendadak.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Riwayat tab ── */}
          {tab === "history" && (
            <div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ borderBottom: `1.5px solid ${t.border}` }}>
                      {[
                        { label: "Waktu", w: "w-[15%]" },
                        { label: "Ibu", w: "w-[20%]" },
                        { label: "Janin", w: "w-[20%]" },
                        { label: "Lab", w: "w-[20%]" },
                        { label: "Catatan", w: "w-[25%]" }
                      ].map(h => (
                        <th key={h.label} className={`text-center pb-3 px-4 text-[12px] font-bold uppercase tracking-widest whitespace-nowrap ${h.w}`} style={{ color: t.muted }}>{h.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((log) => (
                      <tr key={log.id} style={{ borderBottom: `1px solid ${t.border}`, background: "transparent" }}>
                        <td className="py-3 px-4 align-middle text-center min-w-[110px]">
                          <div className="flex flex-col gap-1 items-center justify-center">
                            <span className="text-sm font-bold whitespace-nowrap" style={{ color: t.dark }}>{log.date}</span>
                            <span className="text-[11px] whitespace-nowrap" style={{ color: t.muted }}>Mgg ke-{log.minggu}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 align-middle text-center min-w-[120px]">
                          <div className="flex flex-col gap-1.5 items-center justify-center">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-[11px] uppercase font-bold text-right w-[24px]" style={{ color: t.muted }}>TD</span>
                              <span className="text-[13px] font-bold text-left w-[54px]" style={{ color: t.dark }}>{log.td}</span>
                            </div>
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-[11px] uppercase font-bold text-right w-[24px]" style={{ color: t.muted }}>BB</span>
                              <span className="text-[13px] font-semibold text-left w-[54px]" style={{ color: t.dark }}>{log.bb} <span className="text-[11px] font-normal" style={{ color: t.muted }}>kg</span></span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 align-middle text-center min-w-[120px]">
                          <div className="flex flex-col gap-1.5 items-center justify-center">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-[11px] uppercase font-bold text-right w-[28px]" style={{ color: t.muted }}>TFU</span>
                              <span className="text-[13px] font-semibold text-left w-[50px]" style={{ color: t.dark }}>{log.fundus ? `${log.fundus} cm` : "—"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-[11px] uppercase font-bold text-right w-[28px]" style={{ color: t.muted }}>Ger</span>
                              <span className="text-[13px] font-semibold text-left w-[50px]" style={{ color: t.dark }}>{log.gerakan ? `${log.gerakan}` : "—"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 align-middle text-center min-w-[120px]">
                          <div className="flex flex-col gap-1.5 items-center justify-center">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-[11px] uppercase font-bold text-right w-[24px]" style={{ color: t.muted }}>Hb</span>
                              <span className="text-[13px] font-semibold text-left w-[46px]" style={{ color: t.dark }}>{log.hb ? `${log.hb}` : "—"}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block whitespace-nowrap mx-auto"
                              style={{ background: log.protein === "Negatif" ? "#f0fdf4" : "#fef2f2", color: log.protein === "Negatif" ? "#22c55e" : "#ef4444" }}>
                              {log.protein === "Negatif" ? "Prot: (-)" : `Prot: ${log.protein}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 align-middle text-center">
                          <p className="text-xs leading-relaxed line-clamp-2 mx-auto" style={{ color: t.muted }} title={log.catatan}>
                            {log.catatan || "—"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {vitalLogs.length === 0 && (
                <p className="text-center text-sm py-8" style={{ color: t.muted }}>Belum ada data. Klik "+ Catat Vital Baru" untuk mulai.</p>
              )}
            </div>
          )}
        </Card>

        {/* PDF preview — shown only when user clicks Ekspor PDF */}
        {showPdf && (
          <div className="mt-5">
            <MedicalReportPreview t={t} vitalLogs={vitalLogs} weeksPreg={weeksPreg} dueDate={dueDate} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Resources Screen ─────────────────────────────────────────────────────────

function ResourcesScreen({ t }: { t: Theme }) {
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
  }

  return (
    <div className="space-y-5 w-full">
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
                  <button onClick={() => setItems(p => ({ ...p, [id]: !p[id] }))}
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
              <button key={bp.id} onClick={() => setBirthPlan(p => ({...p, [bp.id]: !p[bp.id]}))}
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

// ─── Emergency Screen ─────────────────────────────────────────────────────────

function EmergencyScreen({ t, mode, alert, onSendAlert, onBack }: {
  t: Theme; mode: Mode; onBack: () => void;
  alert: EmergencyAlert | null;
  onSendAlert: (a: EmergencyAlert) => void;
}) {
  const [sending, setSending]   = useState(false);
  const [msgIdx, setMsgIdx]     = useState(0);
  const [customMsg, setCustomMsg] = useState("");
  const [secondsAgo, setSecondsAgo] = useState(0);

  const messages = [
    "DARURAT: Saya butuh bantuan sekarang!",
    "Kontraksi sudah 5-1-1, tolong jemput!",
    "Ada tanda bahaya, tolong segera ke sini!",
    "Pesan Kustom"
  ];

  useEffect(() => {
    if (!alert) return;
    const id = setInterval(() => setSecondsAgo(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [alert]);

  function handleSend() {
    if (msgIdx === 3 && !customMsg.trim()) return; // Prevent empty custom messages
    setSending(true);
    setTimeout(() => {
      onSendAlert({
        sentAt: new Date(),
        trigger: "manual",
        location: "Jl. Kemang Raya No. 45, Jakarta Selatan",
        lat: -6.2607,
        lng: 106.8163,
        contractions: "5 mnt · 60 dtk · 3 kali",
        message: msgIdx === 3 ? customMsg.trim() : messages[msgIdx],
        husbandAck: false,
        husbandEta: null,
      });
      setSending(false);
    }, 1800);
  }

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="rounded-3xl p-6 text-center" style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
        <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center bg-white/20">
          <PhoneCall size={26} className="text-white" />
        </div>
        <p className="text-2xl font-extrabold text-white">Mode Darurat</p>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>Hubungi bantuan & beritahu suami posisi Anda</p>
      </div>

      <div className="space-y-4">
        {/* Call & Hospital */}
        <div className="grid grid-cols-4 gap-4">
          <a href="tel:119" className="col-span-1 flex flex-col items-center justify-center gap-3 rounded-3xl p-4 text-center transition-all hover:scale-[1.02]" style={{ background: "#fef2f2", border: "1.5px solid #fca5a5" }}>
            <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <PhoneCall size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-red-700 leading-tight">Panggil<br/>Ambulans</p>
              <p className="text-[10px] font-semibold text-red-500 mt-1">119 — IGD</p>
            </div>
          </a>
          <Card t={t} className="col-span-3 p-5 flex flex-col">
            <p className="text-xs font-bold mb-3 uppercase tracking-wide flex-shrink-0" style={{ color: "#ef4444" }}>RS Terdekat</p>
            <div className="flex-1 grid grid-cols-3 gap-3">
              {[
                { name: "RSIA Bunda",      dist: "2.3 km", time: "~8 mnt"  },
                { name: "RS Ibu Permata",  dist: "4.1 km", time: "~12 mnt" },
                { name: "RSUP Nasional",   dist: "5.8 km", time: "~18 mnt" },
              ].map(rs => (
                <div key={rs.name} className="flex flex-col rounded-xl p-3" style={{ background: t.soft }}>
                  <p className="text-[13px] font-bold leading-tight" style={{ color: t.dark }}>{rs.name}</p>
                  <p className="text-[11px] mb-3 mt-0.5" style={{ color: t.muted }}>{rs.dist} · {rs.time}</p>
                  <button className="mt-auto text-[11px] font-bold py-1.5 rounded-lg text-white transition-all w-full" style={{ background: "#ef4444" }}>Navigasi</button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right panels */}
        {mode === "mother" && (
          <Card t={t} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Send size={16} color="#ef4444" />
              <p className="text-sm font-extrabold" style={{ color: t.dark }}>Kirim Notifikasi Darurat ke Suami</p>
            </div>

            {!alert ? (
              <>
                {/* Location preview */}
                <div className="rounded-2xl p-3 mb-4 flex items-center gap-3" style={{ background: t.soft }}>
                  <MapPin size={16} color={t.active} className="flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold" style={{ color: t.dark }}>Lokasi saat ini (GPS)</p>
                    <p className="text-[11px]" style={{ color: t.muted }}>Jl. Kemang Raya No. 45, Jakarta Selatan</p>
                    <p className="text-[10px]" style={{ color: t.muted }}>-6.2607, 106.8163 · Diperbarui barusan</p>
                  </div>
                </div>

                {/* Message selector */}
                <p className="text-sm font-extrabold mb-3 mt-1" style={{ color: t.dark }}>Pilih atau Ketik Pesan:</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {messages.map((m, i) => (
                    <React.Fragment key={i}>
                      <button onClick={() => setMsgIdx(i)}
                        className={`w-full text-left rounded-xl px-4 py-3 text-[13px] transition-all ${i === 3 ? "col-span-2" : ""}`}
                        style={{
                          background: msgIdx === i ? t.soft : "#f8f8f8",
                          border: `1.5px solid ${msgIdx === i ? t.active : "transparent"}`,
                          color: msgIdx === i ? t.active : t.muted,
                          fontWeight: msgIdx === i ? 700 : 500,
                        }}>
                        {m}
                      </button>
                      {msgIdx === 3 && i === 3 && (
                        <div className="col-span-2">
                          <textarea
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none border-2 transition-all resize-none mt-1"
                            style={{ borderColor: t.active, background: t.card, color: t.dark }}
                            placeholder="Tulis pesan darurat Anda di sini..."
                            rows={2}
                            value={customMsg}
                            onChange={e => setCustomMsg(e.target.value)}
                            autoFocus
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <button onClick={handleSend} disabled={sending || (msgIdx === 3 && !customMsg.trim())}
                  className="w-full py-3.5 rounded-2xl font-extrabold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: sending ? "#f87171" : "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
                  {sending
                    ? <><RefreshCw size={16} className="animate-spin" /> Mengirim…</>
                    : <><Send size={16} /> Kirim Notifikasi + Bagikan Lokasi</>
                  }
                </button>
              </>
            ) : (
              /* Sent state */
              <div className="space-y-3">
                <div className="rounded-2xl p-4 text-center" style={{ background: "#f0fdf4", border: "1.5px solid #86efac" }}>
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-2">
                    <CheckCheck size={20} className="text-white" />
                  </div>
                  <p className="text-sm font-extrabold text-green-700">Notifikasi Terkirim!</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    {secondsAgo < 60 ? `${secondsAgo} detik yang lalu` : `${Math.floor(secondsAgo / 60)} menit yang lalu`}
                  </p>
                </div>

                {/* What was sent */}
                <div className="rounded-2xl p-4" style={{ background: t.soft }}>
                  <p className="text-xs font-bold mb-2" style={{ color: t.dark }}>Yang dikirim ke suami:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Zap size={12} color="#ef4444" />
                      <p className="text-xs" style={{ color: t.dark }}>"{alert.message}"</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} color={t.active} />
                      <p className="text-xs" style={{ color: t.muted }}>{alert.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} color={t.muted} />
                      <p className="text-xs" style={{ color: t.muted }}>
                        {alert.sentAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Husband status */}
                <div className="rounded-2xl p-4" style={{ background: alert.husbandAck ? "#f0fdf4" : "#f0f9ff", border: `1.5px solid ${alert.husbandAck ? "#86efac" : "#7dd3fc"}` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${alert.husbandAck ? "bg-green-500" : "bg-blue-400"}`} />
                    <p className="text-xs font-bold" style={{ color: alert.husbandAck ? "#166534" : "#0369a1" }}>
                      {alert.husbandAck ? "Suami sudah konfirmasi" : "Notifikasi berhasil dikirim ke suami"}
                    </p>
                  </div>
                  {alert.husbandEta && (
                    <p className="text-xs" style={{ color: "#166534" }}>ETA suami: ~{alert.husbandEta} menit</p>
                  )}
                </div>

                <button onClick={handleSend}
                  className="w-full py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5"
                  style={{ borderColor: "#fca5a5", color: "#ef4444", background: "#fff" }}>
                  <RefreshCw size={12} /> Kirim Ulang
                </button>
              </div>
            )}
          </Card>
        )}

        {/* Companion emergency panel */}
        {mode === "companion" && <CompanionEmergencyPanel t={t} alert={alert} />}
      </div>
    </div>
  );
}

// ─── Companion Emergency Panel ────────────────────────────────────────────────

function CompanionEmergencyPanel({ t, alert }: { t: Theme; alert: EmergencyAlert | null }) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [called, setCalled] = useState<Record<string, boolean>>({});
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!alert) return;
    const id = setInterval(() => setSecondsAgo(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [alert]);

  const checklistItems = [
    { id: "car",   label: "Kendaraan siap & BBM penuh"       },
    { id: "route", label: "Rute ke RS sudah dicek"           },
    { id: "bag",   label: "Tas persalinan sudah diambil"     },
    { id: "doc",   label: "Nomor dokter tersimpan di telepon"},
    { id: "bpjs",  label: "Kartu BPJS & KTP sudah dibawa"   },
    { id: "go",    label: "Sudah berangkat menjemput Bunda"  },
  ];

  const donePct = Math.round((Object.values(checks).filter(Boolean).length / checklistItems.length) * 100);

  const contacts = [
    { name: "Bunda Sari",     role: "Istri",           phone: "+62-812-xxxx-xxxx", color: "#ef4444" },
    { name: "dr. Ratna Sp.OG", role: "Dokter Kandungan", phone: "+62-811-xxxx-xxxx", color: t.active  },
    { name: "RSIA Bunda",     role: "RS Rujukan",       phone: "+62-21-xxxx-xxxx",  color: "#f59e0b" },
  ];

  return (
    <div className="col-span-2 grid grid-cols-2 gap-4">
      {/* Alert status */}
      <Card t={t} className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={15} color="#ef4444" />
          <p className="text-sm font-extrabold" style={{ color: t.dark }}>Status Darurat Bunda</p>
        </div>

        {alert ? (
          <div className="space-y-3">
            <div className="rounded-2xl p-4" style={{ background: "#fef2f2", border: "1.5px solid #fca5a5" }}>
              <p className="text-xs font-bold text-red-700 mb-1">Pesan dari Bunda:</p>
              <p className="text-sm font-semibold text-red-800">"{alert.message}"</p>
              <p className="text-[10px] text-red-400 mt-1.5">
                {secondsAgo < 60 ? `${secondsAgo}s yang lalu` : `${Math.floor(secondsAgo / 60)} mnt yang lalu`}
              </p>
            </div>

            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: t.soft }}>
              <MapPin size={13} color={t.active} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold" style={{ color: t.dark }}>Lokasi Bunda</p>
                <p className="text-[11px]" style={{ color: t.muted }}>{alert.location}</p>
                <p className="text-[10px]" style={{ color: t.muted }}>{alert.lat}, {alert.lng}</p>
              </div>
            </div>

            {/* Mini map */}
            <div className="rounded-xl overflow-hidden" style={{ height: 110, background: "#e8f4e8" }}>
              <svg width="100%" height="100%" viewBox="0 0 260 110">
                {[25,50,75,100,125,150,175,200,225].map(x=><line key={x} x1={x} y1={0} x2={x} y2={110} stroke="#c8e6c8" strokeWidth={1}/>)}
                {[25,50,75,100].map(y=><line key={y} x1={0} y1={y} x2={260} y2={y} stroke="#c8e6c8" strokeWidth={1}/>)}
                <path d="M 0 58 Q 130 48 260 58" stroke="#d4d4d4" strokeWidth={5} fill="none"/>
                <path d="M 110 0 L 110 110" stroke="#d4d4d4" strokeWidth={5}/>
                <circle cx={130} cy={55} r={14} fill="rgba(239,68,68,0.15)"/>
                <circle cx={130} cy={55} r={8} fill="rgba(239,68,68,0.3)"/>
                <circle cx={130} cy={55} r={5} fill="#ef4444"/>
                <circle cx={55} cy={78} r={5} fill={t.active}/>
                <path d="M 55 78 Q 90 66 130 55" stroke={t.active} strokeWidth={2} strokeDasharray="4 3" fill="none"/>
                <text x={138} y={50} fontSize={8} fill="#ef4444" fontWeight="bold">Bunda</text>
                <text x={35} y={90} fontSize={8} fill={t.active} fontWeight="bold">Ayah</text>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl p-2.5 text-center" style={{ background: t.soft }}>
                <p className="text-[10px]" style={{ color: t.muted }}>Jarak</p>
                <p className="text-sm font-extrabold" style={{ color: t.dark }}>2.3 km</p>
              </div>
              <div className="rounded-xl p-2.5 text-center" style={{ background: t.soft }}>
                <p className="text-[10px]" style={{ color: t.muted }}>ETA</p>
                <p className="text-sm font-extrabold" style={{ color: t.dark }}>~8 mnt</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-6 text-center" style={{ background: "#f0fdf4", border: "1.5px solid #86efac" }}>
            <Check size={28} className="text-green-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-green-700">Kondisi Bunda Normal</p>
            <p className="text-xs text-green-600 mt-1">Tidak ada notifikasi darurat aktif</p>
          </div>
        )}
      </Card>

      {/* Checklist & Contacts */}
      <div className="space-y-4">
        {/* Quick contacts */}
        <Card t={t} className="p-4">
          <p className="text-xs font-extrabold mb-3 uppercase tracking-wide" style={{ color: t.dark }}>Kontak Cepat</p>
          <div className="space-y-2">
            {contacts.map(c => (
              <div key={c.name} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: t.soft }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ background: c.color }}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: t.dark }}>{c.name}</p>
                  <p className="text-[10px]" style={{ color: t.muted }}>{c.role}</p>
                </div>
                <button onClick={() => setCalled(p => ({ ...p, [c.name]: true }))}
                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full text-white flex-shrink-0"
                  style={{ background: called[c.name] ? "#22c55e" : c.color }}>
                  {called[c.name] ? <><Check size={10}/> Terhubung</> : <><PhoneCall size={10}/> Hubungi</>}
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Action checklist */}
        <Card t={t} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: t.dark }}>Checklist Suami</p>
            <span className="text-xs font-bold" style={{ color: donePct === 100 ? "#22c55e" : t.active }}>{donePct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: t.soft }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${donePct}%`, background: donePct === 100 ? "#22c55e" : t.active }} />
          </div>
          <div className="space-y-1.5">
            {checklistItems.map(item => (
              <button key={item.id} onClick={() => setChecks(p => ({ ...p, [item.id]: !p[item.id] }))}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all"
                style={{ background: checks[item.id] ? "#f0fdf4" : t.soft }}>
                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: checks[item.id] ? "#22c55e" : t.border }}>
                  {checks[item.id] && <Check size={10} className="text-white" />}
                </div>
                <span className="text-xs" style={{ color: checks[item.id] ? "#22c55e" : t.dark, textDecoration: checks[item.id] ? "line-through" : "none" }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Postpartum Screen ────────────────────────────────────────────────────────

function PostpartumScreen({ t, onBack }: { t: Theme; onBack: () => void }) {
  const [birthDate, setBirthDate] = useState("");
  const [step, setStep]           = useState<"input" | "admin">("input");
  const [checks, setChecks]       = useState<Record<string, boolean>>({});

  const adminSteps = [
    { id: "surat", label: "Surat Lahir dari RS / Bidan",  deadline: "Hari lahir"   },
    { id: "akta",  label: "Akta Kelahiran – Dukcapil",    deadline: "< 30 hari"    },
    { id: "kk",    label: "Pembaruan Kartu Keluarga",     deadline: "< 30 hari"    },
    { id: "bpjs",  label: "Daftar BPJS Bayi Baru Lahir", deadline: "< 28 hari"    },
    { id: "nik",   label: "Pembuatan NIK Bayi",           deadline: "Setelah Akta" },
  ];
  const donePct = Math.round((Object.values(checks).filter(Boolean).length / adminSteps.length) * 100);

  if (step === "input") {
    return (
      <div className="max-w-md mx-auto space-y-5">
        <div className="rounded-3xl p-10 text-center" style={{ background: t.grad }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
            <Baby size={36} color="white" />
          </div>
          <p className="text-3xl font-extrabold text-white">Selamat, Bunda</p>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>Bayi kecil Anda telah hadir di dunia</p>
        </div>
        <Card t={t} className="p-6 space-y-4">
          <p className="text-sm font-bold" style={{ color: t.dark }}>Tanggal & Waktu Kelahiran</p>
          <input type="datetime-local"
            className="w-full rounded-full px-5 py-3 outline-none border-2 text-sm transition-all"
            style={{ borderColor: birthDate ? t.primary : t.border, color: t.dark, background: t.soft }}
            value={birthDate} onChange={e => setBirthDate(e.target.value)}
          />
          <PillBtn full variant="primary" size="lg" disabled={!birthDate} onClick={() => birthDate && setStep("admin")} t={t}>
            Konfirmasi Kelahiran
          </PillBtn>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full">
      <div className="rounded-3xl p-6 flex items-center gap-6" style={{ background: t.grad }}>
        <div className="flex-1">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Mode Pasca-Melahirkan</p>
          <p className="text-2xl font-extrabold text-white mt-1">Selamat, Bunda</p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            Lahir: {new Date(birthDate).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
          <Baby size={28} color="white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card t={t} className="p-6">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle>Administrasi Bayi Baru Lahir</SectionTitle>
            <span className="text-xs font-bold" style={{ color: donePct === 100 ? "#22c55e" : t.active }}>{donePct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: t.soft }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${donePct}%`, background: donePct === 100 ? "#22c55e" : t.primary }} />
          </div>
          <div className="space-y-2">
            {adminSteps.map(s => (
              <button key={s.id} onClick={() => setChecks(p => ({ ...p, [s.id]: !p[s.id] }))}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                style={{ background: checks[s.id] ? "#f0fdf4" : t.soft }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: checks[s.id] ? "#22c55e" : t.primary }}>
                  {checks[s.id] ? <Check size={14} className="text-white" /> : <span className="text-[10px] font-bold text-white">·</span>}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold" style={{ color: checks[s.id] ? "#166534" : t.dark }}>{s.label}</p>
                  <p className="text-[11px]" style={{ color: t.muted }}>Batas: {s.deadline}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card t={t} className="p-6">
          <SectionTitle>Tips Pemulihan Pasca-Melahirkan</SectionTitle>
          <div className="space-y-3">
            {[
              "Istirahat cukup — tidur saat bayi tidur",
              "Susui bayi on-demand (8–12× per hari)",
              "Jaga kebersihan luka jahitan, ganti perban rutin",
              "Perhatikan tanda baby blues vs depresi postpartum",
              "Kunjungi dokter 6 minggu pasca persalinan",
              "Lanjutkan suplemen zat besi dan vitamin D",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: t.soft }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[10px] font-bold" style={{ background: t.primary }}>
                  {i + 1}
                </div>
                <p className="text-sm" style={{ color: t.dark }}>{tip}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
