"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function criarEmpresa(fd: FormData) {
  const nome = (fd.get("nome") as string).trim();
  const slug = (fd.get("slug") as string).trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const telefoneWhatsapp = (fd.get("telefoneWhatsapp") as string).trim();
  const taxaEntrega = parseFloat((fd.get("taxaEntrega") as string) || "0");
  const adminEmail = (fd.get("adminEmail") as string).trim();
  const adminSenha = fd.get("adminSenha") as string;
  const plano = (fd.get("plano") as string) || "basico";
  const valorMensalidade = parseFloat((fd.get("valorMensalidade") as string) || "99.90");
  const vencimentoRaw = fd.get("vencimentoMensalidade") as string;
  const statusMensalidade = (fd.get("statusMensalidade") as string) || "TRIAL";

  const senhaHash = await bcrypt.hash(adminSenha, 12);

  const empresa = await prisma.empresa.create({
    data: {
      nome,
      slug,
      telefoneWhatsapp,
      taxaEntrega,
      plano,
      valorMensalidade,
      statusMensalidade: statusMensalidade as "TRIAL" | "EM_DIA" | "VENCIDA" | "CANCELADA",
      vencimentoMensalidade: vencimentoRaw ? new Date(vencimentoRaw) : null,
      usuarios: {
        create: {
          email: adminEmail,
          senha: senhaHash,
        },
      },
    },
  });

  redirect(`/superadmin/empresas/${empresa.id}`);
}
