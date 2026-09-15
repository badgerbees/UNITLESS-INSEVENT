import React from "react";
import { Theme } from "../types";

export function StatTile({ label, value, sub, t, accent = false }: {
  label: string; value: string | number; sub?: string; t: Theme; accent?: boolean;
}) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{ background: t.card, boxShadow: `0 2px 12px ${t.shadow}` }}>
      <p className="text-xs font-medium mb-1" style={{ color: t.muted }}>{label}</p>
      <p className="text-2xl font-extrabold leading-none" style={{ color: accent ? t.active : t.dark }}>{value}</p>
      {sub && <p className="text-[10px] mt-1" style={{ color: t.muted }}>{sub}</p>}
    </div>
  );
}
