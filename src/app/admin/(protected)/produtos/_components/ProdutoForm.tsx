"use client";

import Link from "next/link";
import { Save, ArrowLeft } from "lucide-react";
import ImageUpload from "../../_components/ImageUpload";

type Categoria = { id: string; nome: string };

type Props = {
  action: (formData: FormData) => Promise<void>;
  categorias: Categoria[];
  tipoEmpresa?: string;
  defaults?: {
    nome?: string;
    descricao?: string;
    preco?: string;
    precoMedio?: string;
    precoMini?: string;
    categoriaId?: string;
    imagemUrl?: string | null;
  };
  submitLabel: string;
};

const inp =
  "w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
      {children}
    </p>
  );
}

export default function ProdutoForm({ action, categorias, tipoEmpresa, defaults = {}, submitLabel }: Props) {
  return (
    <form action={action} className="divide-y divide-slate-100 dark:divide-slate-700/50">

      {/* ── Informações Básicas ── */}
      <div className="pb-6 space-y-4">
        <SectionTitle>Informações Básicas</SectionTitle>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            name="nome"
            type="text"
            required
            defaultValue={defaults.nome}
            placeholder="Ex: X-Burguer Especial"
            className={inp}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
            Descrição
          </label>
          <textarea
            name="descricao"
            rows={3}
            defaultValue={defaults.descricao}
            placeholder="Ingredientes, diferenciais, tamanho…"
            className={`${inp} resize-none`}
          />
        </div>
      </div>

      {/* ── Preço & Categoria ── */}
      <div className="py-6 space-y-4">
        <SectionTitle>Preço & Categoria</SectionTitle>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              Preço Grande (R$) <span className="text-red-500">*</span>
            </label>
            <input
              name="preco"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={defaults.preco}
              placeholder="0,00"
              className={inp}
            />
          </div>

          {tipoEmpresa === "LANCHONETE" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Preço Médio — Pão de Dog (R$)
              </label>
              <input
                name="precoMedio"
                type="number"
                step="0.01"
                min="0"
                defaultValue={defaults.precoMedio}
                placeholder="Deixe vazio se não tiver"
                className={inp}
              />
            </div>
          )}
        </div>

        {tipoEmpresa === "LANCHONETE" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Preço Mini — Pão Pequeno (R$)
              </label>
              <input
                name="precoMini"
                type="number"
                step="0.01"
                min="0"
                defaultValue={defaults.precoMini}
                placeholder="Deixe vazio se não tiver"
                className={inp}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
            Categoria <span className="text-red-500">*</span>
          </label>
          <select
            name="categoriaId"
            required
            defaultValue={defaults.categoriaId}
            className={`${inp} cursor-pointer`}
          >
            <option value="">Selecione…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Imagem ── */}
      <div className="py-6">
        <SectionTitle>Imagem do Produto</SectionTitle>
        <ImageUpload
          name="imagemUrl"
          currentUrl={defaults.imagemUrl}
          label="Foto do Produto"
          variant="square"
        />
      </div>

      {/* ── Ações ── */}
      <div className="pt-6 flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm"
        >
          <Save size={15} />
          {submitLabel}
        </button>
        <Link
          href="/admin/produtos"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
        >
          <ArrowLeft size={14} />
          Cancelar
        </Link>
      </div>

    </form>
  );
}
