"use client";

import { useEffect, useState } from "react";
export type Theme = "light" | "dark";
const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch {} };

export function usePreferences() {
  const [theme, setThemeValue] = useState<Theme>("light");
  const [sound, setSoundValue] = useState(false);
  const [manualReduced, setManualReduced] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    // Hydrate persisted browser settings after the first client paint.
    const hydrate = requestAnimationFrame(() => {
      setSystemReduced(query.matches);
      setManualReduced(read("prospera-reduce") === "on");
      setThemeValue(read("prospera-theme") === "dark" ? "dark" : "light");
      setSoundValue(read("prospera-sound") === "on");
    });
    const change = () => setSystemReduced(query.matches);
    query.addEventListener("change", change);
    return () => { cancelAnimationFrame(hydrate); query.removeEventListener("change", change); };
  }, []);
  const reduced = systemReduced || manualReduced;
  useEffect(() => {
    document.documentElement.dataset.reduced = String(reduced);
    return () => { delete document.documentElement.dataset.reduced; };
  }, [reduced]);
  return {
    theme, sound, reduced, systemReduced,
    setTheme: (value: Theme) => { setThemeValue(value); write("prospera-theme", value); },
    setSound: (value: boolean) => { setSoundValue(value); write("prospera-sound", value ? "on" : "off"); },
    setReduced: (value: boolean) => { setManualReduced(value); write("prospera-reduce", value ? "on" : "off"); },
  };
}
