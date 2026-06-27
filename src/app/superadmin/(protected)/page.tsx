import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, TrendingUp, AlertTriangle, Clock, CheckCircle, Plus, ExternalLink } from "lucide-react";
import { StatusMensalidade } from "@/generated/prisma";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<StatusMensalidade, string> = {
  TRIAL: "Trial",
  EM_DIA: "Em dia",
  VENCIDA: "Vencida",
  CANCELADA: "Cancelada",
};

const STATUS_BADGE: Record<StatusMensalidade, string> = {
  TRIAL: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  EM_DIA: "bg-green-500/15 text-green-400 border border-green-500/30",
  VENCIDA: "bg-red-500/15 text-red-400 border border-red-500/30",
  CANCELADA: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
};

function fmt(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export default async function SuperAdminDashboard() {
  const [empresas, totalPedidos] = await Promise.all([
    prisma.empresa.findMany({
      include: {
        _count: { select: { produtos: true, pedidos: true, usuarios: true } },
      },
      orderBy: { criadoEm: "desc" },
    }),
    prisma.pedido.count(),
  ]);

  const total = empresas.length;
  const trial = empresas.filter((e) => e.statusMensalidade === "TRIAL").length;
  const emDia = empresas.filter((e) => e.statusMensalidade === "EM_DIA").length;
  const vencida = empresas.filter((e) => e.statusMensalidade === "VENCIDA").length;
  const cancelada = empresas.filter((e) => e.statusMensalidade === "CANCELADA").length;

  const mrr = empresas
    .filter((e) => e.statusMensalidade === "EM_DIA")
    .reduce((acc, e) => acc + Number(e.valorMensalidade), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Visão geral do seu SaaS</p>
        </div>
        <Link
          href="/superadmin/empresas/nova"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-sm"
        >
          <Plus size={16} />
          Nova Empresa
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={<Building2 size={20} className="text-violet-400" />}
          label="Total de empresas"
          value={total}
          sub={`${totalPedidos} pedidos no total`}
          bg="bg-violet-500/10 border-violet-500/20"
        />
        <MetricCard
          icon={<TrendingUp size={20} className="text-green-400" />}
          label="MRR (Em dia)"
          value={`R$ ${mrr.toFixed(2).replace(".", ",")}`}
          sub={`${emDia} empresa${emDia !== 1 ? "s" : ""} pagantes`}
          bg="bg-green-500/10 border-green-500/20"
        />
        <MetricCard
          icon={<AlertTriangle size={20} className="text-red-400" />}
          label="Vencidas"
          value={vencida}
          sub={`${cancelada} cancelada${cancelada !== 1 ? "s" : ""}`}
          bg="bg-red-500/10 border-red-500/20"
          highlight={vencida > 0}
        />
        <MetricCard
          icon={<Clock size={20} className="text-blue-400" />}
          label="Trial"
          value={trial}
          sub="Aguardando conversão"
          bg="bg-blue-500/10 border-blue-500/20"
        />
        <MetricCard
          icon={<CheckCircle size={20} className="text-emerald-400" />}
          label="Em dia"
          value={emDia}
          sub="Pagamentos ativos"
          bg="bg-emerald-500/10 border-emerald-500/20"
        />
      </div>

      {/* Tabela de empresas */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white">Todas as empresas</h2>
          <span className="text-xs text-slate-500">{total} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Plano</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Vencimento</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Produtos</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Pedidos</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {empresas.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-white">{e.nome}</p>
                    <p className="text-xs text-slate-500 mt-0.5">/loja/{e.slug}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[e.statusMensalidade]}`}>
                      {STATUS_LABEL[e.statusMensalidade]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 capitalize">{e.plano}</td>
                  <td className="px-4 py-3.5 text-slate-300">{fmt(e.vencimentoMensalidade)}</td>
                  <td className="px-4 py-3.5 text-slate-300">{e._count.produtos}</td>
                  <td className="px-4 py-3.5 text-slate-300">{e._count.pedidos}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/loja/${e.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Ver loja"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <Link
                        href={`/superadmin/empresas/${e.id}`}
                        className="px-3 py-1.5 text-xs font-medium bg-violet-600/20 hover:bg-violet-600 text-violet-400 hover:text-white rounded-lg transition-colors whitespace-nowrap"
                      >
                        Gerenciar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {empresas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-500 text-sm">
                    Nenhuma empresa cadastrada ainda.{" "}
                    <Link href="/superadmin/empresas/nova" className="text-violet-400 hover:underline">
                      Cadastrar primeira empresa
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  bg,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  bg: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${bg} ${highlight ? "ring-1 ring-red-500/40" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs font-medium text-slate-300 mt-0.5">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  );
}
