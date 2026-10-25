import React from "react";

export function SectionTitle({ children, className = "mb-4" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-xs font-extrabold uppercase tracking-wider ${className}`} style={{ color: "#4A4E4D", opacity: 0.6 }}>{children}</h2>;
}
