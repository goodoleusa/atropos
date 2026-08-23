import { useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark";
const STORAGE_KEY = "atropos-theme";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable (private mode, etc) — fall through to default
  }
  return "light";
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

/**
 * Site-wide light/dark mode toggle. Defaults to light (Annealed Bronze).
 * Persists the viewer's choice in localStorage and applies/removes the
 * `.dark` class Tailwind's `@custom-variant dark (&:is(.dark *))` reads,
 * which flips every semantic token in index.css. The .terminal-panel
 * dark treatment is independent of this — it re-declares its own vars
 * and stays dark under both modes.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore write failures — theme still applies for this session
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
