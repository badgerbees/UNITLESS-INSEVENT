import { Theme } from "../types";

export const THEMES: Record<"mother" | "companion", Theme> = {
  mother: {
    sidebarBg: "#ffffff",
    primary: "#e899a6",
    active: "#cd3a69",
    grad: "linear-gradient(135deg, #e899a6 0%, #cd3a69 100%)",
    bg: "#fef7f5",
    soft: "#fce8ed",
    card: "#ffffff",
    dark: "#2d2d2d",
    muted: "#a0a0a0",
    shadow: "rgba(205,58,105,0.10)",
    border: "rgba(232,153,166,0.22)",
  },
  companion: {
    sidebarBg: "#ffffff",
    primary: "#c8a2c8",
    active: "#996699",
    grad: "linear-gradient(135deg, #c8a2c8 0%, #7b5c9e 100%)",
    bg: "#f9f6fc",
    soft: "#ede6f5",
    card: "#ffffff",
    dark: "#2d2d2d",
    muted: "#a0a0a0",
    shadow: "rgba(153,102,153,0.10)",
    border: "rgba(200,162,200,0.22)",
  },
};
