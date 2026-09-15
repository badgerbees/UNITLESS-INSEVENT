import React from "react";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-extrabold mb-4 uppercase tracking-wider" style={{ color: "#4A4E4D", opacity: 0.6 }}>{children}</h2>;
}
