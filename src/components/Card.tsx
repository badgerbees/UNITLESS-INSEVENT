import React from "react";
import { Theme } from "../types";

export function Card({ children, className = "", style = {}, t }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; t: Theme;
}) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ background: t.card, boxShadow: `0 2px 16px ${t.shadow}`, ...style }}>
      {children}
    </div>
  );
}
