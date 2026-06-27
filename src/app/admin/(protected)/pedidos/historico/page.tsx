import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusPedido } from "@/generated/prisma";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<StatusPedido, string> = {
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em Preparo",
  DESPACHADO: "Despachado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const STATUS_COR: Record<StatusPedido, string> = {
  RECEBIDO: "bg-blue-100 text-blue-700",
  EM_PREPARO: "bg-amber-100 text-amber-700",
  DESPACHADO: "bg-orange-100 text-orange-700",
  ENTREGUE: "bg-green-100 text-green-700",
  CANCELADO: "bg-gray-100 text-gray-500",
};

export default async function HistoricoPage() {
  const session = await auth();

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const pedidos = await prisma.pedido.findMany({
    where: {
      empresaId: session!.user.empresaId,
      criadoEm: { lt: hoje },
    },
    include: { itens: true },
    orderBy: { criadoEm: "desc" },
  });

  // Agrupar por data local
  const porDia = new Map<string, typeof pedidos>();
  for (const p of pedidos) {
    const chave = p.criadoEm.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    if (!porDia.has(chave)) porDia.set(chave, []);
    porDia.get(chave)!.push(p);
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/pedidos"
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} anteriores
          </p>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          Nenhum pedido anterior encontrado.
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(porDia.entries()).map(([data, itensDia]) => {
            const faturamento = itensDia
              .filter((p) => p.status !== "CANCELADO")
              .reduce((s, p) => s + Number(p.total), 0);

            return (
              <div key={data} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-700">{data}</span>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{itensDia.length} pedido{itensDia.length !== 1 ? "s" : ""}</span>
                    <span className="text-green-600 font-medium">
                      R$ {faturamento.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>

                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-50">
                    {itensDia.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-gray-900 font-medium">{p.nomeCliente}</td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                          {p.criadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell truncate max-w-48">
                          {p.itens.map((i) => `${i.quantidade}x ${i.nomeProduto}`).join(", ")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COR[p.status]}`}>
                            {STATUS_LABEL[p.status]}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-900">
                          R$ {Number(p.total).toFixed(2).replace(".", ",")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
