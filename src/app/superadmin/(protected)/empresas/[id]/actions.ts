"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TipoEmpresa } from "@/generated/prisma";

export async function salvarMensalidade(empresaId: string, fd: FormData) {
  const plano = fd.get("plano") as string;
  const statusMensalidade = fd.get("statusMensalidade") as "TRIAL" | "EM_DIA" | "VENCIDA" | "CANCELADA";
  const valorMensalidade = parseFloat(fd.get("valorMensalidade") as string);
  const vencimentoRaw = fd.get("vencimentoMensalidade") as string;

  await prisma.empresa.update({
    where: { id: empresaId },
    data: {
      plano,
      statusMensalidade,
      valorMensalidade,
      vencimentoMensalidade: vencimentoRaw ? new Date(vencimentoRaw) : null,
    },
  });

  revalidatePath(`/superadmin/empresas/${empresaId}`);
  revalidatePath("/superadmin");
}

export async function registrarPagamento(empresaId: string) {
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
  if (!empresa) return;

  const base = empresa.vencimentoMensalidade ?? new Date();
  const novoVencimento = new Date(base);
  novoVencimento.setMonth(novoVencimento.getMonth() + 1);

  await prisma.empresa.update({
    where: { id: empresaId },
    data: {
      statusMensalidade: "EM_DIA",
      vencimentoMensalidade: novoVencimento,
    },
  });

  revalidatePath(`/superadmin/empresas/${empresaId}`);
  revalidatePath("/superadmin");
}

export async function alterarStatusEmpresa(
  empresaId: string,
  status: "TRIAL" | "EM_DIA" | "VENCIDA" | "CANCELADA"
) {
  await prisma.empresa.update({
    where: { id: empresaId },
    data: { statusMensalidade: status },
  });

  revalidatePath(`/superadmin/empresas/${empresaId}`);
  revalidatePath("/superadmin");
}

export async function salvarTipo(empresaId: string, fd: FormData) {
  const tipo = fd.get("tipo") as TipoEmpresa;

  await prisma.empresa.update({
    where: { id: empresaId },
    data: { tipo },
  });

  revalidatePath(`/superadmin/empresas/${empresaId}`);
}
