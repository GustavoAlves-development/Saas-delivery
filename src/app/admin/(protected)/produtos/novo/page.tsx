import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { criarProduto } from "../actions";
import ProdutoForm from "../_components/ProdutoForm";

export default async function NovoProdutoPage() {
  const session = await auth();

  const [categorias, empresa] = await Promise.all([
    prisma.categoria.findMany({
      where: { empresaId: session!.user.empresaId },
      orderBy: { nome: "asc" },
    }),
    prisma.empresa.findUnique({
      where: { id: session!.user.empresaId },
      select: { tipo: true },
    }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/produtos" className="text-sm text-gray-500 hover:text-gray-700">
          ← Produtos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ProdutoForm
          action={criarProduto}
          categorias={categorias}
          tipoEmpresa={empresa?.tipo}
          submitLabel="Salvar Produto"
        />
      </div>
    </div>
  );
}
