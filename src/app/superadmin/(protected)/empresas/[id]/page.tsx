import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  CheckCircle,
  Calendar,
  DollarSign,
} from "lucide-react";
import { StatusMensalidade } from "@/generated/prisma";
import { salvarMensalidade, registrarPagamento, salvarTipo } from "./actions";
import { Store } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<StatusMensalidade, string> = {
  TRIAL: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  EM_DIA: "bg-green-500/15 text-green-400 border border-green-500/30",
  VENCIDA: "bg-red-500/15 text-red-400 border border-red-500/30",
  CANCELADA: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
};

const STATUS_LABEL: Record<StatusMensalidade, string> = {
  TRIAL: "Trial",
  EM_DIA: "Em dia",
  VENCIDA: "Vencida",
  CANCELADA: "Cancelada",
};

function toInputDate(d: Date | null) {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

function fmt(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export default async function EmpresaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const empresa = await prisma.empresa.findUnique({
    where: { id },
    include: {
      usuarios: true,
      _count: { select: { produtos: true, pedidos: true, categorias: true } },
    },
  });

  if (!empresa) notFound();

  const salvarAction = salvarMensalidade.bind(null, id);
  const pagarAction = registrarPagamento.bind(null, id);
  const salvarTipoAction = salvarTipo.bind(null, id);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/superadmin"
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mt-0.5"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{empresa.nome}</h1>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[empresa.statusMensalidade]}`}>
              {STATUS_LABEL[empresa.statusMensalidade]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-400 text-sm">/loja/{empresa.slug}</p>
            <Link
              href={`/loja/${empresa.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-xs transition-colors"
            >
              <ExternalLink size={12} /> Ver loja
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Package size={16} className="text-slate-400" />} label="Produtos" value={empresa._count.produtos} />
        <StatCard icon={<ShoppingBag size={16} className="text-slate-400" />} label="Pedidos" value={empresa._count.pedidos} />
        <StatCard icon={<Users size={16} className="text-slate-400" />} label="Usuários" value={empresa._count.categorias} />
      </div>

      {/* Mensalidade */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <CreditCard size={16} className="text-violet-400" />
            Mensalidade
          </h2>
          {/* Registrar pagamento rápido */}
          <form action={pagarAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all"
            >
              <CheckCircle size={13} />
              Registrar pagamento +30 dias
            </button>
          </form>
        </div>

        {/* Resumo atual */}
        <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-slate-800">
          <InfoItem
            icon={<DollarSign size={14} className="text-slate-500" />}
            label="Valor mensal"
            value={`R$ ${Number(empresa.valorMensalidade).toFixed(2).replace(".", ",")}`}
          />
          <InfoItem
            icon={<Calendar size={14} className="text-slate-500" />}
            label="Vencimento"
            value={fmt(empresa.vencimentoMensalidade)}
            highlight={
              empresa.statusMensalidade === "VENCIDA" ||
              (empresa.vencimentoMensalidade !== null &&
                empresa.vencimentoMensalidade < new Date())
            }
          />
          <InfoItem
            label="Plano"
            value={empresa.plano.charAt(0).toUpperCase() + empresa.plano.slice(1)}
            icon={undefined}
          />
        </div>

        {/* Formulário edição */}
        <form action={salvarAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Plano</label>
              <select name="plano" defaultValue={empresa.plano} className={inputCls}>
                <option value="basico">Básico</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select name="statusMensalidade" defaultValue={empresa.statusMensalidade} className={inputCls}>
                <option value="TRIAL">Trial</option>
                <option value="EM_DIA">Em dia</option>
                <option value="VENCIDA">Vencida</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Valor (R$/mês)</label>
              <input
                name="valorMensalidade"
                type="number"
                step="0.01"
                min="0"
                defaultValue={Number(empresa.valorMensalidade).toFixed(2)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Vencimento</label>
              <input
                name="vencimentoMensalidade"
                type="date"
                defaultValue={toInputDate(empresa.vencimentoMensalidade)}
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </div>

      {/* Tipo da loja */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
          <Store size={16} className="text-violet-400" />
          Tipo da Loja
        </h2>
        <form action={salvarTipoAction} className="flex items-end gap-4">
          <div className="flex-1">
            <label className={labelCls}>Categoria do negócio</label>
            <select name="tipo" defaultValue={empresa.tipo} className={inputCls}>
              <option value="LANCHONETE">Lanchonete</option>
              <option value="PIZZARIA">Pizzaria</option>
              <option value="RESTAURANTE">Restaurante</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
          >
            Salvar
          </button>
        </form>
      </div>

      {/* Dados da empresa */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white mb-4">Dados da empresa</h2>
        <InfoItem label="WhatsApp" value={empresa.telefoneWhatsapp} icon={undefined} />
        <InfoItem label="Taxa de entrega" value={`R$ ${Number(empresa.taxaEntrega).toFixed(2).replace(".", ",")}`} icon={undefined} />
        <InfoItem label="Criada em" value={fmt(empresa.criadoEm)} icon={undefined} />
        <div>
          <p className={labelCls}>Administradores</p>
          <div className="space-y-1 mt-1.5">
            {empresa.usuarios.map((u) => (
              <p key={u.id} className="text-sm text-slate-300">{u.email}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm transition-all";

const labelCls = "block text-xs font-medium text-slate-400 mb-1.5";

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className={`text-sm font-medium mt-0.5 ${highlight ? "text-red-400" : "text-slate-200"}`}>
        {value}
      </p>
    </div>
  );
}
