import { createContext, useContext, useState, useMemo } from "react";
import { COLORS, DARK_COLORS } from "../utils/constants";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");

  const colors = mode === "dark" ? DARK_COLORS : COLORS;

  const value = useMemo(
    () => ({ theme: mode, mode, colors, setMode }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
