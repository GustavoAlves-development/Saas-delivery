import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { atualizarProduto } from "../../actions";
import ProdutoForm from "../../_components/ProdutoForm";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const [produto, categorias, empresa] = await Promise.all([
    prisma.produto.findUnique({
      where: { id, empresaId: session!.user.empresaId },
    }),
    prisma.categoria.findMany({
      where: { empresaId: session!.user.empresaId },
      orderBy: { nome: "asc" },
    }),
    prisma.empresa.findUnique({
      where: { id: session!.user.empresaId },
      select: { tipo: true },
    }),
  ]);

  if (!produto) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/produtos" className="text-sm text-gray-500 hover:text-gray-700">
          ← Produtos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ProdutoForm
          action={atualizarProduto.bind(null, id)}
          categorias={categorias}
          tipoEmpresa={empresa?.tipo}
          defaults={{
            nome: produto.nome,
            descricao: produto.descricao ?? "",
            preco: Number(produto.preco).toFixed(2),
            precoMedio: produto.precoMedio ? Number(produto.precoMedio).toFixed(2) : undefined,
            categoriaId: produto.categoriaId,
            imagemUrl: produto.imagemUrl,
          }}
          submitLabel="Salvar Alterações"
        />
      </div>
    </div>
  );
}
