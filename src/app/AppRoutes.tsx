import { Routes, Route } from "react-router";
import type { Dispatch, SetStateAction } from "react";
import type { Theme, Mode, EmergencyAlert, VitalLog, Vitamin, CustomSymptom, Risk } from "../types";
import type { Fruit } from "../utils/helpers";
import { MotherDashboard, CompanionDashboard } from "../pages/Dashboard";
import { HealthScreen } from "../pages/HealthScreen";
import { CalendarScreen } from "../pages/CalendarScreen";
import { ReportsScreen } from "../pages/ReportsScreen";
import { ResourcesScreen } from "../pages/ResourcesScreen";
import { EmergencyScreen } from "../pages/EmergencyScreen";
import { PostpartumScreen } from "../pages/PostpartumScreen";

type AppRoutesProps = {
  t: Theme;
  mode: Mode;
  weeksPreg: number;
  daysExtra: number;
  daysUntilDue: number;
  dueDate: Date;
  fruit: Fruit;
  trimester: number;
  motherName: string;
  alert: EmergencyAlert | null;
  onAck: () => void;
  onSetEta: (minutes: number) => void;
  onEmergency: () => void;
  onGoHealth: () => void;
  onBack: () => void;
  onSendAlert: (alert: EmergencyAlert) => void;
  vitalLogs: VitalLog[];
  onAddVital: (vital: VitalLog) => void;
  vitDone: Record<string, boolean>;
  setVitDone: Dispatch<SetStateAction<Record<string, boolean>>>;
  vitamins: Vitamin[];
  setVitamins: Dispatch<SetStateAction<Vitamin[]>>;
  onSaveVitamins: (vitamins: Vitamin[]) => void;
  onToggleVitamin: (id: string, completed: boolean) => void;
  symptoms: Record<string, boolean>;
  setSymptoms: Dispatch<SetStateAction<Record<string, boolean>>>;
  onToggleSymptom: (id: string, active: boolean, label: string, risk: Risk) => void;
  customSymptoms: CustomSymptom[];
  setCustomSymptoms: Dispatch<SetStateAction<CustomSymptom[]>>;
};

export function AppRoutes(props: AppRoutesProps) {
  const dashboard = props.mode === "mother"
    ? <MotherDashboard t={props.t} weeksPreg={props.weeksPreg} daysExtra={props.daysExtra} daysUntilDue={props.daysUntilDue} dueDate={props.dueDate} fruit={props.fruit} trimester={props.trimester} onEmergency={props.onEmergency} onGoHealth={props.onGoHealth} vitDone={props.vitDone} vitamins={props.vitamins} symptoms={props.symptoms} motherName={props.motherName} />
    : <CompanionDashboard t={props.t} weeksPreg={props.weeksPreg} daysExtra={props.daysExtra} alert={props.alert} onAck={props.onAck} onSetEta={props.onSetEta} motherName={props.motherName} />;

  return (
    <Routes>
      <Route path="/" element={dashboard} />
      <Route path="/dashboard" element={dashboard} />
      <Route path="/health" element={<HealthScreen t={props.t} onEmergency={props.onEmergency} vitalLogs={props.vitalLogs} onAddVital={props.onAddVital} vitDone={props.vitDone} setVitDone={props.setVitDone} onToggleVitamin={props.onToggleVitamin} vitamins={props.vitamins} setVitamins={props.setVitamins} onSaveVitamins={props.onSaveVitamins} symptoms={props.symptoms} setSymptoms={props.setSymptoms} onToggleSymptom={props.onToggleSymptom} customSymptoms={props.customSymptoms} setCustomSymptoms={props.setCustomSymptoms} />} />
      <Route path="/calendar" element={<CalendarScreen t={props.t} dueDate={props.dueDate} weeksPreg={props.weeksPreg} daysUntilDue={props.daysUntilDue} trimester={props.trimester} />} />
      <Route path="/reports" element={<ReportsScreen t={props.t} vitalLogs={props.vitalLogs} onAddVital={props.onAddVital} weeksPreg={props.weeksPreg} dueDate={props.dueDate} />} />
      <Route path="/resources" element={<ResourcesScreen t={props.t} />} />
      <Route path="/emergency" element={<EmergencyScreen t={props.t} mode={props.mode} alert={props.alert} onSendAlert={props.onSendAlert} onBack={props.onBack} />} />
      <Route path="/postpartum" element={<PostpartumScreen t={props.t} onBack={props.onBack} />} />
    </Routes>
  );
}
