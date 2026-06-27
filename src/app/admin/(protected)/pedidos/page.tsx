import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import KanbanBoard from "./_components/KanbanBoard";
import DateNav from "./_components/DateNav";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

function parseDataParam(param: string | undefined): Date {
  if (param) {
    const d = new Date(param + "T00:00:00");
    if (!isNaN(d.getTime())) return d;
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const session = await auth();
  const { data: dataParam } = await searchParams;

  const inicioDia = parseDataParam(dataParam);
  const fimDia = new Date(inicioDia);
  fimDia.setHours(23, 59, 59, 999);

  const dateStr = inicioDia.toISOString().split("T")[0];

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const isHoje = inicioDia.getTime() === hoje.getTime();

  const pedidos = await prisma.pedido.findMany({
    where: {
      empresaId: session!.user.empresaId,
      criadoEm: { gte: inicioDia, lte: fimDia },
    },
    include: { itens: true },
    orderBy: { criadoEm: "desc" },
  });

  const faturamento = pedidos
    .filter((p) => p.status !== "CANCELADO")
    .reduce((s, p) => s + Number(p.total), 0);

  const serialized = pedidos.map((p) => ({
    ...p,
    total: p.total.toString(),
    itens: p.itens.map((i) => ({ ...i, preco: i.preco.toString() })),
  }));

  const labelData = isHoje
    ? "Hoje"
    : inicioDia.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} — {labelData}
            {faturamento > 0 && (
              <span className="ml-2 text-green-600 font-medium">
                · R$ {faturamento.toFixed(2).replace(".", ",")}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateNav dateStr={dateStr} isHoje={isHoje} />
          <Link
            href="/admin/pedidos/historico"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            <CalendarDays size={13} />
            Histórico
          </Link>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <CalendarDays size={40} className="mb-3 opacity-40" />
          <p className="text-sm font-medium">Nenhum pedido neste dia</p>
          {!isHoje && (
            <Link href="/admin/pedidos" className="mt-3 text-xs text-blue-500 hover:underline">
              Voltar para hoje
            </Link>
          )}
        </div>
      ) : (
        <KanbanBoard pedidos={serialized} empresaNome={session!.user.empresaNome} />
      )}
    </div>
  );
}
