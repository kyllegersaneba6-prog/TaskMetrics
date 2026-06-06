import { Dimensions, PixelRatio, useWindowDimensions } from "react-native";

export const COLORS = {
  primary: "#3B82F6",
  primaryLight: "#60A5FA",
  primaryDark: "#2563EB",
  accent: "#06B6D4",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  text: "#111111",
  textSecondary: "#666666",
  textLight: "#999999",
  border: "#E5E5E5",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  white: "#FFFFFF",
  black: "#000000",
};

export const DARK_COLORS = {
  primary: "#60A5FA",
  primaryLight: "#93C5FD",
  primaryDark: "#3B82F6",
  accent: "#22D3EE",
  background: "#0A0A0A",
  surface: "#1A1A1A",
  text: "#F5F5F5",
  textSecondary: "#A3A3A3",
  textLight: "#737373",
  border: "#262626",
  success: "#4ADE80",
  warning: "#FBBF24",
  danger: "#F87171",
  white: "#FFFFFF",
  black: "#000000",
};

export const FONT = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold",
};

export const STATUSES = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

export const STATUS_COLORS = {
  pending: COLORS.warning,
  in_progress: COLORS.primary,
  completed: COLORS.success,
};

export const CATEGORIES = ["Work", "Personal", "Study", "Health", "Other"];

export const CATEGORY_COLORS = {
  Work: "#3B82F6",
  Personal: "#EC4899",
  Study: "#8B5CF6",
  Health: "#22C55E",
  Other: "#666666",
};

export function withAlpha(hex, alpha) {
  if (typeof hex === "string" && /^#[0-9A-Fa-f]{6}$/.test(hex)) {
    const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255).toString(16).padStart(2, "0");
    return hex + a;
  }
  return hex;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 375;

export function scale(size) {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
}

export function moderateScale(size, factor = 0.5) {
  return size + (scale(size) - size) * factor;
}

export function fontScale(size) {
  const fontScale = PixelRatio.getFontScale();
  return moderateScale(size) * fontScale;
}

export function isTablet() {
  return SCREEN_WIDTH >= 768;
}

export function useIsTablet() {
  const { width } = useWindowDimensions();
  return width >= 768;
}
