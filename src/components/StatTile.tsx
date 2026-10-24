import React from "react";
import { Theme } from "../types";

export function StatTile({ label, value, sub, t, accent = false, icon: Icon }: {
  label: string; value: string | number; sub?: string; t: Theme; accent?: boolean; icon?: React.ElementType;
}) {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-3.5" style={{ background: t.card, boxShadow: `0 2px 12px ${t.shadow}` }}>
      {Icon && (
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accent ? t.active : t.soft }}>
          <Icon size={20} color={accent ? "#fff" : t.active} strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium" style={{ color: t.muted }}>{label}</p>
        <p className="text-xl font-extrabold leading-tight" style={{ color: accent ? t.active : t.dark }}>
          {value}
          {sub && <span className="text-[11px] font-medium ml-1.5" style={{ color: t.muted }}>{sub}</span>}
        </p>
      </div>
    </div>
  );
}
