import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusPedido } from "@/generated/prisma";
import Link from "next/link";
import {
  ShoppingBag,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<StatusPedido, string> = {
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em Preparo",
  DESPACHADO: "Despachado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const STATUS_COR: Record<StatusPedido, string> = {
  RECEBIDO: "bg-blue-500",
  EM_PREPARO: "bg-amber-500",
  DESPACHADO: "bg-orange-500",
  ENTREGUE: "bg-green-500",
  CANCELADO: "bg-gray-300",
};

export default async function DashboardPage() {
  const session = await auth();
  const empresaId = session!.user.empresaId;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const fimHoje = new Date(hoje);
  fimHoje.setHours(23, 59, 59, 999);

  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const pedidosHoje = await prisma.pedido.findMany({
    where: { empresaId, criadoEm: { gte: hoje, lte: fimHoje } },
    select: { status: true, total: true, criadoEm: true, nomeCliente: true },
  });

  const totalMes = await prisma.pedido.count({
    where: { empresaId, criadoEm: { gte: inicioMes }, status: { not: "CANCELADO" } },
  });

  const faturamentoHoje = pedidosHoje
    .filter((p) => p.status !== "CANCELADO")
    .reduce((s, p) => s + Number(p.total), 0);

  const emAberto = pedidosHoje.filter((p) =>
    ["RECEBIDO", "EM_PREPARO"].includes(p.status)
  ).length;

  const porStatus = new Map<StatusPedido, number>();
  for (const p of pedidosHoje) {
    porStatus.set(p.status, (porStatus.get(p.status) ?? 0) + 1);
  }

  const seteDiasAtras = new Date(hoje);
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);

  const pedidos7Dias = await prisma.pedido.findMany({
    where: {
      empresaId,
      criadoEm: { gte: seteDiasAtras },
      status: { not: "CANCELADO" },
    },
    select: { criadoEm: true, total: true },
    orderBy: { criadoEm: "asc" },
  });

  const faturamentoPorDia: { label: string; total: number; dateStr: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const label =
      i === 0
        ? "Hoje"
        : i === 1
        ? "Ontem"
        : d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
    const total = pedidos7Dias
      .filter((p) => p.criadoEm.toISOString().split("T")[0] === dateStr)
      .reduce((s, p) => s + Number(p.total), 0);
    faturamentoPorDia.push({ label, total, dateStr });
  }

  const maxFaturamento = Math.max(...faturamentoPorDia.map((d) => d.total), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
          {hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          icon={<ShoppingBag size={20} className="text-blue-500" />}
          label="Pedidos hoje"
          value={String(pedidosHoje.length)}
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <Card
          icon={<DollarSign size={20} className="text-green-500" />}
          label="Faturamento hoje"
          value={`R$ ${faturamentoHoje.toFixed(2).replace(".", ",")}`}
          bg="bg-green-50 dark:bg-green-900/20"
        />
        <Card
          icon={<Clock size={20} className="text-amber-500" />}
          label="Em aberto"
          value={String(emAberto)}
          bg="bg-amber-50 dark:bg-amber-900/20"
          link="/admin/pedidos"
          destaque={emAberto > 0}
        />
        <Card
          icon={<TrendingUp size={20} className="text-purple-500" />}
          label="Pedidos no mês"
          value={String(totalMes)}
          bg="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown por status hoje */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-4">Pedidos de hoje por status</h2>
          {pedidosHoje.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">Nenhum pedido hoje ainda.</p>
          ) : (
            <div className="space-y-2.5">
              {(Object.keys(STATUS_LABEL) as StatusPedido[]).map((status) => {
                const count = porStatus.get(status) ?? 0;
                if (count === 0) return null;
                const pct = Math.round((count / pedidosHoje.length) * 100);
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-slate-300 mb-1">
                      <span>{STATUS_LABEL[status]}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_COR[status]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Faturamento últimos 7 dias */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-4">Faturamento — últimos 7 dias</h2>
          <div className="space-y-2">
            {faturamentoPorDia.map(({ label, total, dateStr }) => {
              const pct = maxFaturamento > 0 ? (total / maxFaturamento) * 100 : 0;
              const isHojeRow = label === "Hoje";
              return (
                <Link
                  key={dateStr}
                  href={`/admin/pedidos?data=${dateStr}`}
                  className="flex items-center gap-3 group"
                >
                  <span className={`text-xs w-16 shrink-0 ${isHojeRow ? "font-semibold text-gray-800 dark:text-slate-100" : "text-gray-500 dark:text-slate-400"}`}>
                    {label}
                  </span>
                  <div className="flex-1 h-5 bg-gray-100 dark:bg-slate-700 rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all ${isHojeRow ? "bg-blue-400" : "bg-gray-300 dark:bg-slate-500"} group-hover:brightness-90`}
                      style={{ width: `${pct}%`, minWidth: pct > 0 ? "4px" : "0" }}
                    />
                  </div>
                  <span className={`text-xs w-24 text-right shrink-0 ${total > 0 ? "text-gray-700 dark:text-slate-200 font-medium" : "text-gray-300 dark:text-slate-600"}`}>
                    {total > 0 ? `R$ ${total.toFixed(2).replace(".", ",")}` : "—"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Atalhos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: "/admin/pedidos", label: "Ver pedidos de hoje", desc: "Kanban com os pedidos do dia" },
          { href: "/admin/pedidos/historico", label: "Histórico", desc: "Todos os pedidos anteriores" },
          { href: "/admin/produtos", label: "Gerenciar produtos", desc: "Adicionar ou editar itens do cardápio" },
        ].map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm px-4 py-3 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{label}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{desc}</p>
            </div>
            <ArrowRight size={15} className="text-gray-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function Card({
  icon,
  label,
  value,
  bg,
  link,
  destaque,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  link?: string;
  destaque?: boolean;
}) {
  const content = (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${destaque ? "border-amber-300 dark:border-amber-700/50" : "border-gray-100 dark:border-slate-700/50"} p-4`}>
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">{label}</p>
      <p className={`text-xl font-bold ${destaque ? "text-amber-600" : "text-gray-900 dark:text-white"}`}>{value}</p>
    </div>
  );
  if (link) return <Link href={link}>{content}</Link>;
  return content;
}
