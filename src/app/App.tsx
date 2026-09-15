import React, { useState, useEffect, useRef } from "react";
import {
  Home, Activity, Calendar, FileText, Package, Bell,
  Plus, Minus, Check, X, AlertTriangle, Download, Baby,
  PhoneCall, ArrowRight, RefreshCw, ChevronLeft, Search, Heart,
  MapPin, Navigation, Send, CheckCheck, Clock, Zap, Printer, Mail, Lock, LogOut, Settings, History, Users, Scissors, Droplets, Brain, HeartPulse, Eye, Bone, Wind, Activity as ActivityIcon,
  User, Smartphone, Copy, Headphones, MessageCircle, HelpCircle
} from "lucide-react";
import { Routes, Route, useNavigate, useLocation } from "react-router";
import { VitalLog, EmergencyAlert, Theme, Mode, Screen, Risk, UserProfile } from "../types";
import { THEMES } from "../constants/theme";
import { Card } from "../components/Card";
import { LoginScreen } from "../pages/LoginScreen";
import { MotherDashboard, CompanionDashboard } from "../pages/Dashboard";
import { HealthScreen } from "../pages/HealthScreen";
import { CalendarScreen } from "../pages/CalendarScreen";
import { ReportsScreen } from "../pages/ReportsScreen";
import { ResourcesScreen } from "../pages/ResourcesScreen";
import { EmergencyScreen } from "../pages/EmergencyScreen";
import { PostpartumScreen } from "../pages/PostpartumScreen";
import { addDays, getFruit, fmtDate } from "../utils/helpers";
const SEED_VITALS: VitalLog[] = [
  { id:"v1", date:"5 Nov 2024",  minggu:18, td:"116/74", bb:"62.0", fundus:"18", gerakan:"6-8",  hb:"12.1", protein:"Negatif", catatan:"" },
  { id:"v2", date:"2 Des 2024",  minggu:22, td:"118/76", bb:"64.5", fundus:"22", gerakan:"8-10", hb:"11.9", protein:"Negatif", catatan:"Sedikit pusing pagi" },
  { id:"v3", date:"6 Jan 2025",  minggu:27, td:"120/78", bb:"67.0", fundus:"27", gerakan:"8-10", hb:"11.5", protein:"Negatif", catatan:"" },
  { id:"v4", date:"27 Jan 2025", minggu:31, td:"118/76", bb:"68.5", fundus:"32", gerakan:"8-10", hb:"11.8", protein:"Negatif", catatan:"" },
];

// ─── Shared components ────────────────────────────────────────────────────────









// ─── Profile & Settings ───────────────────────────────────────────────────────



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
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("isAuthenticated") === "true");
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem("appMode") as Mode) || "mother");

  useEffect(() => {
    localStorage.setItem("isAuthenticated", String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem("appMode", mode);
  }, [mode]);
  const location = useLocation();
  const navigate = useNavigate();
  const screen = location.pathname.substring(1) || "dashboard";
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomerService, setShowCustomerService] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert]       = useState<EmergencyAlert | null>(null);
  const [vitalLogs, setVitalLogs] = useState<VitalLog[]>([]);
  const [vitDone, setVitDone]   = useState<Record<string, boolean>>({});
  const [symptoms, setSymptoms] = useState<Record<string, boolean>>({});

  function handleAck() {
    setAlert(prev => prev ? { ...prev, husbandAck: true } : null);
  }

  function handleSetEta(mins: number) {
    setAlert(prev => prev ? { ...prev, husbandEta: mins } : null);
  }

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
              <button key={id} onClick={() => navigate("/" + id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:scale-[1.02] hover:bg-black/5"
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
            <button onClick={() => navigate("/emergency")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:scale-[1.02] hover:bg-black/5"
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
            <div onClick={() => navigate("/postpartum")}
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
                          navigate("/" + item.id);
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
                      <button onClick={() => { navigate("/emergency"); setShowNotif(false); }} className="w-full mt-1 py-1.5 rounded-lg text-[10px] font-bold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
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
                        setShowCustomerService(true);
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors text-left" 
                      style={{ color: t.dark }}
                    >
                      <Headphones size={15} color={t.muted} /> Customer Service
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
          <Routes>
            <Route path="/" element={mode === "mother" ? <MotherDashboard t={t} weeksPreg={weeksPreg} daysExtra={daysExtra} daysUntilDue={daysUntilDue} dueDate={dueDate} fruit={fruit} trimester={trimester} onEmergency={() => navigate("/emergency")} onGoHealth={() => navigate("/health")} vitDone={vitDone} symptoms={symptoms} motherName={userProfile.motherName} /> : <CompanionDashboard t={t} weeksPreg={weeksPreg} daysExtra={daysExtra} alert={alert} onAck={handleAck} onSetEta={handleSetEta} motherName={userProfile.motherName} />} />
            <Route path="/dashboard" element={mode === "mother" ? <MotherDashboard t={t} weeksPreg={weeksPreg} daysExtra={daysExtra} daysUntilDue={daysUntilDue} dueDate={dueDate} fruit={fruit} trimester={trimester} onEmergency={() => navigate("/emergency")} onGoHealth={() => navigate("/health")} vitDone={vitDone} symptoms={symptoms} motherName={userProfile.motherName} /> : <CompanionDashboard t={t} weeksPreg={weeksPreg} daysExtra={daysExtra} alert={alert} onAck={handleAck} onSetEta={handleSetEta} motherName={userProfile.motherName} />} />
            <Route path="/health" element={<HealthScreen t={t} onEmergency={() => navigate("/emergency")} vitalLogs={vitalLogs} onAddVital={v => setVitalLogs(p => [...p, v])} vitDone={vitDone} setVitDone={setVitDone} symptoms={symptoms} setSymptoms={setSymptoms} />} />
            <Route path="/calendar" element={<CalendarScreen t={t} dueDate={dueDate} weeksPreg={weeksPreg} daysUntilDue={daysUntilDue} trimester={trimester} />} />
            <Route path="/reports" element={<ReportsScreen t={t} vitalLogs={vitalLogs} onAddVital={v => setVitalLogs(p => [...p, v])} weeksPreg={weeksPreg} dueDate={dueDate} />} />
            <Route path="/resources" element={<ResourcesScreen t={t} />} />
            <Route path="/emergency" element={<EmergencyScreen t={t} mode={mode} alert={alert} onSendAlert={a => { setAlert(a); }} onBack={() => navigate("/dashboard")} />} />
            <Route path="/postpartum" element={<PostpartumScreen t={t} onBack={() => navigate("/dashboard")} />} />
          </Routes>
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
      <CustomerServiceModal
        isOpen={showCustomerService}
        onClose={() => setShowCustomerService(false)}
        t={t}
      />
    </div>
  );
}


function CustomerServiceModal({ isOpen, onClose, t }: { isOpen: boolean; onClose: () => void; t: Theme }) {
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
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: t.active }}>Bantuan Mela</p>
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
          <p className="text-sm text-white/80 mt-1">Tim Mela siap membantu kebutuhan Anda.</p>
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
                <div><p className="text-xs font-bold" style={{ color: t.dark }}>WhatsApp Mela</p><p className="text-[10px]" style={{ color: t.muted }}>Balasan biasanya kurang dari 10 menit</p></div>
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

// ─── Resources Screen ─────────────────────────────────────────────────────────



// ─── Emergency Screen ─────────────────────────────────────────────────────────



// ─── Companion Emergency Panel ────────────────────────────────────────────────



// ─── Postpartum Screen ────────────────────────────────────────────────────────


