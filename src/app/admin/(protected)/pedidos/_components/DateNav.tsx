"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DateNav({ dateStr, isHoje }: { dateStr: string; isHoje: boolean }) {
  const router = useRouter();

  function navegar(dias: number) {
    const d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() + dias);
    const nova = d.toISOString().split("T")[0];
    router.push(`/admin/pedidos?data=${nova}`);
  }

  const label = isHoje
    ? "Hoje"
    : new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

  const btnClass =
    "p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => navegar(-1)} className={btnClass} title="Dia anterior">
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-medium text-gray-700 min-w-40 text-center capitalize">
        {label}
      </span>
      <button
        onClick={() => navegar(1)}
        disabled={isHoje}
        className={btnClass}
        title="Próximo dia"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
