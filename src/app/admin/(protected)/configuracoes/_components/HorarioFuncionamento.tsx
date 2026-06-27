"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { salvarHorario } from "../actions";

type DiaSemana = {
  dia: string;
  aberto: boolean;
  abertura: string;
  fechamento: string;
};

const DIAS_DEFAULT: DiaSemana[] = [
  { dia: "Domingo",   aberto: false, abertura: "11:00", fechamento: "22:00" },
  { dia: "Segunda",   aberto: true,  abertura: "11:00", fechamento: "22:00" },
  { dia: "Terça",     aberto: true,  abertura: "11:00", fechamento: "22:00" },
  { dia: "Quarta",    aberto: true,  abertura: "11:00", fechamento: "22:00" },
  { dia: "Quinta",    aberto: true,  abertura: "11:00", fechamento: "22:00" },
  { dia: "Sexta",     aberto: true,  abertura: "11:00", fechamento: "23:00" },
  { dia: "Sábado",    aberto: true,  abertura: "11:00", fechamento: "23:00" },
];

function parseHorario(json?: string | null): DiaSemana[] {
  if (!json) return DIAS_DEFAULT;
  try { return JSON.parse(json); }
  catch { return DIAS_DEFAULT; }
}

export default function HorarioFuncionamento({
  horarioAtual,
}: {
  horarioAtual?: string | null;
}) {
  const [dias, setDias] = useState<DiaSemana[]>(parseHorario(horarioAtual));
  const [saved, setSaved] = useState(false);

  function update(index: number, field: keyof DiaSemana, value: string | boolean) {
    setDias((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await salvarHorario(JSON.stringify(dias));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const timeInp =
    "px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {dias.map((d, i) => (
        <div key={d.dia} className="flex items-center gap-4">
          <div className="w-20 flex items-center gap-2">
            <input
              type="checkbox"
              checked={d.aberto}
              onChange={(e) => update(i, "aberto", e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <span className={`text-sm ${d.aberto ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-500"}`}>
              {d.dia}
            </span>
          </div>

          {d.aberto ? (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
              <input
                type="time"
                value={d.abertura}
                onChange={(e) => update(i, "abertura", e.target.value)}
                className={timeInp}
              />
              <span>até</span>
              <input
                type="time"
                value={d.fechamento}
                onChange={(e) => update(i, "fechamento", e.target.value)}
                className={timeInp}
              />
            </div>
          ) : (
            <span className="text-sm text-gray-400 dark:text-slate-500">Fechado</span>
          )}
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm"
        >
          <Save size={15} />
          Salvar Horários
        </button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">Salvo!</span>
        )}
      </div>
    </form>
  );
}
