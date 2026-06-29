"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function criarCategoria(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const maxOrdem = await prisma.categoria.aggregate({
    where: { empresaId: session.user.empresaId },
    _max: { ordem: true },
  });

  await prisma.categoria.create({
    data: {
      nome: formData.get("nome") as string,
      empresaId: session.user.empresaId,
      ordem: (maxOrdem._max.ordem ?? -1) + 1,
    },
  });

  revalidatePath("/admin/categorias");
}

export async function moverCategoria(id: string, direcao: "cima" | "baixo") {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const categorias = await prisma.categoria.findMany({
    where: { empresaId: session.user.empresaId },
    orderBy: { ordem: "asc" },
    select: { id: true, ordem: true },
  });

  const idx = categorias.findIndex((c) => c.id === id);
  if (idx === -1) return;

  const swapIdx = direcao === "cima" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= categorias.length) return;

  const current = categorias[idx];
  const swap = categorias[swapIdx];

  await prisma.$transaction([
    prisma.categoria.update({ where: { id: current.id }, data: { ordem: swap.ordem } }),
    prisma.categoria.update({ where: { id: swap.id }, data: { ordem: current.ordem } }),
  ]);

  revalidatePath("/admin/categorias");
}

export async function atualizarCategoria(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.categoria.update({
    where: { id, empresaId: session.user.empresaId },
    data: { nome: formData.get("nome") as string },
  });

  revalidatePath("/admin/categorias");
}

export async function excluirCategoria(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.categoria.delete({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/admin/categorias");
}
