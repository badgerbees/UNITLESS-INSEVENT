import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({
  configFile: false,
  appType: "custom",
  esbuild: { jsx: "automatic" },
  server: { middlewareMode: true, watch: null, hmr: false },
  optimizeDeps: { noDiscovery: true },
});
after(() => server.close());

const { AppHeader } = await server.ssrLoadModule("/src/app/AppHeader.tsx");
const { SettingsModal } = await server.ssrLoadModule("/src/app/SettingsModal.tsx");
const { PregnancySetupScreen } = await server.ssrLoadModule("/src/pages/PregnancySetupScreen.tsx");
const { getScreenLabels, getNavigationItems } = await server.ssrLoadModule("/src/app/appNavigation.ts");
const { THEMES } = await server.ssrLoadModule("/src/constants/theme.ts");
const profile = {
  motherName: "Bunda Test", fatherName: "Ayah Test", email: "bunda@example.com", phone: "",
  hphtDate: "2026-01-01", bloodType: "A+", hospital: "", doctor: "",
  syncCode: "ABC123", syncCodeExpiresAt: "", notifVitamin: true, notifAnc: true,
  notifEmergencySound: true, notifWeeklyReport: true,
};
const noop = () => {};
const headerProps = {
  t: THEMES.mother, mode: "mother", screen: "health", screenLabel: getScreenLabels("mother"),
  today: new Date(2026, 9, 25), weeksPreg: 20, daysExtra: 3, isPostpartum: false, babyAgeLabel: "2 hari",
  trackers: { contraction: { active: false }, kick: { active: false } },
  userProfile: profile, notifications: [], unreadCount: 0, notifPermission: "unsupported",
  requestPermission: noop, markRead: noop, markAllRead: noop, onNavigate: noop,
  onOpenSettings: noop, onOpenCustomerService: noop, onSignOut: noop,
};

test("header preserves pregnancy week and day subtitle after extraction", () => {
  const html = renderToStaticMarkup(createElement(AppHeader, headerProps));
  assert.match(html, /Pemantauan Kesehatan/);
  assert.match(html, /Kehamilan minggu 20\+3/);
});

test("postpartum header replaces pregnancy age with baby age", () => {
  const html = renderToStaticMarkup(createElement(AppHeader, { ...headerProps, isPostpartum: true }));
  assert.match(html, /Bayi usia 2 hari/);
  assert.doesNotMatch(html, /Kehamilan minggu/);
});

test("header preserves active contraction and kick indicators", () => {
  const html = renderToStaticMarkup(createElement(AppHeader, {
    ...headerProps,
    trackers: { contraction: { active: true, elapsedSecs: 65 }, kick: { active: true, count: 3, elapsedSecs: 120 } },
  }));
  assert.match(html, /Kontraksi 1:05/);
  assert.match(html, /Kick 3\/10/);
});

test("settings displays the paired companion name supplied by account data", () => {
  const props = {
    isOpen: true, onClose: noop, t: THEMES.mother, profile, mode: "mother",
    companionConnected: true, onUnpair: noop, onCodeGenerated: noop, onSave: noop,
  };
  const html = renderToStaticMarkup(createElement(SettingsModal, props));
  assert.match(html, /value="Ayah Test"/);
  assert.equal(renderToStaticMarkup(createElement(SettingsModal, { ...props, isOpen: false })), "");
});

test("postpartum navigation changes preparation entry and preserves other pages", () => {
  assert.deepEqual(getNavigationItems(false).map(item => item.id), ["dashboard", "health", "calendar", "reports", "resources"]);
  assert.deepEqual(getNavigationItems(true).map(item => item.id), ["dashboard", "health", "calendar", "reports", "postpartum"]);
});

test("companion onboarding only asks for the mother's pairing code", () => {
  const html = renderToStaticMarkup(createElement(PregnancySetupScreen, {
    t: THEMES.companion, mode: "companion", onCreated: noop,
  }));
  assert.match(html, /Hubungkan ke akun Ibu/);
  assert.match(html, /Kode sinkronisasi pasangan/);
  assert.match(html, /Gabung dengan pasangan/);
  assert.doesNotMatch(html, /Tanggal HPHT|Golongan darah|Rumah sakit \/ klinik/);
});

test("mother onboarding retains pregnancy form and offers companion connection", () => {
  const html = renderToStaticMarkup(createElement(PregnancySetupScreen, {
    t: THEMES.mother, mode: "mother", onCreated: noop,
  }));
  assert.match(html, /Tanggal HPHT/);
  assert.match(html, /Mulai menggunakan aplikasi/);
  assert.match(html, /Saya Suami \/ Pendamping — Hubungkan ke akun Ibu/);
});
