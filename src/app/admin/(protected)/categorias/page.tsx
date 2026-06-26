import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { criarCategoria, atualizarCategoria, excluirCategoria } from "./actions";
import ConfirmDeleteButton from "../_components/ConfirmDeleteButton";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const session = await auth();

  const categorias = await prisma.categoria.findMany({
    where: { empresaId: session!.user.empresaId },
    include: { _count: { select: { produtos: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categorias</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Nova Categoria
        </h2>
        <form action={criarCategoria} className="flex gap-3">
          <input
            name="nome"
            type="text"
            required
            placeholder="Ex: Pizzas, Bebidas..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            + Adicionar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {categorias.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">
            Nenhuma categoria criada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categorias.map((categoria) => (
              <li
                key={categoria.id}
                className="flex items-center gap-3 px-5 py-3"
              >
                <form
                  action={atualizarCategoria.bind(null, categoria.id)}
                  className="flex-1 flex gap-2"
                >
                  <input
                    name="nome"
                    type="text"
                    defaultValue={categoria.nome}
                    required
                    className="flex-1 px-3 py-1.5 border border-transparent hover:border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2"
                  >
                    Salvar
                  </button>
                </form>

                <span className="text-xs text-gray-400 whitespace-nowrap">
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
