import React, { useId } from "react";

/*
 * Ilustrasi buah gaya semi-flat: warna polos (tanpa gradien, kilau, atau bayangan),
 * dengan satu bidang warna lebih gelap di satu sisi untuk memberi kesan volume.
 * Setiap instance memakai id unik (useId) supaya clipPath tidak bentrok
 * ketika ilustrasi yang sama muncul lebih dari sekali di halaman.
 */
export function FruitIllustration({ type, className = "" }: { type: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const id = (n: string) => `${uid}-${n}`;
  const url = (n: string) => `url(#${id(n)})`;
  const svgProps = { viewBox: "0 0 64 64", className: `w-full h-full ${className}`, fill: "none" };

  switch (type) {
    case 6: // Kacang Polong
      return (
        <svg {...svgProps}>
          <path d="M6 36 C 14 22 50 18 58 28 C 52 46 16 50 6 36 Z" fill="#7cc95e" />
          <path d="M10 35 C 20 28 46 26 54 30 C 46 40 20 42 10 35 Z" fill="#4f9a3a" />
          {[18, 28, 38, 47].map((cx, i) => (
            <circle key={i} cx={cx} cy={34 - i * 0.6} r="5.2" fill="#9ad97a" />
          ))}
          <path d="M8 36 C 4 32 4 28 7 25" stroke="#4f9a3a" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 8: // Raspberry
      return (
        <svg {...svgProps}>
          {[
            [32, 22], [24, 26], [40, 26], [20, 34], [28, 33], [36, 33], [44, 34],
            [24, 41], [32, 41], [40, 41], [28, 48], [36, 48], [32, 54],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill={cx > 32 ? "#c9235a" : "#e8457a"} />
          ))}
          <path d="M32 18 C 26 10 18 12 16 16 C 22 17 27 18 32 20 Z" fill="#5cb85c" />
          <path d="M32 18 C 38 10 46 12 48 16 C 42 17 37 18 32 20 Z" fill="#479a47" />
          <path d="M32 19 L 32 9" stroke="#3d7f3d" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );

    case 12: // Jeruk Nipis (irisan)
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="25" fill="#5fae36" />
          <circle cx="32" cy="32" r="21.5" fill="#f3fbe2" />
          <circle cx="32" cy="32" r="19.5" fill="#cdee8a" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1="32" y1="32"
              x2={32 + 19.5 * Math.cos((i * Math.PI) / 4)} y2={32 + 19.5 * Math.sin((i * Math.PI) / 4)}
              stroke="#f3fbe2" strokeWidth="2" />
          ))}
          <circle cx="32" cy="32" r="3" fill="#f3fbe2" />
        </svg>
      );

    case 16: // Alpukat (dibelah)
      return (
        <svg {...svgProps}>
          <path d="M32 5 C 22 5 18 22 13 36 C 9 50 19 58 32 58 C 45 58 55 50 51 36 C 46 22 42 5 32 5 Z" fill="#3f7a22" />
          <path d="M32 9 C 24 9 21 24 17 37 C 14 48 22 54 32 54 C 42 54 50 48 47 37 C 43 24 40 9 32 9 Z" fill="#d6e98a" />
          <circle cx="32" cy="40" r="9.5" fill="#9a5a2c" />
          <path d="M32 30.5 A 9.5 9.5 0 0 1 32 49.5 A 6.5 9.5 0 0 0 32 30.5 Z" fill="#7a4420" />
        </svg>
      );

    case 20: // Pisang
      return (
        <svg {...svgProps}>
          <path d="M10 22 C 8 42 26 56 50 50 C 56 48 56 44 52 44 C 34 46 20 38 16 22 C 15 18 11 18 10 22 Z" fill="#fbd34d" />
          <path d="M16 24 C 20 38 32 44 50 44 C 34 50 18 42 13 28 Z" fill="#eab308" />
          <path d="M10 22 L 12 15 L 15 16 L 15 21 Z" fill="#7a5a1a" />
          <path d="M51 44 L 55 45.5 L 54 48.5 L 51 48 Z" fill="#5b4310" />
        </svg>
      );

    case 24: // Jagung
      return (
        <svg {...svgProps}>
          <path d="M32 6 C 22 14 21 34 24 48 L 40 48 C 43 34 42 14 32 6 Z" fill="#e8b631" />
          {Array.from({ length: 7 }).map((_, r) =>
            [-1, 0, 1].map((c) => {
              const y = 13 + r * 5;
              const w = r === 0 ? 0.5 : 1;
              return <ellipse key={`${r}${c}`} cx={32 + c * 4.6 * w} cy={y} rx="2.3" ry="2.3" fill="#fcd95b" />;
            })
          )}
          <path d="M32 58 C 20 54 14 40 16 26 C 22 34 26 44 32 52 Z" fill="#6cbf4a" />
          <path d="M32 58 C 44 54 50 40 48 26 C 42 34 38 44 32 52 Z" fill="#4f9a3a" />
          <path d="M32 6 C 30 3 28 2 26 2 M32 6 C 34 3 36 2 38 2" stroke="#b5803a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 28: // Terong
      return (
        <svg {...svgProps}>
          <defs>
            <clipPath id={id("egg")}><path d="M26 16 C 14 22 10 40 16 50 C 22 60 40 60 46 50 C 52 40 42 30 40 20 C 38 14 32 12 26 16 Z" /></clipPath>
          </defs>
          <path d="M26 16 C 14 22 10 40 16 50 C 22 60 40 60 46 50 C 52 40 42 30 40 20 C 38 14 32 12 26 16 Z" fill="#8b46c4" />
          <g clipPath={url("egg")}>
            <path d="M40 14 C 46 30 52 40 44 54 C 40 60 30 62 24 60 C 36 56 42 44 38 30 Z" fill="#6a2fa0" />
          </g>
          <path d="M22 18 C 26 12 34 10 42 16 C 38 20 34 22 30 22 C 28 24 24 24 22 18 Z" fill="#5cb85c" />
          <path d="M34 15 C 36 10 38 7 41 5" stroke="#3d7f3d" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 32: // Nanas
      return (
        <svg {...svgProps}>
          <defs>
            <clipPath id={id("body")}><ellipse cx="32" cy="40" rx="14" ry="18" /></clipPath>
          </defs>
          <path d="M32 24 C 28 16 24 10 20 8 C 26 9 30 14 32 18 C 33 10 32 5 32 2 C 35 7 35 13 33 19 C 36 13 40 10 45 9 C 41 13 37 18 33 24 Z" fill="#4caf50" />
          <ellipse cx="32" cy="40" rx="14" ry="18" fill="#f7b928" />
          <g clipPath={url("body")}>
            <ellipse cx="42" cy="44" rx="10" ry="20" fill="#e39a12" />
            <g stroke="#b8650a" strokeWidth="1.2" opacity="0.55">
              {[-24, -16, -8, 0, 8, 16, 24].map((o) => (
                <g key={o}>
                  <line x1={18 + o} y1="22" x2={46 + o} y2="58" />
                  <line x1={46 + o} y1="22" x2={18 + o} y2="58" />
                </g>
              ))}
            </g>
          </g>
        </svg>
      );

    case 36: // Melon
      return (
        <svg {...svgProps}>
          <defs>
            <clipPath id={id("mel")}><circle cx="32" cy="32" r="25" /></clipPath>
          </defs>
          <circle cx="32" cy="32" r="25" fill="#d3e68f" />
          <g clipPath={url("mel")}>
            <circle cx="42" cy="40" r="25" fill="#bcd170" />
          </g>
          <g stroke="#eef6cf" strokeWidth="1.3" fill="none">
            <path d="M14 22 C 22 26 26 18 34 22 C 42 26 46 18 52 22" />
            <path d="M10 32 C 18 36 24 28 32 32 C 40 36 46 28 54 32" />
            <path d="M12 42 C 20 46 26 38 34 42 C 42 46 46 38 52 42" />
            <path d="M24 9 C 20 18 28 24 24 32 C 20 40 28 46 24 55" />
            <path d="M40 9 C 44 18 36 24 40 32 C 44 40 36 46 40 55" />
          </g>
          <path d="M32 7 C 32 4 34 2 36 2" stroke="#7a5a1a" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 40: // Semangka (utuh)
      return (
        <svg {...svgProps}>
          <defs>
            <clipPath id={id("wmClip")}><ellipse cx="32" cy="34" rx="25.5" ry="24" /></clipPath>
          </defs>
          <ellipse cx="32" cy="34" rx="25.5" ry="24" fill="#6dbb4c" />
          <g clipPath={url("wmClip")}>
            {/* sisi gelap flat */}
            <ellipse cx="44" cy="42" rx="25.5" ry="24" fill="#4f9e36" />
            {/* garis belang zig-zag khas semangka */}
            <g stroke="#2b6a1f" strokeWidth="3.2" strokeLinejoin="round" fill="none">
              {[-22, -11, 0, 11, 22].map((o) => (
                <path key={o} d={`M${32 + o * 0.7} 9 L ${30 + o * 0.95} 15 L ${34 + o * 1.1} 21 L ${30 + o * 1.2} 28 L ${34 + o * 1.25} 34 L ${30 + o * 1.2} 40 L ${34 + o * 1.1} 47 L ${30 + o * 0.95} 53 L ${32 + o * 0.7} 59`} />
              ))}
            </g>
          </g>
          {/* tangkai */}
          <path d="M32 10.5 C 32 7 34 5 37 5.5" stroke="#6b5420" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
}
