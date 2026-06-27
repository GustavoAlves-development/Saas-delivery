import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ExternalLink, Save } from "lucide-react";
import { atualizarConfiguracoesLoja } from "./actions";
import ImagensForm from "./_components/ImagensForm";
import HorarioFuncionamento from "./_components/HorarioFuncionamento";
import PaletaForm from "./_components/PaletaForm";

export const dynamic = "force-dynamic";

const inp =
  "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default async function ConfiguracoesPage() {
  const session = await auth();

  const empresa = await prisma.empresa.findUnique({
    where: { id: session!.user.empresaId },
  });

  if (!empresa) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações da Loja</h1>

      {/* Dados básicos */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">Dados da Loja</h2>
        <form action={atualizarConfiguracoesLoja} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Nome da Loja
            </label>
            <input
              name="nome"
              type="text"
              required
              defaultValue={empresa.nome}
              className={inp}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              WhatsApp (com DDI e DDD, apenas números)
            </label>
            <input
              name="telefoneWhatsapp"
              type="text"
              required
              placeholder="5511999999999"
              defaultValue={empresa.telefoneWhatsapp}
              className={inp}
            />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Ex: 5511999999999</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Taxa de Entrega (R$)
            </label>
            <input
              name="taxaEntrega"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={Number(empresa.taxaEntrega).toFixed(2)}
              className={inp}
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm"
          >
            <Save size={15} />
            Salvar Dados
          </button>
        </form>
      </section>

      {/* Imagens */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">Imagens</h2>
        <ImagensForm
          currentPerfil={empresa.imagemPerfil}
          currentBanner={empresa.imagemBanner}
        />
      </section>

      {/* Paleta de cores */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-1">Cores da Loja</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          Escolha a paleta de cores exibida para os clientes no cardápio.
        </p>
        <PaletaForm currentPaleta={empresa.paletaCor} />
      </section>

      {/* Horário de funcionamento */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">
          Horário de Funcionamento
        </h2>
        <HorarioFuncionamento horarioAtual={empresa.horarioFuncionamento} />
      </section>

      {/* Link da loja */}
      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50 p-4">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Link público da loja</p>
        <a
          href={`/loja/${empresa.slug}`}
          target="_blank"
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          /loja/{empresa.slug}
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
