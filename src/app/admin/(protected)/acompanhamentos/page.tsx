import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Plus, Save } from "lucide-react";
import {
  criarAcompanhamento,
  atualizarAcompanhamento,
  excluirAcompanhamento,
  toggleAcompanhamentoAtivo,
} from "./actions";
import ConfirmDeleteButton from "../_components/ConfirmDeleteButton";

export const dynamic = "force-dynamic";

export default async function AcompanhamentosPage() {
  const session = await auth();

  const acompanhamentos = await prisma.acompanhamento.findMany({
    where: { empresaId: session!.user.empresaId },
    orderBy: { nome: "asc" },
  });

  const inp =
    "px-3 py-1.5 border border-transparent dark:border-transparent hover:border-gray-300 dark:hover:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Acompanhamentos</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Itens opcionais exibidos no checkout (molhos, bebidas, petiscos…).
      </p>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">Novo Acompanhamento</h2>
        <form action={criarAcompanhamento} className="flex gap-3">
          <input
            name="nome"
            type="text"
            required
            placeholder="Ex: Molho barbecue"
            className="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          <input
            name="preco"
            type="number"
            step="0.01"
            min="0"
            defaultValue="0"
            placeholder="0,00"
            className="w-28 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm whitespace-nowrap"
          >
            <Plus size={14} />
            Adicionar
          </button>
        </form>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">Preço 0,00 = gratuito</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        {acompanhamentos.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-10">
            Nenhum acompanhamento cadastrado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {acompanhamentos.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                <form
                  action={atualizarAcompanhamento.bind(null, item.id)}
                  className="flex-1 flex gap-2"
                >
                  <input
                    name="nome"
                    type="text"
                    defaultValue={item.nome}
                    required
                    className={`flex-1 ${inp}`}
                  />
                  <input
                    name="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={Number(item.preco).toFixed(2)}
                    className={`w-24 ${inp}`}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap"
                  >
                    <Save size={12} />
                    Salvar
                  </button>
                </form>

                <form action={toggleAcompanhamentoAtivo.bind(null, item.id, item.ativo)}>
                  <button
                    type="submit"
                    className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                      item.ativo
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {item.ativo ? "Ativo" : "Inativo"}
                  </button>
                </form>

                <ConfirmDeleteButton
                  action={excluirAcompanhamento.bind(null, item.id)}
                  message="Excluir este acompanhamento?"
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
