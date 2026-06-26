"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusPedido } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export async function atualizarStatusPedido(
  pedidoId: string,
  novoStatus: StatusPedido
) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.pedido.update({
    where: { id: pedidoId, empresaId: session.user.empresaId },
    data: { status: novoStatus },
  });

  revalidatePath("/admin/pedidos");
}
