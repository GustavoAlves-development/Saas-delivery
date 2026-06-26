"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function atualizarConfiguracoesLoja(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.empresa.update({
    where: { id: session.user.empresaId },
    data: {
      nome: formData.get("nome") as string,
      telefoneWhatsapp: formData.get("telefoneWhatsapp") as string,
      taxaEntrega: parseFloat(formData.get("taxaEntrega") as string),
    },
  });

  revalidatePath("/admin/configuracoes");
}

export async function salvarImagens(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.empresa.update({
    where: { id: session.user.empresaId },
    data: {
      imagemPerfil: (formData.get("imagemPerfil") as string) || null,
      imagemBanner: (formData.get("imagemBanner") as string) || null,
    },
  });

  revalidatePath("/admin/configuracoes");
}

export async function salvarHorario(horarioJson: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.empresa.update({
    where: { id: session.user.empresaId },
    data: { horarioFuncionamento: horarioJson },
  });

  revalidatePath("/admin/configuracoes");
}
