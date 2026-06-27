"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className }: { className?: string }) {
  const { tema, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={tema === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className={className}
    >
      {tema === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
