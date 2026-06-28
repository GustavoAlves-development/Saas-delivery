"use client";

import { useState, useTransition } from "react";
import { Save, Loader2 } from "lucide-react";
import ImageUpload from "../../_components/ImageUpload";
import ConfirmDeleteButton from "../../_components/ConfirmDeleteButton";
import {
  atualizarAcompanhamento,
  excluirAcompanhamento,
  toggleAcompanhamentoAtivo,
} from "../actions";

type Item = {
  id: string;
  nome: string;
  preco: string;
  ativo: boolean;
  imagemUrl: string | null;
};

const inp =
  "px-3 py-1.5 border border-transparent dark:border-transparent hover:border-gray-300 dark:hover:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";

export default function AcompanhamentoItem({ item }: { item: Item }) {
  const [imagemUrl, setImagemUrl] = useState(item.imagemUrl ?? "");
  const [saving, startSave] = useTransition();
  const [toggling, startToggle] = useTransition();

  function handleSalvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("imagemUrl", imagemUrl);
    startSave(() => atualizarAcompanhamento(item.id, fd));
  }

  return (
    <li className="flex items-center gap-3 px-5 py-3">
      {/* Thumbnail */}
      <div className="flex-shrink-0" title="Clique para trocar a imagem">
        <ImageUpload
          name="imagemUrl"
          currentUrl={imagemUrl || null}
          label=""
          variant="mini"
          onUrlChange={setImagemUrl}
        />
      </div>

      <form onSubmit={handleSalvar} className="flex-1 flex gap-2">
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
          defaultValue={item.preco}
          className={`w-24 ${inp}`}
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap disabled:opacity-60"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Salvar
        </button>
      </form>

      <button
        onClick={() => startToggle(() => toggleAcompanhamentoAtivo(item.id, item.ativo))}
        disabled={toggling}
        className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
          item.ativo
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200"
            : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200"
        }`}
      >
        {item.ativo ? "Ativo" : "Inativo"}
      </button>

      <ConfirmDeleteButton
        action={excluirAcompanhamento.bind(null, item.id)}
        message="Excluir este acompanhamento?"
        className="text-gray-400 hover:text-red-500 text-xs transition-colors"
      >
        ✕
      </ConfirmDeleteButton>
    </li>
  );
}
