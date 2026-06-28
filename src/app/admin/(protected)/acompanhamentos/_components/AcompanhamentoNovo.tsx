"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import ImageUpload from "../../_components/ImageUpload";
import { criarAcompanhamento } from "../actions";

const inp =
  "px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200";

export default function AcompanhamentoNovo() {
  const [imagemUrl, setImagemUrl] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("imagemUrl", imagemUrl);
    const form = e.currentTarget;
    startTransition(async () => {
      await criarAcompanhamento(fd);
      form.reset();
      setImagemUrl("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        name="imagemUrl"
        currentUrl={imagemUrl || null}
        label="Foto do adicional (opcional)"
        variant="mini"
        onUrlChange={setImagemUrl}
      />
      <div className="flex gap-3">
        <input
          name="nome"
          type="text"
          required
          placeholder="Ex: Milho"
          className={`flex-1 ${inp}`}
        />
        <input
          name="preco"
          type="number"
          step="0.01"
          min="0"
          defaultValue="0"
          placeholder="0,00"
          className={`w-28 ${inp}`}
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm whitespace-nowrap"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Adicionar
        </button>
      </div>
    </form>
  );
}
