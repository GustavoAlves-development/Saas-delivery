"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { PALETAS } from "@/lib/paletas";
import { salvarPaletaCor } from "../actions";

export default function PaletaForm({ currentPaleta }: { currentPaleta: string }) {
  const [selecionada, setSelecionada] = useState(currentPaleta);
  const [isPending, startTransition] = useTransition();
  const [salvo, setSalvo] = useState(false);

  function handleSalvar() {
    startTransition(async () => {
      await salvarPaletaCor(selecionada);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {PALETAS.map((paleta) => {
          const ativa = selecionada === paleta.id;
          return (
            <button
              key={paleta.id}
              type="button"
              onClick={() => setSelecionada(paleta.id)}
              title={paleta.nome}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                ativa
                  ? "border-slate-800 dark:border-slate-200 shadow-md scale-105"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:scale-[1.02]"
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                style={{ backgroundColor: paleta.hex }}
              >
                {ativa && <CheckCircle2 size={18} className="text-white drop-shadow" />}
              </div>
              <span className={`text-xs font-medium ${ativa ? "text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}>
                {paleta.nome}
              </span>
            </button>
          );
        })}
      </div>

      {(() => {
        const p = PALETAS.find((p) => p.id === selecionada)!;
        return (
          <div
            className="rounded-xl p-3 flex items-center gap-3 text-sm border"
            style={{ backgroundColor: p.hexLight, borderColor: p.hexBorder }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: p.hex }}
            >
              A
            </div>
            <span style={{ color: p.hexText }} className="font-medium">
              Preview: {p.nome}
            </span>
            <div
              className="ml-auto px-3 py-1 rounded-lg text-white text-xs font-semibold"
              style={{ backgroundColor: p.hex }}
            >
              Adicionar
            </div>
          </div>
        );
      })()}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSalvar}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm"
        >
          <Save size={15} />
          {isPending ? "Salvando…" : "Salvar Paleta"}
        </button>
        {salvo && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 size={15} />
            Salvo!
          </span>
        )}
      </div>
    </div>
  );
}
