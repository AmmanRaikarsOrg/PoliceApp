/**
 * Universal Color System for PoliceApp
 * Central source of truth for all brand, status, UI, and semantic colors.
 */

export const colors = {
  // ── Brand & Identity ──
  primary: "#0F294A", // Police Deep Navy
  primaryDark: "#0A1B30",
  primaryLight: "#1E3A8A",
  primarySubtle: "#EFF6FF",

  accent: "#2563EB", // Action / Highlight Blue
  accentLight: "#DBEAFE",
  accentHover: "#1D4ED8",

  // ── Case Status Colors (Strictly Open & Closed) ──
  status: {
    open: {
      main: "#DC2626",
      text: "#991B1B",
      bg: "#FEF2F2",
      border: "#FECACA",
      dot: "#DC2626",
    },
    closed: {
      main: "#475569",
      text: "#475569",
      bg: "#F1F5F9",
      border: "#E2E8F0",
      dot: "#475569",
    },
  },

  // ── Semantic & Feedback ──
  success: {
    main: "#16A34A",
    text: "#15803D",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  },
  warning: {
    main: "#D97706",
    text: "#B45309",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  error: {
    main: "#DC2626",
    text: "#B91C1C",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
  info: {
    main: "#2563EB",
    text: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },

  // ── Backgrounds & Surfaces ──
  background: "#F8FAFC", // Main screen background
  surface: "#FFFFFF", // Cards, modals, inputs
  surfaceElevated: "#FFFFFF",
  surfaceMuted: "#F1F5F9", // Chip backgrounds, inactive tabs
  surfaceSubtle: "#F8FAFC",

  // ── Borders & Dividers ──
  border: "#E2E8F0", // Standard card/row border
  borderLight: "#F1F5F9",
  borderMedium: "#CBD5E1",
  borderDark: "#94A3B8",

  // ── Typography ──
  textPrimary: "#0F172A", // Headings, titles, high-emphasis text
  textSecondary: "#334155", // Subtitles, body content
  textMuted: "#64748B", // Timestamps, meta text, inactive icons
  textPlaceholder: "#94A3B8", // Input placeholders
  textInverse: "#FFFFFF", // Text on navy or dark buttons

  // ── Legacy Compatibility Aliases ──
  text: "#0F172A",
  muted: "#64748B",
  danger: "#DC2626",

  // ── Overlays & Utility ──
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(15, 23, 42, 0.6)",
  transparent: "transparent",
  shadow: "#0F172A",
} as const;

export type ColorName = keyof typeof colors;