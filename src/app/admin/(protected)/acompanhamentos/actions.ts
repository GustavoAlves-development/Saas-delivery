"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TipoAcompanhamento } from "@/generated/prisma";

export async function criarAcompanhamento(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const tipo = (formData.get("tipo") as TipoAcompanhamento) ?? TipoAcompanhamento.ACOMPANHAMENTO;

  await prisma.acompanhamento.create({
    data: {
      nome: formData.get("nome") as string,
      preco: parseFloat((formData.get("preco") as string) || "0"),
      imagemUrl: (formData.get("imagemUrl") as string) || null,
      tipo,
      empresaId: session.user.empresaId,
    },
  });

  revalidatePath("/admin/acompanhamentos");
  revalidatePath("/admin/adicionais");
}

export async function atualizarAcompanhamento(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.acompanhamento.update({
    where: { id, empresaId: session.user.empresaId },
    data: {
      nome: formData.get("nome") as string,
      preco: parseFloat((formData.get("preco") as string) || "0"),
      imagemUrl: (formData.get("imagemUrl") as string) || null,
    },
  });

  revalidatePath("/admin/acompanhamentos");
  revalidatePath("/admin/adicionais");
}

export async function toggleAcompanhamentoAtivo(id: string, ativo: boolean) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.acompanhamento.update({
    where: { id, empresaId: session.user.empresaId },
    data: { ativo: !ativo },
  });

  revalidatePath("/admin/acompanhamentos");
  revalidatePath("/admin/adicionais");
}

export async function excluirAcompanhamento(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.acompanhamento.delete({
    where: { id, empresaId: session.user.empresaId },
  });

  revalidatePath("/admin/acompanhamentos");
  revalidatePath("/admin/adicionais");
}
