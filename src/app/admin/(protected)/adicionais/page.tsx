import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AcompanhamentoNovo from "../acompanhamentos/_components/AcompanhamentoNovo";
import AcompanhamentoItem from "../acompanhamentos/_components/AcompanhamentoItem";

export const dynamic = "force-dynamic";

export default async function AdicionaisPage() {
  const session = await auth();

  const [adicionais, categorias] = await Promise.all([
    prisma.acompanhamento.findMany({
      where: { empresaId: session!.user.empresaId, tipo: "ADICIONAL" },
      include: { categorias: true },
      orderBy: { nome: "asc" },
    }),
    prisma.categoria.findMany({
      where: { empresaId: session!.user.empresaId },
      orderBy: { nome: "asc" },
    }),
  ]);

  const categoriasSimples = categorias.map((c) => ({ id: c.id, nome: c.nome }));

  const serialized = adicionais.map((a) => ({
    id: a.id,
    nome: a.nome,
    preco: Number(a.preco).toFixed(2),
    ativo: a.ativo,
    imagemUrl: a.imagemUrl,
    categoriasVinculadas: a.categorias.map((c) => c.id),
  }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Adicionais</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Ingredientes extras por item (milho, catupiry, ovo…). Vincule às categorias onde devem aparecer.
      </p>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-4">Novo Adicional</h2>
        <AcompanhamentoNovo tipo="ADICIONAL" />
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
          Após criar, selecione as categorias para filtrar onde o adicional aparece.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        {serialized.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-10">
            Nenhum adicional cadastrado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {serialized.map((item) => (
              <AcompanhamentoItem
                key={item.id}
                item={item}
                categorias={categoriasSimples}
                categoriasVinculadas={item.categoriasVinculadas}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
