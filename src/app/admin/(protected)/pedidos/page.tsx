import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import KanbanBoard from "./_components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const session = await auth();

  const pedidos = await prisma.pedido.findMany({
    where: { empresaId: session!.user.empresaId },
    include: { itens: true },
    orderBy: { criadoEm: "desc" },
  });

  const serialized = pedidos.map((p) => ({
    ...p,
    total: p.total.toString(),
    criadoEm: p.criadoEm,
    atualizadoEm: p.atualizadoEm,
    itens: p.itens.map((i) => ({ ...i, preco: i.preco.toString() })),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} no total
          </p>
        </div>
      </div>

      <KanbanBoard pedidos={serialized} />
    </div>
  );
}
