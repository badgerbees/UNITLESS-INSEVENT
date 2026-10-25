import React, { forwardRef } from "react";

export type BirthPlanDocProps = {
  motherName: string; fatherName: string; dueDate: Date; hospital: string; doctor: string;
  options: { id: string; label: string; sub: string; selected: boolean }[];
};

const fmt = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

// Dokumen Rencana Persalinan untuk dicetak/dibawa ke fasilitas kesehatan.
// Data kosong dicetak sebagai garis isian, bukan nilai contoh.
export const BirthPlanDocument = forwardRef<HTMLDivElement, BirthPlanDocProps>(function BirthPlanDocument(
  { motherName, fatherName, dueDate, hospital, doctor, options }, ref,
) {
  const blank = (v: string) => v.trim() || "________________________";
  return (
    <div ref={ref} style={{ background: "#fff", color: "#1a1a2e", padding: "8px 4px", fontFamily: "'Manrope', sans-serif" }}>
      <div style={{ borderBottom: "2px solid #1a1a2e", paddingBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>RENCANA PERSALINAN</h1>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>Birth Plan · TemanBunda</p>
        </div>
        <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Dicetak {fmt(new Date())}</p>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", margin: "18px 0", fontSize: 13 }}>
        <tbody>
          {[
            ["Nama Ibu", blank(motherName)],
            ["Pendamping", blank(fatherName)],
            ["Hari Perkiraan Lahir (HPL)", fmt(dueDate)],
            ["Fasilitas kesehatan rujukan", blank(hospital)],
            ["Dokter / Bidan", blank(doctor)],
          ].map(([label, value]) => (
            <tr key={label} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "8px 0", color: "#6b7280", width: "38%" }}>{label}</td>
              <td style={{ padding: "8px 0", fontWeight: 700 }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "22px 0 10px" }}>Keinginan Bunda Selama Persalinan</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {options.map(o => (
          <div key={o.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10,
            border: `1.5px solid ${o.selected ? "#86efac" : "#e5e7eb"}`, background: o.selected ? "#f0fdf4" : "#fff" }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1, display: "inline-flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${o.selected ? "#16a34a" : "#9ca3af"}`, background: o.selected ? "#16a34a" : "#fff", color: "#fff", fontSize: 12, fontWeight: 800 }}>
              {o.selected ? "✓" : ""}
            </span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{o.label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>{o.sub}{o.selected ? "" : " · tidak dipilih"}</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: "#6b7280", margin: "18px 0 0", lineHeight: 1.5 }}>
        Rencana ini adalah keinginan Bunda dan dapat berubah sesuai kondisi ibu dan bayi serta pertimbangan tenaga kesehatan yang menangani persalinan.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 40, fontSize: 11, textAlign: "center" }}>
        {["Ibu", "Pendamping", "Tenaga Kesehatan"].map(role => (
          <div key={role}>
            <div style={{ height: 56, borderBottom: "1px solid #1a1a2e" }} />
            <p style={{ margin: "6px 0 0", color: "#6b7280" }}>{role}</p>
          </div>
        ))}
      </div>
    </div>
  );
});
