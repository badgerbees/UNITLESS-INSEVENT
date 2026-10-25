import React, { useState, useEffect, useRef } from "react";
import {
  Home, Activity, Calendar, FileText, Package, Bell,
  Plus, Minus, Check, X, AlertTriangle, Download, Baby,
  PhoneCall, ArrowRight, RefreshCw, ChevronLeft, Search, Heart,
  MapPin, Navigation, Send, CheckCheck, Clock, Zap, Printer, Mail, Lock, LogOut, Settings, History, Users, Scissors, Droplets, Brain, HeartPulse, Eye, Bone, Wind, Activity as ActivityIcon,
  User, Smartphone, Copy, Headphones, MessageCircle, HelpCircle, PanelLeftClose, PanelLeftOpen, Timer, Footprints
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { Theme, Mode, Screen, UserProfile } from "../types";
import { THEMES } from "../constants/theme";
import { Card } from "../components/Card";
import { LoginScreen } from "../pages/LoginScreen";
import { addDays, getFruit, fmtDate } from "../utils/helpers";
import { APP_NAME } from "../constants/brand";
import logoIcon from "../assets/temanbunda-app-icon.svg";
import { auth, type AuthForm } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { useTrackers, KICK_TARGET } from "../hooks/useTrackers";
import { api, type AppNotification } from "../services/api";
import { useAppData } from "./useAppData";
import { AppRoutes } from "./AppRoutes";
import { PregnancySetupScreen } from "../pages/PregnancySetupScreen";

// ─── Shared components ────────────────────────────────────────────────────────









// ─── Profile & Settings ───────────────────────────────────────────────────────



function SettingsModal({
  isOpen,
  onClose,
  t,
  profile,
  mode,
  companionConnected,
  onUnpair,
  onCodeGenerated,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  t: Theme;
  profile: UserProfile;
  mode: Mode;
  companionConnected: boolean;
  onUnpair: () => Promise<void>;
  onCodeGenerated: (pregnancy: import("../services/api").Pregnancy) => void;
  onSave: (newProfile: UserProfile) => void;
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"profile" | "pregnancy" | "sync" | "notif" | "security">("profile");
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncBusy, setSyncBusy] = useState(false);

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

  const handleGenerateCode = async () => {
    setSyncBusy(true);
    setSyncMessage("");
    try {
      const pregnancy = await api.createSyncCode();
      setFormData(previous => ({
        ...previous,
        syncCode: pregnancy.sync_code,
        syncCodeExpiresAt: pregnancy.sync_code_expires_at,
      }));
      onCodeGenerated(pregnancy);
      setSyncMessage("Kode baru berhasil dibuat dan berlaku selama 15 menit.");
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : "Kode gagal dibuat.");
    } finally {
      setSyncBusy(false);
    }
  };

  const handleUnpair = async () => {
    if (!window.confirm("Putuskan hubungan akun dengan pasangan?")) return;
    setSyncBusy(true);
    setSyncMessage("");
    try {
      await onUnpair();
      setFormData(previous => ({ ...previous, syncCode: "", syncCodeExpiresAt: "" }));
      setSyncMessage("Akun pasangan berhasil diputuskan.");
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : "Hubungan akun gagal diputuskan.");
    } finally {
      setSyncBusy(false);
    }
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
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Tanggal HPHT</label>
                    <input
                      type="date"
                      className="w-full h-11 rounded-xl px-4 text-sm outline-none border transition-all bg-white"
                      style={{ borderColor: t.border, color: t.dark }}
                      value={formData.hphtDate}
                      onChange={(e) => setFormData({ ...formData, hphtDate: e.target.value })}
                    />
                    <p className="text-[10px] mt-1 px-1" style={{ color: t.muted }}>Hari pertama haid terakhir</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Golongan Darah Ibu</label>
                    <select
                      className="w-full h-11 rounded-xl px-4 text-sm outline-none border transition-all bg-white"
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
                      className="w-full h-11 rounded-xl px-4 text-sm outline-none border transition-all"
                      style={{ borderColor: t.border, background: "#fafafa", color: t.dark }}
                      value={formData.hospital}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: t.dark }}>Dokter Kandungan (Sp.OG)</label>
                    <input
                      type="text"
                      className="w-full h-11 rounded-xl px-4 text-sm outline-none border transition-all"
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
                {mode === "mother" && !companionConnected ? (
                  <div className="rounded-2xl p-5 border text-center space-y-3" style={{ borderColor: t.border, background: "#fcfcfc" }}>
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                      <Smartphone size={24} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: t.dark }}>Bagikan kode kepada Ayah</p>
                    <p className="text-xs" style={{ color: t.muted }}>Ayah memasukkan kode ini di HP-nya. Setelah benar, akun langsung terhubung tanpa konfirmasi tambahan.</p>
                    <div className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 border bg-white shadow-sm" style={{ borderColor: t.border }}>
                      <span className="text-xl font-black tracking-widest" style={{ color: t.dark, fontFamily: "monospace" }}>{formData.syncCode || "------"}</span>
                      <button onClick={handleCopyCode} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Salin kode"><Copy size={16} color={t.active} /></button>
                    </div>
                    <p className="text-[11px]" style={{ color: t.muted }}>
                      {formData.syncCodeExpiresAt ? `Berlaku sampai ${new Date(formData.syncCodeExpiresAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.` : "Buat kode baru sebelum dibagikan kepada Ayah."}
                    </p>
                    <button onClick={() => void handleGenerateCode()} disabled={syncBusy} className="text-xs font-bold disabled:opacity-50" style={{ color: t.active }}>Buat kode baru</button>
                  </div>
                ) : (
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
                )}
                {syncMessage && <p className="text-xs text-center font-semibold" style={{ color: syncMessage.includes("berhasil") ? "#15803d" : "#dc2626" }}>{syncMessage}</p>}
                {companionConnected && <button onClick={() => void handleUnpair()} disabled={syncBusy} className="w-full rounded-xl border py-2.5 text-xs font-bold text-red-600 disabled:opacity-50" style={{ borderColor: "#fecaca" }}>Putuskan hubungan pasangan</button>}
                {!companionConnected && mode === "mother" && <p className="text-xs text-center" style={{ color: t.muted }}>Setelah Ayah memasukkan kode yang benar, banner akun tersinkronisasi akan muncul di sini.</p>}
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
              className="ui-interactive px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md"
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

