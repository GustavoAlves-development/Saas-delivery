import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ ids: [] }, { status: 401 });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const pedidos = await prisma.pedido.findMany({
    where: {
      empresaId: session.user.empresaId,
      criadoEm: { gte: hoje },
    },
    select: { id: true },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json({ ids: pedidos.map((p) => p.id) });
}
