import { useEffect, useState } from "react";
import { api, friendlyError } from "../services/api";
import { useToday } from "./useToday";

export async function loadDashboardData(today: string) {
  const [vitals, vitamins, vitaminLogs, symptoms, events, checklist, kickSessions] = await Promise.all([
    api.getVitals(), api.getVitamins(), api.getVitaminLogs(today), api.getSymptoms(today),
    api.getCalendarEvents(), api.getChecklist(), api.getKickSessions(),
  ]);
  return { vitals, vitamins, vitaminLogs, symptoms, events, checklist, kickSessions };
}

export type DashboardData = Awaited<ReturnType<typeof loadDashboardData>>;

export function useDashboardData() {
  const today = useToday();
  const [state, setState] = useState<{ data: DashboardData | null; error: string | null }>({ data: null, error: null });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    let pending = false;
    async function load() {
      if (pending || document.visibilityState === "hidden") return;
      pending = true;
      try {
        const data = await loadDashboardData(today);
        if (active) setState({ data, error: null });
      } catch (error) {
        if (active) setState({ data: null, error: friendlyError(error) });
      } finally {
        pending = false;
      }
    }
    void load();
    const timer = setInterval(() => void load(), 30_000);
    const refresh = () => void load();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [today, reload]);

  return { ...state, today, retry: () => setReload(value => value + 1) };
}
