"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Tema = "light" | "dark";

const ThemeCtx = createContext<{ tema: Tema; toggle: () => void }>({
  tema: "light",
  toggle: () => {},
});

function aplicar(t: Tema) {
  document.documentElement.classList.toggle("dark", t === "dark");
}

export function ThemeProvider({
  children,
  storageKey,
  defaultTheme = "light",
}: {
  children: React.ReactNode;
  storageKey: string;
  defaultTheme?: Tema;
}) {
  const [tema, setTema] = useState<Tema>(defaultTheme);

  useEffect(() => {
    const salvo = localStorage.getItem(storageKey) as Tema | null;
    const inicial = salvo ?? defaultTheme;
    aplicar(inicial);
    setTema(inicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    const proximo: Tema = tema === "light" ? "dark" : "light";
    aplicar(proximo);
    setTema(proximo);
    localStorage.setItem(storageKey, proximo);
  }

  return <ThemeCtx.Provider value={{ tema, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
