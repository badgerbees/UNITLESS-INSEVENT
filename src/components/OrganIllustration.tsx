import React, { useId } from "react";

export type OrganKey = "brain" | "heart" | "lungs" | "eye" | "bone" | "limb" | "gut";

/*
 * Ikon organ bergaya siluet solid (satu warna). Detail seperti garis detak jantung
 * dibuat sebagai potongan (mask) sehingga warna latar tile terlihat menembus ikon.
 */
export function OrganIllustration({ organ, color = "#fff", className = "" }: {
  organ: OrganKey; color?: string; className?: string;
}) {
  const maskId = `${useId().replace(/:/g, "")}-cut`;
  const svgProps = { viewBox: "0 0 24 24", className: `w-full h-full ${className}`, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  // shape = bagian solid, cut = bagian yang dilubangi (digambar hitam di mask)
  const icon = (shape: React.ReactNode, cut?: React.ReactNode) => (
    <svg {...svgProps}>
      {cut && (
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
            <g fill="#fff" stroke="#fff">{shape}</g>
            <g fill="none" stroke="#000">{cut}</g>
          </mask>
        </defs>
      )}
      <g fill={color} stroke={color} mask={cut ? `url(#${maskId})` : undefined}>{shape}</g>
    </svg>
  );

  switch (organ) {
    case "brain":
      return icon(
        <path strokeWidth="0" d="M12 4.2C11 2.7 9 2.3 7.5 3.2 5.6 3.2 4.4 4.7 4.4 6.3 2.9 7.2 2.3 9.4 3.3 11 2.3 12.5 2.7 15 4.3 16.1c0 2.1 2 3.6 4.1 3.1 1 1.5 2.9 1.6 3.6.5.7 1.1 2.6 1 3.6-.5 2.1.5 4.1-1 4.1-3.1 1.6-1.1 2-3.6 1-5.1 1-1.6.4-3.8-1.1-4.7 0-1.6-1.2-3.1-3.1-3.1C15 2.3 13 2.7 12 4.2Z" />,
        <>
          <path strokeWidth="1.4" d="M12 4.6v15" />
          <path strokeWidth="1.3" d="M7.6 8.1c1.5 0 2.3.9 2.3 2.2M16.4 8.1c-1.5 0-2.3.9-2.3 2.2M6.8 14.2c1.3 0 2.3-.6 2.8-1.7M17.2 14.2c-1.3 0-2.3-.6-2.8-1.7" />
        </>
      );

    case "heart":
      return icon(
        <path strokeWidth="0" d="M12 21s-9-5.1-9-11.4A5 5 0 0 1 12 6.8a5 5 0 0 1 9 2.8C21 15.9 12 21 12 21Z" />,
        <path strokeWidth="1.5" d="M5.5 12.6h3l1.6-2.8 2.2 5 1.6-2.2h4.6" />
      );

    case "lungs":
      return icon(
        <>
          <path strokeWidth="2.6" fill="none" d="M12 2.5v9" />
          <path strokeWidth="0" d="M9.8 6.8C6.8 6.8 3 11 3 17c0 2.6 1.6 3.9 3.7 3.9 1.9 0 3.1-1.2 3.1-3.1V8.7c0-1.2 0-1.9 0-1.9Z" />
          <path strokeWidth="0" d="M14.2 6.8c3 0 6.8 4.2 6.8 10.2 0 2.6-1.6 3.9-3.7 3.9-1.9 0-3.1-1.2-3.1-3.1V8.7c0-1.2 0-1.9 0-1.9Z" />
        </>,
        <path strokeWidth="1.3" d="M12 11.5 9.6 14M12 11.5l2.4 2.5M6.6 12.6l1.6 1.4M17.4 12.6 15.8 14" />
      );

    case "eye":
      return icon(
        <path strokeWidth="0" d="M1.8 12S5.6 4.8 12 4.8 22.2 12 22.2 12 18.4 19.2 12 19.2 1.8 12 1.8 12Z" />,
        <>
          <circle cx="12" cy="12" r="3.6" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="1" strokeWidth="1.4" />
        </>
      );

    case "bone":
      return icon(
        <path strokeWidth="0" d="M17.3 10.3c.8-.8 1.9 0 2.8 0a2.8 2.8 0 1 0 0-5.6.6.6 0 0 1-.6-.6 2.8 2.8 0 1 0-5.6 0c0 .9.8 2 0 2.8l-7.6 7.6c-.8.8-1.9 0-2.8 0a2.8 2.8 0 0 0 0 5.6c.3 0 .6.3.6.6a2.8 2.8 0 1 0 5.6 0c0-.9-.8-2 0-2.8Z" />
      );

    case "limb": // embrio dengan kuncup lengan/kaki
      return icon(
        <>
          <circle strokeWidth="0" cx="13.8" cy="7.6" r="5" />
          <path strokeWidth="0" d="M9.6 11.4c-3.4 1.6-4.8 5.8-2.4 8.6 2.4 2.8 7.6 2.2 9.2-1.2 1-2.3-.6-4.2-2.6-3.6-1.4.4-2.2-.6-1.8-2Z" />
        </>,
        <>
          <circle cx="15.6" cy="7" r=".5" strokeWidth="1.3" />
          <path strokeWidth="1.2" d="M9.4 15.6l-1.8 1M12.2 18.4l-.6 1.8" />
        </>
      );

    case "gut": // lambung (mewakili organ pencernaan)
      return icon(
        <>
          <path strokeWidth="2.6" fill="none" d="M9.6 2.5v4.2" />
          <path strokeWidth="0" d="M8.3 6.4h2.6c0 1.9 1.3 2.9 3.1 2.5 3-.7 6.2 1 6.2 4.9 0 4.6-3.9 7.9-8.9 7.9-2.6 0-4.6-1-5.8-2.5l2-1.6c.8 1 2.2 1.6 3.8 1.6 1.6 0 2.5-.7 2.5-1.8 0-1.5-1.4-2.1-3.3-2.5-2.6-.5-4.1-1.9-3.8-4.4.2-1.9 1.6-3.4 1.6-4.1Z" />
          <path strokeWidth="2.6" fill="none" d="M5.4 19.6 3.8 21.2" />
        </>
      );
  }
}
