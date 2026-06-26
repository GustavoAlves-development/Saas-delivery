import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { toggleProdutoAtivo, excluirProduto } from "./actions";
import ConfirmDeleteButton from "../_components/ConfirmDeleteButton";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const session = await auth();

  const produtos = await prisma.produto.findMany({
    where: { empresaId: session!.user.empresaId },
    include: { categoria: true },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {produtos.length} produto{produtos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Novo Produto
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {produtos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">Nenhum produto cadastrado ainda.</p>
            <Link
              href="/admin/produtos/novo"
              className="text-blue-600 text-sm mt-2 inline-block"
            >
              Cadastrar primeiro produto
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Produto</th>
                <th className="text-left px-5 py-3">Categoria</th>
                <th className="text-right px-5 py-3">Preço</th>
                <th className="text-center px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {produtos.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{produto.nome}</p>
                    {produto.descricao && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                        {produto.descricao}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {produto.categoria.nome}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-gray-900">
                    R$ {Number(produto.preco).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <form
                      action={toggleProdutoAtivo.bind(
                        null,
                        produto.id,
                        produto.ativo
                      )}
                    >
                      <button
                        type="submit"
                        className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                          produto.ativo
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {produto.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/produtos/${produto.id}/editar`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </Link>
                      <ConfirmDeleteButton
                        action={excluirProduto.bind(null, produto.id)}
                        message="Excluir este produto?"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs"
                      >
                        ✕
                      </ConfirmDeleteButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
