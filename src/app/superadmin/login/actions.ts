"use server";

import { prisma } from "@/lib/prisma";
import { createSASession } from "@/lib/superadmin-session";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function loginSuperAdmin(fd: FormData) {
  const email = fd.get("email") as string;
  const senha = fd.get("senha") as string;

  const admin = await prisma.superAdmin.findUnique({ where: { email } });
  if (!admin) {
    redirect("/superadmin/login?erro=1");
  }

  const ok = await bcrypt.compare(senha, admin.senha);
  if (!ok) {
    redirect("/superadmin/login?erro=1");
  }

  await createSASession(admin.id);
  redirect("/superadmin");
}
