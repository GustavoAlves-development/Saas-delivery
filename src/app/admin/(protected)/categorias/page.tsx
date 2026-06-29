import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChevronDown, ChevronUp, Plus, Save } from "lucide-react";
import { criarCategoria, atualizarCategoria, excluirCategoria, moverCategoria } from "./actions";
import ConfirmDeleteButton from "../_components/ConfirmDeleteButton";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const session = await auth();

  const categorias = await prisma.categoria.findMany({
    where: { empresaId: session!.user.empresaId },
    include: { _count: { select: { produtos: true } } },
    orderBy: { ordem: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Categorias</h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">
          Nova Categoria
        </h2>
        <form action={criarCategoria} className="flex gap-3">
          <input
            name="nome"
            type="text"
            required
            placeholder="Ex: Pizzas, Bebidas…"
            className="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm whitespace-nowrap"
          >
            <Plus size={14} />
            Adicionar
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        {categorias.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-10">
            Nenhuma categoria criada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {categorias.map((categoria, idx) => (
              <li
                key={categoria.id}
                className="flex items-center gap-3 px-5 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <form action={moverCategoria.bind(null, categoria.id, "cima")}>
                    <button
                      type="submit"
                      disabled={idx === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </form>
                  <form action={moverCategoria.bind(null, categoria.id, "baixo")}>
                    <button
                      type="submit"
                      disabled={idx === categorias.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </form>
                </div>

                <form
                  action={atualizarCategoria.bind(null, categoria.id)}
                  className="flex-1 flex gap-2"
                >
                  <input
                    name="nome"
                    type="text"
                    defaultValue={categoria.nome}
                    required
                    className="flex-1 px-3 py-1.5 border border-transparent dark:border-transparent hover:border-gray-300 dark:hover:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-transparent dark:bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap"
                  >
                    <Save size={12} />
                    Salvar
                  </button>
                </form>

                <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                  {categoria._count.produtos} produto
                  {categoria._count.produtos !== 1 ? "s" : ""}
                </span>

                <ConfirmDeleteButton
                  action={excluirCategoria.bind(null, categoria.id)}
                  message="Excluir esta categoria?"
                  className="text-gray-400 hover:text-red-500 text-xs transition-colors"
                >
                  ✕
                </ConfirmDeleteButton>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
