"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AdminShell({
  empresaNome,
  children,
}: {
  empresaNome: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — oculta no mobile, desliza ao abrir */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar empresaNome={empresaNome} onClose={() => setOpen(false)} />
      </div>

      {/* Área principal */}
      <div className="flex-1 md:ml-60 min-w-0 flex flex-col">
        {/* Header mobile com hamburger */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700/50 md:hidden sticky top-0 z-30">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {empresaNome}
          </span>
        </header>

        <main className="flex-1 p-4 md:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
