import React from "react";

export function FruitIllustration({ type, className = "" }: { type: number, className?: string }) {
  const svgProps = { viewBox: "0 0 64 64", className: `w-full h-full ${className}`, fill: "none" };

  switch (type) {
    case 6: // Kacang Polong (Pea)
      return (
        <svg {...svgProps}>
          <path d="M12 32 Q 32 52 52 32 Q 32 12 12 32 Z" fill="#dcfce7" stroke="#22c55e" strokeWidth="3" />
          <circle cx="24" cy="32" r="5" fill="#22c55e" />
          <circle cx="40" cy="32" r="5" fill="#22c55e" />
        </svg>
      );
    case 8: // Raspberry
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="22" r="8" fill="#fce7f3" stroke="#ec4899" strokeWidth="3" />
          <circle cx="22" cy="34" r="8" fill="#fce7f3" stroke="#ec4899" strokeWidth="3" />
          <circle cx="42" cy="34" r="8" fill="#fce7f3" stroke="#ec4899" strokeWidth="3" />
          <circle cx="32" cy="46" r="8" fill="#fce7f3" stroke="#ec4899" strokeWidth="3" />
          <path d="M32 10 L32 14 M26 10 L30 15 M38 10 L34 15" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 12: // Lime
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="24" fill="#ecfccb" stroke="#65a30d" strokeWidth="3" />
          <circle cx="32" cy="32" r="16" stroke="#65a30d" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="32" cy="32" r="2" fill="#65a30d" />
        </svg>
      );
    case 16: // Avocado
      return (
        <svg {...svgProps}>
          <path d="M32 10 C 20 10 16 28 16 40 C 16 52 24 56 32 56 C 40 56 48 52 48 40 C 48 28 44 10 32 10 Z" fill="#f0fdf4" stroke="#16a34a" strokeWidth="3" />
          <circle cx="32" cy="40" r="10" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
        </svg>
      );
    case 20: // Banana
      return (
        <svg {...svgProps}>
          <path d="M14 50 C 20 54 44 54 52 30 C 52 30 40 40 14 36 Z" fill="#fef9c3" stroke="#d97706" strokeWidth="3" />
          <path d="M14 50 C 10 30 20 14 38 10 C 38 10 26 26 14 36" fill="#fef08a" stroke="#d97706" strokeWidth="3" />
        </svg>
      );
    case 24: // Corn
      return (
        <svg {...svgProps}>
          <path d="M32 10 C 20 30 20 50 32 56 C 44 50 44 30 32 10 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />
          <path d="M32 10 L 32 56 M 26 18 L 26 50 M 38 18 L 38 50" stroke="#ca8a04" strokeWidth="2" />
          <path d="M16 48 C 24 30 32 10 32 10" stroke="#22c55e" strokeWidth="3" fill="none" />
          <path d="M48 48 C 40 30 32 10 32 10" stroke="#22c55e" strokeWidth="3" fill="none" />
        </svg>
      );
    case 28: // Eggplant
      return (
        <svg {...svgProps}>
          <path d="M32 18 C 16 18 16 40 16 46 C 16 54 24 58 32 58 C 40 58 48 54 48 46 C 48 40 48 18 32 18 Z" fill="#faf5ff" stroke="#9333ea" strokeWidth="3" />
          <path d="M32 6 C 24 10 26 20 32 24 C 38 20 40 10 32 6 Z" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
        </svg>
      );
    case 32: // Pineapple
      return (
        <svg {...svgProps}>
          <rect x="20" y="24" width="24" height="32" rx="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />
          <path d="M20 34 L 44 44 M 20 44 L 44 34 M 20 28 L 44 38 M 20 50 L 44 40 M 20 38 L 44 28 M 20 40 L 44 50" stroke="#ca8a04" strokeWidth="2" opacity="0.5" />
          <path d="M32 24 C 20 16 24 6 32 6 C 40 6 44 16 32 24 Z" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
          <path d="M32 24 C 16 20 16 10 24 10 C 24 10 28 18 32 24 Z" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
          <path d="M32 24 C 48 20 48 10 40 10 C 40 10 36 18 32 24 Z" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
        </svg>
      );
    case 36: // Melon
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="24" fill="#ecfccb" stroke="#65a30d" strokeWidth="3" />
          <path d="M20 16 C 16 30 16 40 24 54" stroke="#65a30d" strokeWidth="2" opacity="0.4" />
          <path d="M44 16 C 48 30 48 40 40 54" stroke="#65a30d" strokeWidth="2" opacity="0.4" />
          <path d="M32 8 L 32 56" stroke="#65a30d" strokeWidth="2" opacity="0.4" />
        </svg>
      );
    case 40: // Watermelon
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="26" fill="#bbf7d0" stroke="#15803d" strokeWidth="3" />
          <path d="M16 12 C 10 24 10 40 16 52 M 24 8 C 16 20 16 44 24 56 M 40 8 C 48 20 48 44 40 56 M 48 12 C 54 24 54 40 48 52" stroke="#15803d" strokeWidth="4" />
        </svg>
      );
    default:
      return null;
  }
}
