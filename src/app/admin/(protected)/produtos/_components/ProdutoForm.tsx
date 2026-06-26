"use client";

import Link from "next/link";
import ImageUpload from "../../_components/ImageUpload";

type Categoria = { id: string; nome: string };

type Props = {
  action: (formData: FormData) => Promise<void>;
  categorias: Categoria[];
  defaults?: {
    nome?: string;
    descricao?: string;
    preco?: string;
    categoriaId?: string;
    imagemUrl?: string | null;
  };
  submitLabel: string;
};

export default function ProdutoForm({
  action,
  categorias,
  defaults = {},
  submitLabel,
}: Props) {
  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          name="nome"
          type="text"
          required
          defaultValue={defaults.nome}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          name="descricao"
          rows={3}
          defaultValue={defaults.descricao}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preço (R$) <span className="text-red-500">*</span>
          </label>
          <input
            name="preco"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaults.preco}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria <span className="text-red-500">*</span>
          </label>
          <select
            name="categoriaId"
            required
            defaultValue={defaults.categoriaId}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecione...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ImageUpload
        name="imagemUrl"
        currentUrl={defaults.imagemUrl}
        label="Foto do Produto"
        variant="square"
      />

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {submitLabel}
        </button>
        <Link
          href="/admin/produtos"
          className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
