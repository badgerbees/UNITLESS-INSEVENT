import React from "react";
import { Theme } from "../types";

export function PillBtn({ children, onClick, full = false, variant = "primary", size = "md", disabled = false, t }: {
  children: React.ReactNode; onClick?: () => void; full?: boolean; t: Theme;
  variant?: "primary" | "outline" | "sidebar" | "active" | "danger";
  size?: "sm" | "md" | "lg"; disabled?: boolean;
}) {
  const bg   = { primary: t.primary, outline: "transparent", sidebar: t.active, active: t.active, danger: "#ef4444" };
  const fg   = { primary: "#fff", outline: t.active, sidebar: "#fff", active: "#fff", danger: "#fff" };
  const bdr  = variant === "outline" ? `2px solid ${t.active}` : "none";
  const px   = size === "sm" ? "px-4 py-1.5 text-xs" : size === "lg" ? "px-8 py-3.5 text-base" : "px-6 py-2.5 text-sm";
  return (
    <button onClick={onClick} disabled={disabled}
      className={`ui-interactive rounded-full font-bold transition-all flex items-center justify-center gap-2 ${px} ${full ? "w-full" : ""}`}
      style={{ background: disabled ? "#e0d8e0" : bg[variant], color: disabled ? "#b0a8b0" : fg[variant], border: bdr }}
    >
      {children}
    </button>
  );
}
