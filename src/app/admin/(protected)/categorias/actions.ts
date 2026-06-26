"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function criarCategoria(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.categoria.create({
    data: {
      nome: formData.get("nome") as string,
      empresaId: session.user.empresaId,
    },
  });

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