const NOTIF_META: Record<AppNotification["kind"], { Icon: typeof Bell; color: string; bg: string }> = {
  emergency:          { Icon: AlertTriangle, color: "#ef4444", bg: "#fee2e2" },
  emergency_ack:      { Icon: CheckCheck,    color: "#16a34a", bg: "#dcfce7" },
  emergency_resolved: { Icon: Check,         color: "#16a34a", bg: "#dcfce7" },
  vitamin:            { Icon: Droplets,      color: "#f59e0b", bg: "#fef3c7" },
  anc:                { Icon: Calendar,      color: "#6366f1", bg: "#e0e7ff" },
  weekly_report:      { Icon: Baby,          color: "#ec4899", bg: "#fce7f3" },
  info:               { Icon: Bell,          color: "#6b7280", bg: "#f3f4f6" },
};

function fmtDuration(totalSecs: number) {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = String(totalSecs % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const screen = location.pathname.substring(1) || "dashboard";
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebarCollapsed") === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0"); } catch { /* storage tidak tersedia */ }
  }, [collapsed]);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomerService, setShowCustomerService] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const {
    role, hasPregnancy, companionConnected, loadError, retryLoad, alert, sendAlert, ackAlert, resolveAlert, vitalLogs, vitDone, setVitDone, symptoms, setSymptoms,
    vitamins, setVitamins, customSymptoms, setCustomSymptoms, userProfile, setUserProfile,
    addVital, toggleVitamin, toggleSymptom, saveVitamins,
    unpairPregnancy,
    birthAt, postpartumAdmin, confirmBirth, cancelBirth, togglePostpartumAdmin,
  } = useAppData(user);
  const {
    notifications, unreadCount, permission: notifPermission, requestPermission, markRead, markAllRead,
  } = useNotifications(user, { sound: userProfile.notifEmergencySound, onOpen: link => navigate(link) });
  const trackers = useTrackers(user);

  // Tampilan Ibu/Suami mengikuti peran akun di server; tidak bisa diganti dari aplikasi
  const mode: Mode = role ?? "mother";
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
  const isPostpartum = birthAt != null;
  const babyAgeDays  = birthAt ? Math.max(0, Math.floor((today.getTime() - birthAt.getTime()) / 86400000)) : 0;
  const babyAgeLabel = babyAgeDays < 14 ? `${babyAgeDays} hari` : `${Math.floor(babyAgeDays / 7)} minggu`;

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
    // Setelah bayi lahir, Persiapan diganti Pasca-Melahirkan (halaman Persiapan tetap bisa dibuka lewat pencarian)
    isPostpartum
      ? { id: "postpartum" as Screen, label: "Pasca-Melahirkan", Icon: Baby }
      : { id: "resources"  as Screen, label: "Persiapan",        Icon: Package },
  ];

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Memuat sesi...</div>;
  }

  if (!user) {
    const handleLogin = async (form: AuthForm): Promise<{ message?: string }> => {
      if (form.view === "register") {
        const result = await auth.signUp(form.email, form.password, form.name, form.mode);
        if (result.error) throw result.error;
        if (result.data.session) await auth.signOut();
        return {
          message: result.data.session
            ? "Akun berhasil dibuat. Silakan masuk untuk melanjutkan."
            : "Akun berhasil dibuat. Silakan cek email Anda jika verifikasi diminta, lalu masuk.",
        };
      }
      const result = await auth.signIn(form.email, form.password);
      if (result.error) throw result.error;
      return {};
    };

    return <LoginScreen onLogin={handleLogin} />;
  }

  if (hasPregnancy === null && loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center" style={{ background: t.bg }}>
        <p className="text-sm font-bold" style={{ color: t.dark }}>Gagal memuat data akun</p>
        <p className="text-xs max-w-sm" style={{ color: t.muted }}>
          Server tidak dapat dihubungi atau sedang bermasalah. Periksa koneksi internet lalu coba lagi.
        </p>
        <div className="flex gap-2 mt-1">
          <button onClick={() => void auth.signOut()} className="ui-interactive px-4 py-2 rounded-full text-xs font-bold" style={{ background: t.soft, color: t.active }}>
            Keluar
          </button>
          <button onClick={retryLoad} className="ui-interactive px-4 py-2 rounded-full text-xs font-bold text-white" style={{ background: t.grad }}>
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (hasPregnancy === null) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Menyiapkan akun...</div>;
  }

  if (!hasPregnancy) {
    return <PregnancySetupScreen t={t} mode={mode} onCreated={() => window.location.reload()} />;
  }

  // Daftar fitur untuk search bar — tampil semua saat kosong, terfilter saat user mengetik
  const searchFeatures = [
    { id: "dashboard"  as Screen, label: "Beranda",          desc: "Ringkasan kehamilan & perkembangan si kecil", Icon: Home,          keywords: "dashboard minggu janin bayi" },
    { id: "health"     as Screen, label: "Kesehatan",        desc: "Catat tekanan darah, berat badan & gejala",   Icon: Activity,      keywords: "vital tekanan darah gejala risiko" },
    { id: "calendar"   as Screen, label: "Kalender",         desc: "Jadwal kontrol & pengingat",                  Icon: Calendar,      keywords: "jadwal kontrol pengingat janji" },
    { id: "reports"    as Screen, label: "Laporan",          desc: "Laporan medis & ekspor PDF",                  Icon: FileText,      keywords: "laporan medis pdf ekspor dokter" },
    { id: "resources"  as Screen, label: "Persiapan",        desc: "Persiapan persalinan & bantuan",              Icon: Package,       keywords: "persalinan tas checklist bantuan" },
    { id: "emergency"  as Screen, label: "Mode Darurat",     desc: "Kirim sinyal darurat ke pendamping",          Icon: AlertTriangle, keywords: "darurat sos bahaya" },
    { id: "postpartum" as Screen, label: "Pasca-Melahirkan", desc: "Pemulihan setelah melahirkan",                Icon: Baby,          keywords: "nifas pemulihan postpartum" },
  ];

  const q = searchQuery.trim().toLowerCase();
  const filteredFeatures = searchFeatures.filter(f =>
    !q || `${f.label} ${f.desc} ${f.keywords}`.toLowerCase().includes(q)
  );

  return (
    <div className="flex min-h-screen w-full transition-colors duration-300"
      style={{ fontFamily: "'Manrope', sans-serif", background: t.bg }}
    >
      {/* Sidebar */}
      <aside className="group/sidebar flex flex-col flex-shrink-0 sticky top-0 h-screen transition-[width,background-color] duration-300 overflow-hidden"
        style={{ width: collapsed ? 76 : 240, background: "#ffffff", borderRight: `1px solid ${t.border}` }}
      >
        {/* Logo + collapse toggle: tombol perkecil muncul saat sidebar di-hover; saat kecil, logo jadi pemicu perbesar */}
        {collapsed ? (
          <div className="pt-7 pb-5 flex-shrink-0 flex justify-center">
            <button onClick={() => setCollapsed(false)}
              title="Perbesar sidebar" aria-label="Perbesar sidebar"
              className="group/logo relative w-10 h-10 rounded-xl flex items-center justify-center"
            >
              <img src={logoIcon} alt="" className="w-10 h-10 transition-opacity duration-200 group-hover/logo:opacity-0 group-focus-visible/logo:opacity-0" />
              <span className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/logo:opacity-100 group-focus-visible/logo:opacity-100"
                style={{ background: t.soft }}>
                <PanelLeftOpen size={18} color={t.active} />
              </span>
            </button>
          </div>
        ) : (
          <div className="px-6 pt-7 pb-5 flex-shrink-0 flex items-center gap-3">
            <img src={logoIcon} alt="" className="w-10 h-10 flex-shrink-0" />
            <p className="text-base font-extrabold leading-none whitespace-nowrap" style={{ color: t.dark }}>{APP_NAME}</p>
            <button onClick={() => setCollapsed(true)}
              title="Perkecil sidebar" aria-label="Perkecil sidebar"
              className="ui-interactive ml-auto -mr-2 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:bg-black/5 opacity-0 group-hover/sidebar:opacity-100 focus-visible:opacity-100"
            >
              <PanelLeftClose size={16} color="#bbb" />
            </button>
          </div>
        )}

        {/* Penanda peran akun (bukan tombol): peran ditetapkan saat daftar */}
        <div className={`mb-5 flex-shrink-0 ${collapsed ? "px-0 flex justify-center" : "px-4"}`}>
          {collapsed ? (
            <span title={mode === "mother" ? "Akun Ibu" : "Akun Suami"}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: t.soft }}
            >
              {mode === "mother" ? <Heart size={16} color={t.active} /> : <Users size={16} color={t.active} />}
            </span>
          ) : (
            <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: t.soft }}>
              {mode === "mother" ? <Heart size={14} color={t.active} /> : <Users size={14} color={t.active} />}
              <span className="text-[12px] font-bold" style={{ color: t.active }}>{mode === "mother" ? "Akun Ibu" : "Akun Suami"}</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {navItems.map(({ id, label, Icon }) => {
            const active = screen === id;
            return (
              <button key={id} onClick={() => navigate("/" + id)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 py-3 rounded-xl text-left transition-colors hover:bg-black/5 ${collapsed ? "justify-center px-0" : "px-4"}`}
                style={{
                  background: active ? t.soft : "transparent",
                  color: active ? t.active : "#999",
                }}
              >
                <Icon size={collapsed ? 18 : 16} strokeWidth={active ? 2.5 : 1.8} color={active ? t.active : "#bbb"} />
                {!collapsed && <span className="text-[13px] font-semibold whitespace-nowrap">{label}</span>}
                {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: t.active }} />}
              </button>
            );
          })}
          <div className="pt-2 space-y-1">
            <button onClick={() => navigate("/emergency")}
              title={collapsed ? "Mode Darurat" : undefined}
              className={`w-full flex items-center gap-3 py-3 rounded-xl text-left transition-colors hover:bg-black/5 ${collapsed ? "justify-center px-0" : "px-4"}`}
              style={{ background: screen === "emergency" ? "#fff0f0" : "transparent", color: "#ef4444" }}
            >
              <PhoneCall size={collapsed ? 18 : 16} strokeWidth={1.8} color="#ef4444" />
              {!collapsed && <span className="text-[13px] font-semibold whitespace-nowrap">Mode Darurat</span>}
            </button>
          </div>
        </nav>

        {/* Pivot Mode — versi ringkas saat sidebar diperkecil */}
        {mode === "mother" && !isPostpartum && collapsed && (
          <div className="pb-4 flex-shrink-0 flex justify-center">
            <button onClick={() => navigate("/postpartum")}
              title="Bayi Telah Lahir? Si Kecil Sudah Hadir — catat waktu lahir si kecil"
              className="ui-interactive w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: t.soft, border: `1.5px solid ${t.border}` }}
            >
              <Baby size={18} color={t.active} />
            </button>
          </div>
        )}

        {/* Pivot Mode Card */}
        {mode === "mother" && !isPostpartum && !collapsed && (
          <div className="px-4 pb-4 flex-shrink-0">
            <div onClick={() => navigate("/postpartum")}
              className="rounded-2xl p-3 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden"
              style={{ background: t.soft, border: `1.5px solid ${t.border}` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Baby size={18} color={t.active} />
                </div>
                <div>
                  <p className="text-[12px] font-extrabold leading-tight" style={{ color: t.dark }}>Bayi Telah Lahir?</p>
                  <p className="text-[10px]" style={{ color: t.muted }}>Catat waktu lahir si kecil</p>
                </div>
              </div>
              <button className="ui-interactive w-full py-1.5 rounded-xl text-[11px] font-bold text-white"
                style={{ background: t.grad }}>
                Si Kecil Sudah Hadir
              </button>
            </div>
          </div>
        )}

      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 flex-shrink-0 transition-colors duration-300"
          style={{ background: t.bg + "e8", backdropFilter: "blur(12px)", borderBottom: `1px solid ${t.border}` }}
        >
          <div>
            {/* Di Beranda, bar atas menampilkan nama web; minggu kehamilan sudah tampil di kartu hero */}
            <h1 className="text-xl font-extrabold leading-none" style={{ color: t.dark }}>
              {screen === "dashboard" ? APP_NAME : screenLabel[screen as Screen]}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: t.muted }}>
              {fmtDate(today)}{screen !== "dashboard" && (isPostpartum ? ` · Bayi usia ${babyAgeLabel}` : ` · Kehamilan minggu ${weeksPreg}+${daysExtra}`)}
            </p>
          </div>
          <div className="flex items-center gap-3 relative">

            {/* Indikator timer yang sedang berjalan — tetap tampil di halaman mana pun, klik untuk kembali ke Kesehatan */}
            {trackers.contraction.active && (
              <button onClick={() => navigate("/health")} title="Kontraksi sedang dicatat — buka halaman Kesehatan"
                className="ui-interactive flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <Timer size={13} /> Kontraksi {fmtDuration(trackers.contraction.elapsedSecs)}
              </button>
            )}
            {trackers.kick.active && (
              <button onClick={() => navigate("/health")} title="Sesi kick counter berjalan — buka halaman Kesehatan"
                className="ui-interactive flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
                style={{ background: t.soft, color: t.active, border: `1.5px solid ${t.border}` }}>
                <Footprints size={13} /> Kick {trackers.kick.count}/{KICK_TARGET} · {fmtDuration(trackers.kick.elapsedSecs)}
              </button>
            )}

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
              {showSearch && (
                <div className="absolute top-full mt-2 right-0 w-72 rounded-2xl overflow-hidden z-50 shadow-xl" style={{ background: "#fff", border: `1px solid ${t.border}` }}>
                  {!q && (
                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: t.muted }}>
                      Fitur yang tersedia
                    </p>
                  )}
                  {filteredFeatures.length > 0 ? (
                    filteredFeatures.map(item => (
                      <button 
                        key={item.id}
                        onMouseDown={() => {
                          navigate("/" + item.id);
                          setSearchQuery("");
                          setShowSearch(false);
                        }}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: t.soft }}>
                          <item.Icon size={14} color={t.active} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-tight" style={{ color: t.dark }}>{item.label}</p>
                          <p className="text-[11px] truncate" style={{ color: t.muted }}>{item.desc}</p>
                        </div>
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
                className="ui-interactive w-9 h-9 rounded-full flex items-center justify-center focus:outline-none shadow-sm"
                style={{ 
                  background: showNotif ? t.soft : t.card,
                  border: `1.5px solid ${t.border}`,
                  boxShadow: showNotif ? `0 0 0 3px ${t.shadow}` : "none"
                }}
              >
                <Bell size={16} color={showNotif ? t.active : t.muted} />
                {unreadCount > 0 && (
                  <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white ${notifications.some(n => n.kind === "emergency" && !n.read_at) ? "bg-red-500 animate-pulse" : ""}`}
                    style={notifications.some(n => n.kind === "emergency" && !n.read_at) ? undefined : { background: t.active }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notif Popover */}
              {showNotif && (
                <div className="absolute top-full mt-3 right-0 w-80 rounded-2xl shadow-xl z-50 overflow-hidden" style={{ background: "#fff", border: `1px solid ${t.border}` }}>
                  <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: t.dark }}>Notifikasi</p>
                    {unreadCount > 0 && (
                      <button onMouseDown={markAllRead} className="text-[11px] font-bold" style={{ color: t.active }}>
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  {notifPermission === "default" && (
                    <button onMouseDown={() => void requestPermission()}
                      className="mx-4 mb-2 w-[calc(100%-2rem)] rounded-xl px-3 py-2 text-left text-[11px] font-semibold flex items-center gap-2"
                      style={{ background: t.soft, color: t.active }}>
                      <Bell size={12} /> Aktifkan notifikasi browser agar tidak ketinggalan pengingat
                    </button>
                  )}

                  {notifications.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto pb-2">
                      {notifications.map(item => {
                        const meta = NOTIF_META[item.kind];
                        return (
                          <button key={item.id}
                            onMouseDown={() => {
                              markRead(item.id);
                              if (item.link) navigate(item.link);
                              setShowNotif(false);
                            }}
                            className="w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                            style={{ background: item.read_at ? undefined : item.kind === "emergency" ? "#fef2f2" : t.soft }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                              <meta.Icon size={14} color={meta.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold leading-snug" style={{ color: item.kind === "emergency" ? "#b91c1c" : t.dark }}>{item.title}</p>
                              {item.body && <p className="text-[11px] leading-snug mt-0.5" style={{ color: t.muted }}>{item.body}</p>}
                              <p className="text-[10px] mt-1" style={{ color: t.muted }}>{timeAgo(item.created_at)}</p>
                            </div>
                            {!item.read_at && <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.kind === "emergency" ? "#ef4444" : t.active }} />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Bell size={24} color={t.muted} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs" style={{ color: t.muted }}>Belum ada notifikasi.</p>
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
                className="ui-interactive w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm focus:outline-none"
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
                        void auth.signOut();
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
        <div key={location.pathname} className="page-content flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: "none" }}>
          <AppRoutes
            t={t}
            mode={mode}
            weeksPreg={weeksPreg}
            daysExtra={daysExtra}
            daysUntilDue={daysUntilDue}
            dueDate={dueDate}
            fruit={fruit}
            trimester={trimester}
            motherName={userProfile.motherName}
            fatherName={userProfile.fatherName}
            motherPhone={userProfile.motherPhone ?? ""}
            fatherPhone={userProfile.fatherPhone ?? ""}
            hospital={userProfile.hospital}
            doctor={userProfile.doctor}
            alert={alert}
            onAck={ackAlert}
            onResolveAlert={resolveAlert}
            onEmergency={() => navigate("/emergency")}
            onGoHealth={() => navigate("/health")}
            onGoCalendar={() => navigate("/calendar")}
            onBack={() => navigate("/dashboard")}
            onSendAlert={sendAlert}
            vitalLogs={vitalLogs}
            onAddVital={addVital}
            vitDone={vitDone}
            setVitDone={setVitDone}
            vitamins={vitamins}
            setVitamins={setVitamins}
            onSaveVitamins={saveVitamins}
            onToggleVitamin={toggleVitamin}
            symptoms={symptoms}
            setSymptoms={setSymptoms}
            onToggleSymptom={toggleSymptom}
            customSymptoms={customSymptoms}
            setCustomSymptoms={setCustomSymptoms}
            trackers={trackers}
            birthAt={birthAt}
            postpartumAdmin={postpartumAdmin}
            onConfirmBirth={confirmBirth}
            onCancelBirth={cancelBirth}
            onTogglePostpartumAdmin={togglePostpartumAdmin}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        t={t}
        profile={userProfile}
        mode={mode}
        companionConnected={companionConnected}
        onUnpair={unpairPregnancy}
        onCodeGenerated={(pregnancy) => setUserProfile(previous => ({
          ...previous,
          syncCode: pregnancy.sync_code,
          syncCodeExpiresAt: pregnancy.sync_code_expires_at,
        }))}
        onSave={(updated) => {
          setUserProfile(updated);
          void Promise.all([
            api.updateMe({ full_name: mode === "mother" ? updated.motherName : updated.fatherName, phone: updated.phone }),
            api.updatePreferences({
              notif_vitamin: updated.notifVitamin,
              notif_anc: updated.notifAnc,
              notif_emergency_sound: updated.notifEmergencySound,
              notif_weekly_report: updated.notifWeeklyReport,
            }),
            mode === "mother"
              ? api.updateCurrentPregnancy({ hpht_date: updated.hphtDate, blood_type: updated.bloodType, hospital: updated.hospital, doctor: updated.doctor })
              : Promise.resolve(null),
          ]).catch(error => console.error("Failed to save account data", error));
        }}
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

// ─── Resources Screen ─────────────────────────────────────────────────────────



// ─── Emergency Screen ─────────────────────────────────────────────────────────



// ─── Companion Emergency Panel ────────────────────────────────────────────────



// ─── Postpartum Screen ────────────────────────────────────────────────────────
