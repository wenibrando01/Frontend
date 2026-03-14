import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "educo_theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "light";
    } catch {
      return "light";
    }
  });

  const setTheme = useCallback((value) => {
    const next = value === "dark" ? "dark" : "light";
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    document.documentElement.setAttribute("data-educo-theme", next);
  }, []);

  // Sync data attribute on mount and when theme changes
  React.useEffect(() => {
    document.documentElement.setAttribute("data-educo-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, isDark: theme === "dark" }),
    [theme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
