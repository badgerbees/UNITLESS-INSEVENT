import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({
  configFile: false, appType: "custom", esbuild: { jsx: "automatic" },
  server: { middlewareMode: true, watch: null, hmr: false }, optimizeDeps: { noDiscovery: true },
});
after(() => server.close());
const { summarizeDashboard } = await server.ssrLoadModule("/src/utils/dashboardSummary.ts");
const { loadDashboardData } = await server.ssrLoadModule("/src/hooks/useDashboardData.ts");
const { api } = await server.ssrLoadModule("/src/services/api.ts");
const { DashboardHealthCard } = await server.ssrLoadModule("/src/components/DashboardHealthCard.tsx");
const { CompanionDashboard } = await server.ssrLoadModule("/src/pages/CompanionDashboard.tsx");
const { THEMES } = await server.ssrLoadModule("/src/constants/theme.ts");
const originalApi = { ...api };
afterEach(() => Object.assign(api, originalApi));
const today = "2026-11-02";
const empty = () => ({ vitals: [], vitamins: [], vitaminLogs: [], symptoms: [], events: [], checklist: [], kickSessions: [] });
const vital = (values = {}) => ({ id: "v1", recorded_at: "2026-11-02T10:00:00", pregnancy_week: 20, blood_pressure: "121/79", weight: 61, fundal_height: null, fetal_movement: null, hemoglobin: null, urine_protein: "Negatif", notes: null, ...values });

test("empty records never imply normal health, completed vitamins or fetal movements", () => {
  const summary = summarizeDashboard(empty(), today);
  assert.equal(summary.healthLabel, "Belum ada data kesehatan");
  assert.equal(summary.vitaminText, "Belum ada vitamin");
  assert.equal(summary.movementText, "Belum dicatat");
  assert.equal(summary.nextAnc, null);
  assert.equal(summary.checklistPercent, null);
  assert.equal(summary.weightChange, null);
});

test("vitamin progress counts only today's logs for active prescribed vitamins", () => {
  const data = empty();
  data.vitamins = [{ id: "a", active: true }, { id: "b", active: true }, { id: "inactive", active: false }];
  data.vitaminLogs = [
    { vitamin_id: "a", completed_on: today }, { vitamin_id: "a", completed_on: today },
    { vitamin_id: "b", completed_on: "2026-11-01" }, { vitamin_id: "inactive", completed_on: today },
  ];
  assert.equal(summarizeDashboard(data, today).vitaminText, "1/2 diminum");
});

test("shared schedule uses real upcoming events and finds ANC separately", () => {
  const data = empty();
  data.events = [
    { id: "done", event_date: today, completed: true, event_type: "anc", label: "Done" },
    { id: "past", event_date: "2026-10-01", completed: false, event_type: "anc", label: "Past" },
    { id: "anc", event_date: "2026-11-05", completed: false, event_type: "anc", label: "Kontrol Ibu" },
    { id: "other", event_date: today, completed: false, event_type: "other", label: "USG bersama" },
  ];
  const summary = summarizeDashboard(data, today);
  assert.deepEqual(summary.upcoming.map(event => event.id), ["other", "anc"]);
  assert.equal(summary.nextAnc.label, "Kontrol Ibu");
  assert.equal(summary.nextEvent.label, "USG bersama");
});

test("latest vital measurements and weight change derive from records without mutating them", () => {
  const data = empty();
  data.vitals = [vital({ id: "new", weight: 63.5 }), vital({ id: "old", recorded_at: "2026-10-02T10:00:00", weight: 60 })];
  const summary = summarizeDashboard(data, today);
  assert.equal(summary.latest.id, "new");
  assert.equal(summary.weightChange, 3.5);
  assert.deepEqual(data.vitals.map(row => row.id), ["new", "old"]);
  assert.equal(summarizeDashboard({ ...data, vitals: [vital()] }, today).weightChange, null);
});

test("movement uses today's latest saved kick session, then an actual vital entry", () => {
  const data = empty();
  data.vitals = [vital({ fetal_movement: "11" })];
  assert.equal(summarizeDashboard(data, today).movementText, "11");
  data.kickSessions = [
    { ended_at: "2026-11-01T12:00:00", kick_count: 99 },
    { ended_at: "2026-11-02T09:00:00", kick_count: 7 },
    { ended_at: "2026-11-02T10:00:00", kick_count: 12 },
    { ended_at: null, kick_count: 88 },
  ];
  assert.equal(summarizeDashboard(data, today).movementText, "12 gerakan");
});

