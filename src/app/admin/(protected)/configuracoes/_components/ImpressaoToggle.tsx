"use client";

import { useTransition } from "react";
import { salvarImpressaoAutomatica } from "../actions";
import { Printer } from "lucide-react";

export default function ImpressaoToggle({ atual }: { atual: boolean }) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(() => salvarImpressaoAutomatica(!atual));
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${atual ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-slate-700"}`}>
          <Printer size={16} className={atual ? "text-blue-600 dark:text-blue-400" : "text-gray-400"} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-slate-100">Impressão automática (2 vias)</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {atual
              ? "Imprime 2 vias automaticamente ao receber cada pedido"
              : "Impressão somente manual pelo botão na comanda"}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
          atual ? "bg-blue-500" : "bg-gray-300 dark:bg-slate-600"
        }`}
        role="switch"
        aria-checked={atual}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
            atual ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
