import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Copy, ImageOff, PackageSearch } from "lucide-react";
import { toggleProdutoAtivo, duplicarProduto, excluirProduto } from "./actions";
import ConfirmDeleteButton from "../_components/ConfirmDeleteButton";
import SearchInput from "./_components/SearchInput";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth();
  const { search } = await searchParams;
  const termo = search?.trim().toLowerCase() ?? "";

  const produtos = await prisma.produto.findMany({
    where: {
      empresaId: session!.user.empresaId,
      ...(termo
        ? {
            OR: [
              { nome: { contains: termo, mode: "insensitive" } },
              { descricao: { contains: termo, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { categoria: true },
    orderBy: [{ categoria: { nome: "asc" } }, { nome: "asc" }],
  });

  const porCategoria = new Map<string, { nome: string; items: typeof produtos }>();
  for (const p of produtos) {
    if (!porCategoria.has(p.categoriaId)) {
      porCategoria.set(p.categoriaId, { nome: p.categoria.nome, items: [] });
    }
    porCategoria.get(p.categoriaId)!.items.push(p);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produtos</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {produtos.length} produto{produtos.length !== 1 ? "s" : ""}
            {!termo && porCategoria.size > 0 &&
              ` · ${porCategoria.size} categoria${porCategoria.size !== 1 ? "s" : ""}`}
            {termo && <span className="ml-1 text-blue-600 dark:text-blue-400">para "{search}"</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Suspense>
            <SearchInput />
          </Suspense>
          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Novo Produto</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </div>
      </div>

      {/* Sem resultado de busca */}
      {termo && produtos.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 text-center py-16">
          <PackageSearch size={36} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
            Nenhum produto encontrado para "{search}"
          </p>
          <Link href="/admin/produtos" className="text-blue-600 text-sm mt-2 inline-block">
            Limpar busca
          </Link>
        </div>
      )}

      {/* Sem produtos cadastrados */}
      {!termo && produtos.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 text-center py-16 text-gray-400 dark:text-slate-500">
          <p className="text-sm">Nenhum produto cadastrado ainda.</p>
          <Link href="/admin/produtos/novo" className="text-blue-600 text-sm mt-2 inline-block">
            Cadastrar primeiro produto
          </Link>
        </div>
      )}

      {/* Lista por categoria */}
      {produtos.length > 0 && (
        <div className="space-y-5">
          {Array.from(porCategoria.values()).map(({ nome, items }) => (
            <div
              key={nome}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden"
            >
              {/* Header categoria */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700/50">
                <h2 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                  {nome}
                </h2>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Tabela com scroll horizontal em mobile */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                    {items.map((produto) => (
                      <tr
                        key={produto.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors group"
                      >
                        {/* Imagem */}
                        <td className="pl-4 sm:pl-5 pr-3 py-3 w-14">
                          {produto.imagemUrl ? (
                            <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={produto.imagemUrl}
                                alt={produto.nome}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center border border-gray-100 dark:border-slate-600 shrink-0">
                              <ImageOff size={14} className="text-gray-300 dark:text-slate-500" />
                            </div>
                          )}
                        </td>

                        {/* Nome + descrição */}
                        <td className="px-3 py-3">
                          <p className="font-medium text-gray-900 dark:text-white leading-snug">
                            {produto.nome}
                          </p>
                          {produto.descricao && (
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate max-w-[200px] sm:max-w-sm">
                              {produto.descricao}
                            </p>
                          )}
                        </td>

                        {/* Preço */}
                        <td className="px-3 py-3 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
                        </td>

                        {/* Toggle ativo */}
                        <td className="px-3 py-3 text-center">
                          <form action={toggleProdutoAtivo.bind(null, produto.id, produto.ativo)}>
                            <button
                              type="submit"
                              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap ${
                                produto.ativo
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                                  : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                              }`}
                            >
                              {produto.ativo ? "Ativo" : "Inativo"}
                            </button>
                          </form>
                        </td>

                        {/* Ações */}
                        <td className="pl-3 pr-4 sm:pr-5 py-3">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/admin/produtos/${produto.id}/editar`}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Pencil size={14} />
                            </Link>
                            <form action={duplicarProduto.bind(null, produto.id)}>
                              <button
                                type="submit"
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Duplicar produto"
                              >
                                <Copy size={14} />
                              </button>
                            </form>
                            <ConfirmDeleteButton
                              action={excluirProduto.bind(null, produto.id)}
                              message="Excluir este produto?"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-xs"
                            >
                              ✕
                            </ConfirmDeleteButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
