import React from "react";
import { Theme } from "../types";

export function OrganChip({ Icon, label, active, onClick, t }: {
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