test("checklist progress reflects stored completion flags", () => {
  const data = empty();
  data.checklist = [{ items: [{ completed: true }, { completed: false }] }, { items: [{ completed: false }, { completed: false }] }];
  const summary = summarizeDashboard(data, today);
  assert.equal(summary.completedItems, 1);
  assert.equal(summary.totalItems, 4);
  assert.equal(summary.checklistPercent, 25);
});

test("symptom status uses only active symptoms recorded today", () => {
  const data = empty();
  data.symptoms = [
    { recorded_on: "2026-11-01", is_active: true, risk_level: "red" },
    { recorded_on: today, is_active: false, risk_level: "red" },
  ];
  assert.equal(summarizeDashboard(data, today).healthLabel, "Tidak ada gejala aktif tercatat");
  data.symptoms.push({ recorded_on: today, is_active: true, risk_level: "yellow", label: "Pusing" });
  assert.equal(summarizeDashboard(data, today).healthLabel, "Ada gejala tercatat");
  assert.equal(summarizeDashboard(data, today).activeSymptoms[0].label, "Pusing");
});

test("dashboard fetches every dataset through pregnancy-scoped APIs and refreshes values", async () => {
  const calls = [];
  for (const name of ["getVitals", "getVitamins", "getVitaminLogs", "getSymptoms", "getCalendarEvents", "getChecklist", "getKickSessions"]) {
    api[name] = async (...args) => { calls.push([name, ...args]); return []; };
  }
  assert.deepEqual(await loadDashboardData(today), empty());
  assert(calls.some(call => call[0] === "getVitaminLogs" && call[1] === today));
  assert(calls.some(call => call[0] === "getSymptoms" && call[1] === today));
  assert.equal(calls.length, 7);
  api.getVitals = async () => [vital({ weight: 67 })];
  assert.equal(summarizeDashboard(await loadDashboardData(today), today).latest.weight, 67);
});

test("failed API requests propagate errors instead of fabricating successful data", async () => {
  for (const name of ["getVitals", "getVitamins", "getVitaminLogs", "getSymptoms", "getCalendarEvents", "getChecklist", "getKickSessions"]) api[name] = async () => [];
  api.getChecklist = async () => { throw new Error("Checklist unavailable"); };
  await assert.rejects(loadDashboardData(today), /Checklist unavailable/);
});

test("health card renders real vital values and honest missing-data labels", () => {
  const data = empty();
  const emptyHtml = renderToStaticMarkup(createElement(DashboardHealthCard, { t: THEMES.mother, data, today, onGoHealth() {} }));
  assert.match(emptyHtml, /Belum ada data kesehatan/);
  assert.doesNotMatch(emptyHtml, /118\/76|11\.2 kg|8 \/ 10|Tidak ada tanda bahaya/);
  data.vitals = [vital({ blood_pressure: "123/81", weight: 64.2 })];
  const html = renderToStaticMarkup(createElement(DashboardHealthCard, { t: THEMES.mother, data, today, onGoHealth() {} }));
  assert.match(html, /123\/81 mmHg/);
  assert.match(html, /64\.2 kg/);
});

test("companion dashboard shows loading and actual emergency location without simulated GPS", () => {
  const html = renderToStaticMarkup(createElement(CompanionDashboard, {
    t: THEMES.companion, weeksPreg: 20, daysExtra: 3, motherName: "Ibu Test", motherPhone: "",
    alert: { id: "alert-1", sentAt: new Date("2026-11-02T10:00:00"), lat: -6.2, lng: 106.8, location: "Lokasi dari Ibu", message: "Perlu bantuan", husbandAck: true, husbandEta: 7 },
    onAck() {}, onGoCalendar() {}, onGoHealth() {}, onEmergency() {},
  }));
  assert.match(html, /Ibu Test/);
  assert.match(html, /Memuat/);
  assert.match(html, /destination=-6.2,106.8/);
  assert.match(html, /~7 menit/);
  assert.doesNotMatch(html, /8\/10|23 Jan|ANC Trimester 3|GPS Ping|2\.3 km|Ping #/);
});
