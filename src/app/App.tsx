import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import type { Mode } from "../types";
import { THEMES } from "../constants/theme";
import { LoginScreen } from "../pages/LoginScreen";
import { addDays, getFruit } from "../utils/helpers";
import { auth, type AuthForm } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { useTrackers } from "../hooks/useTrackers";
import { api } from "../services/api";
import { useAppData } from "./useAppData";
import { AppRoutes } from "./AppRoutes";
import { PregnancySetupScreen } from "../pages/PregnancySetupScreen";
import { CustomerServiceModal } from "./CustomerServiceModal";
import { getNavigationItems, getScreenLabels } from "./appNavigation";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

import { SettingsModal } from "./SettingsModal";

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
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomerService, setShowCustomerService] = useState(false);
  const {
    role, hasPregnancy, companionConnected, loadError, retryLoad, alert, sendAlert, ackAlert, resolveAlert, vitalLogs, vitDone, setVitDone, symptoms, setSymptoms,
    vitamins, setVitamins, customSymptoms, setCustomSymptoms, userProfile, setUserProfile,
    addVital, toggleVitamin, toggleSymptom, saveVitamins,
    unpairPregnancy,
    birthAt, postpartumAdmin, confirmBirth, cancelBirth, togglePostpartumAdmin,
  } = useAppData(user);
  useEffect(() => {
    if (showSettings) retryLoad();
  }, [showSettings]);
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

  const screenLabel = getScreenLabels(mode);
  const navItems = getNavigationItems(isPostpartum);

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

  return (
    <div className="flex min-h-screen w-full transition-colors duration-300"
      style={{ fontFamily: "'Manrope', sans-serif", background: t.bg }}
    >
      <AppSidebar
        t={t}
        mode={mode}
        screen={screen}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        navItems={navItems}
        isPostpartum={isPostpartum}
        onNavigate={path => navigate(path)}
      />

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <AppHeader
          t={t}
          mode={mode}
          screen={screen}
          screenLabel={screenLabel}
          today={today}
          weeksPreg={weeksPreg}
          daysExtra={daysExtra}
          isPostpartum={isPostpartum}
          babyAgeLabel={babyAgeLabel}
          trackers={trackers}
          userProfile={userProfile}
          notifications={notifications}
          unreadCount={unreadCount}
          notifPermission={notifPermission}
          requestPermission={requestPermission}
          markRead={markRead}
          markAllRead={markAllRead}
          onNavigate={path => navigate(path)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenCustomerService={() => setShowCustomerService(true)}
          onSignOut={() => void auth.signOut()}
        />

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
        onSave={async (updated) => {
          await Promise.all([
            api.updateMe({ full_name: mode === "mother" ? updated.motherName : updated.fatherName, phone: updated.phone }),
            updated.email !== userProfile.email ? api.updateEmail(updated.email) : Promise.resolve(null),
            api.updatePreferences({
              notif_vitamin: updated.notifVitamin,
              notif_anc: updated.notifAnc,
              notif_emergency_sound: updated.notifEmergencySound,
              notif_weekly_report: updated.notifWeeklyReport,
            }),
            mode === "mother"
              ? api.updateCurrentPregnancy({ hpht_date: updated.hphtDate, blood_type: updated.bloodType, hospital: updated.hospital, doctor: updated.doctor })
              : Promise.resolve(null),
          ]);
          setUserProfile(updated);
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
