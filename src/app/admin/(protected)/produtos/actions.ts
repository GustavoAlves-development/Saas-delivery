"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function criarProduto(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.produto.create({
    data: {
      nome: formData.get("nome") as string,
      descricao: (formData.get("descricao") as string) || null,
      preco: parseFloat(formData.get("preco") as string),
      imagemUrl: (formData.get("imagemUrl") as string) || null,
      categoriaId: formData.get("categoriaId") as string,
      empresaId: session.user.empresaId,
    },
  });

  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function atualizarProduto(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.produto.update({
    where: { id, empresaId: session.user.empresaId },
    data: {
      nome: formData.get("nome") as string,
      descricao: (formData.get("descricao") as string) || null,
      preco: parseFloat(formData.get("preco") as string),
      imagemUrl: (formData.get("imagemUrl") as string) || null,
      categoriaId: formData.get("categoriaId") as string,
    },
  });

  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function toggleProdutoAtivo(id: string, ativo: boolean) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.produto.update({
    where: { id, empresaId: session.user.empresaId },
    data: { ativo: !ativo },
  });

  revalidatePath("/admin/produtos");
}

export async function excluirProduto(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.produto.delete({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/admin/produtos");
}
