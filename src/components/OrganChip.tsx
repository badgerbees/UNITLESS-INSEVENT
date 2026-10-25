import React from "react";
import { Theme } from "../types";
import { OrganIllustration, OrganKey } from "./OrganIllustration";

export function OrganChip({ organ, label, active, onClick, t }: {
  organ: OrganKey; label: string; active: boolean; onClick: () => void; t: Theme;
}) {
  return (
    <button onClick={onClick}
      className="group flex items-center gap-3 rounded-2xl p-2.5 pr-3 text-left min-w-0"
      style={{
        background: active ? t.active : t.soft,
        boxShadow: active ? `0 8px 18px ${t.shadow}` : "none",
      }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center p-2.5 flex-shrink-0"
        style={{ background: active ? "rgba(255,255,255,0.22)" : t.primary + "80" }}>
        <OrganIllustration organ={organ} color="#fff" />
      </div>
      <span className="text-[13px] font-bold leading-tight truncate"
        style={{ color: active ? "#fff" : t.active }}>{label}</span>
    </button>
  );
}
