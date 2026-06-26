import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Vitrine from "./_components/Vitrine";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const empresa = await prisma.empresa.findUnique({ where: { slug } });
  return { title: empresa?.nome ?? "Loja" };
}

export default async function LojaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const empresa = await prisma.empresa.findUnique({
    where: { slug },
  });

  if (!empresa) notFound();

  const categorias = await prisma.categoria.findMany({
    where: { empresaId: empresa.id },
    include: {
      produtos: {
        where: { ativo: true },
        orderBy: { nome: "asc" },
      },
    },
    orderBy: { nome: "asc" },
  });

  const categoriasComProdutos = categorias.filter((c) => c.produtos.length > 0);

  const serialized = {
    ...empresa,
    taxaEntrega: empresa.taxaEntrega.toString(),
  };

  const categoriasSerializadas = categoriasComProdutos.map((c) => ({
    ...c,
    produtos: c.produtos.map((p) => ({
      ...p,
      preco: p.preco.toString(),
    })),
  }));

  return <Vitrine empresa={serialized} categorias={categoriasSerializadas} />;
}
