import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { empresaId, nomeCliente, telefoneCliente, endereco, formaPagamento, observacoes, total, itens } = body;

    if (!empresaId || !nomeCliente || !endereco || !itens?.length) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const pedido = await prisma.pedido.create({
      data: {
        empresaId,
        nomeCliente,
        telefoneCliente: telefoneCliente ?? "",
        endereco,
        formaPagamento,
        observacoes: observacoes || null,
        total,
        itens: {
          create: itens.map((i: { produtoId: string; nomeProduto: string; preco: string; quantidade: number }) => ({
            produtoId: i.produtoId,
            nomeProduto: i.nomeProduto,
            preco: parseFloat(i.preco),
            quantidade: i.quantidade,
          })),
        },
      },
    });

    return NextResponse.json({ id: pedido.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
