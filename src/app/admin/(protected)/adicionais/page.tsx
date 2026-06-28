import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AcompanhamentoNovo from "../acompanhamentos/_components/AcompanhamentoNovo";
import AcompanhamentoItem from "../acompanhamentos/_components/AcompanhamentoItem";

export const dynamic = "force-dynamic";

export default async function AdicionaisPage() {
  const session = await auth();

  const adicionais = await prisma.acompanhamento.findMany({
    where: { empresaId: session!.user.empresaId, tipo: "ADICIONAL" },
    orderBy: { nome: "asc" },
  });

  const serialized = adicionais.map((a) => ({
    id: a.id,
    nome: a.nome,
    preco: Number(a.preco).toFixed(2),
    ativo: a.ativo,
    imagemUrl: a.imagemUrl,
  }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Adicionais</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Ingredientes extras por item (milho, catupiry, ovo, hamburguer…).
      </p>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-4">Novo Adicional</h2>
        <AcompanhamentoNovo tipo="ADICIONAL" />
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">Preço 0,00 = gratuito. Aparecem no configurador de cada item.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        {serialized.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-10">
            Nenhum adicional cadastrado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {serialized.map((item) => (
              <AcompanhamentoItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
