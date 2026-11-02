import { Baby, Heart, PanelLeftClose, PanelLeftOpen, PhoneCall, Users } from "lucide-react";
import type { Mode, Theme } from "../types";
import type { NavigationItem } from "./appNavigation";
import { APP_NAME } from "../constants/brand";
import logoIcon from "../assets/temanbunda-app-icon.svg";

type AppSidebarProps = {
  t: Theme;
  mode: Mode;
  screen: string;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  navItems: NavigationItem[];
  isPostpartum: boolean;
  onNavigate: (path: string) => void;
};

export function AppSidebar({ t, mode, screen, collapsed, onCollapsedChange, navItems, isPostpartum, onNavigate }: AppSidebarProps) {
  return (
    <aside className="group/sidebar flex flex-col flex-shrink-0 sticky top-0 h-screen transition-[width,background-color] duration-300 overflow-hidden" style={{ width: collapsed ? 76 : 240, background: "#ffffff", borderRight: `1px solid ${t.border}` }}>
      {collapsed ? (
        <div className="pt-7 pb-5 flex-shrink-0 flex justify-center">
          <button onClick={() => onCollapsedChange(false)} title="Perbesar sidebar" aria-label="Perbesar sidebar" className="group/logo relative w-10 h-10 rounded-xl flex items-center justify-center">
            <img src={logoIcon} alt="" className="w-10 h-10 transition-opacity duration-200 group-hover/logo:opacity-0 group-focus-visible/logo:opacity-0" />
            <span className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/logo:opacity-100 group-focus-visible/logo:opacity-100" style={{ background: t.soft }}><PanelLeftOpen size={18} color={t.active} /></span>
          </button>
        </div>
      ) : (
        <div className="px-6 pt-7 pb-5 flex-shrink-0 flex items-center gap-3">
          <img src={logoIcon} alt="" className="w-10 h-10 flex-shrink-0" />
          <p className="text-base font-extrabold leading-none whitespace-nowrap" style={{ color: t.dark }}>{APP_NAME}</p>
          <button onClick={() => onCollapsedChange(true)} title="Perkecil sidebar" aria-label="Perkecil sidebar" className="ui-interactive ml-auto -mr-2 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:bg-black/5 opacity-0 group-hover/sidebar:opacity-100 focus-visible:opacity-100"><PanelLeftClose size={16} color="#bbb" /></button>
        </div>
      )}

      <div className={`mb-5 flex-shrink-0 ${collapsed ? "px-0 flex justify-center" : "px-4"}`}>
        {collapsed ? <span title={mode === "mother" ? "Akun Ibu" : "Akun Suami"} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: t.soft }}>{mode === "mother" ? <Heart size={16} color={t.active} /> : <Users size={16} color={t.active} />}</span> : <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: t.soft }}>{mode === "mother" ? <Heart size={14} color={t.active} /> : <Users size={14} color={t.active} />}<span className="text-[12px] font-bold" style={{ color: t.active }}>{mode === "mother" ? "Akun Ibu" : "Akun Suami"}</span></div>}
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {navItems.map(({ id, label, Icon }) => {
          const active = screen === id;
          return <button key={id} onClick={() => onNavigate("/" + id)} title={collapsed ? label : undefined} className={`w-full flex items-center gap-3 py-3 rounded-xl text-left transition-colors hover:bg-black/5 ${collapsed ? "justify-center px-0" : "px-4"}`} style={{ background: active ? t.soft : "transparent", color: active ? t.active : "#999" }}><Icon size={collapsed ? 18 : 16} strokeWidth={active ? 2.5 : 1.8} color={active ? t.active : "#bbb"} />{!collapsed && <span className="text-[13px] font-semibold whitespace-nowrap">{label}</span>}{!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: t.active }} />}</button>;
        })}
        <div className="pt-2 space-y-1"><button onClick={() => onNavigate("/emergency")} title={collapsed ? "Mode Darurat" : undefined} className={`w-full flex items-center gap-3 py-3 rounded-xl text-left transition-colors hover:bg-black/5 ${collapsed ? "justify-center px-0" : "px-4"}`} style={{ background: screen === "emergency" ? "#fff0f0" : "transparent", color: "#ef4444" }}><PhoneCall size={collapsed ? 18 : 16} strokeWidth={1.8} color="#ef4444" />{!collapsed && <span className="text-[13px] font-semibold whitespace-nowrap">Mode Darurat</span>}</button></div>
      </nav>

      {mode === "mother" && !isPostpartum && collapsed && <div className="pb-4 flex-shrink-0 flex justify-center"><button onClick={() => onNavigate("/postpartum")} title="Bayi Telah Lahir? Si Kecil Sudah Hadir — catat waktu lahir si kecil" className="ui-interactive w-10 h-10 rounded-full flex items-center justify-center" style={{ background: t.soft, border: `1.5px solid ${t.border}` }}><Baby size={18} color={t.active} /></button></div>}
      {mode === "mother" && !isPostpartum && !collapsed && <div className="px-4 pb-4 flex-shrink-0"><div onClick={() => onNavigate("/postpartum")} className="rounded-2xl p-3 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden" style={{ background: t.soft, border: `1.5px solid ${t.border}` }}><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm"><Baby size={18} color={t.active} /></div><div><p className="text-[12px] font-extrabold leading-tight" style={{ color: t.dark }}>Bayi Telah Lahir?</p><p className="text-[10px]" style={{ color: t.muted }}>Catat waktu lahir si kecil</p></div></div><button className="ui-interactive w-full py-1.5 rounded-xl text-[11px] font-bold text-white" style={{ background: t.grad }}>Si Kecil Sudah Hadir</button></div></div>}
    </aside>
  );
}
