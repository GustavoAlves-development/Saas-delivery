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

  const [adicionais, acompanhamentos] = await Promise.all([
    prisma.acompanhamento.findMany({
      where: { empresaId: empresa.id, ativo: true, tipo: "ADICIONAL" },
      include: { categorias: true },
      orderBy: { nome: "asc" },
    }),
    prisma.acompanhamento.findMany({
      where: { empresaId: empresa.id, ativo: true, tipo: "ACOMPANHAMENTO" },
      orderBy: { nome: "asc" },
    }),
  ]);

  const serialized = {
    ...empresa,
    taxaEntrega: empresa.taxaEntrega.toString(),
    paletaCor: empresa.paletaCor,
    tipo: empresa.tipo,
  };

  const categoriasSerializadas = categoriasComProdutos.map((c) => ({
    ...c,
    produtos: c.produtos.map((p) => ({
      ...p,
      preco: p.preco.toString(),
      precoMedio: p.precoMedio ? p.precoMedio.toString() : null,
    })),
  }));

  const serializeAcomp = (a: typeof acompanhamentos[0]) => ({
    id: a.id,
    nome: a.nome,
    preco: a.preco.toString(),
    imagemUrl: a.imagemUrl,
  });

  const serializeAdicional = (a: typeof adicionais[0]) => ({
    id: a.id,
    nome: a.nome,
    preco: a.preco.toString(),
    imagemUrl: a.imagemUrl,
    categoriaIds: a.categorias.map((c) => c.id),
  });

  return (
    <Vitrine
      empresa={serialized}
      categorias={categoriasSerializadas}
      adicionais={adicionais.map(serializeAdicional)}
      acompanhamentos={acompanhamentos.map(serializeAcomp)}
    />
  );
}
