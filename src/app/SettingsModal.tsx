import { useEffect, useState } from "react";
import { Bell, Baby, CheckCheck, Copy, Lock, Settings, Smartphone, User, X } from "lucide-react";
import type { Mode, Theme, UserProfile } from "../types";
import { api, type Pregnancy } from "../services/api";

export function SettingsModal({
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
  onCodeGenerated: (pregnancy: Pregnancy) => void;
  onSave: (newProfile: UserProfile) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<"profile" | "pregnancy" | "sync" | "notif" | "security">("profile");
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [syncBusy, setSyncBusy] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  useEffect(() => {
    if (isOpen) setFormData({ ...profile });
  }, [isOpen, profile]);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(formData.syncCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaveError("");
    try {
      await onSave(formData);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Pengaturan gagal disimpan.");
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setPasswordMsg("Harap isi semua kolom kata sandi.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    try {
      await api.updatePassword(oldPassword, newPassword);
      setPasswordMsg("Kata sandi berhasil diperbarui!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordMsg(error instanceof Error ? error.message : "Kata sandi gagal diperbarui.");
    }
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

  if (!isOpen) return null;

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
                    onClick={() => void handleChangePassword()}
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
          ) : saveError ? (
            <span className="text-xs font-bold text-red-500">{saveError}</span>
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
              onClick={() => void handleSave()}
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
