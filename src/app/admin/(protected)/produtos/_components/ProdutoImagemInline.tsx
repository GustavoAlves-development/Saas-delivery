"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, ImageOff, Loader2 } from "lucide-react";
import { atualizarImagemProduto } from "../actions";

export default function ProdutoImagemInline({
  produtoId,
  imagemUrl: inicial,
  nome,
}: {
  produtoId: string;
  imagemUrl: string | null;
  nome: string;
}) {
  const [url, setUrl] = useState(inicial);
  const [uploading, startUpload] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    startUpload(async () => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("variant", "square");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const { url: novaUrl } = await res.json();

      setUrl(novaUrl);
      await atualizarImagemProduto(produtoId, novaUrl);
    });

    // reset so same file can be selected again
    e.target.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Clique para trocar a imagem"
        className="relative w-11 h-11 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 shrink-0 group/img focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={url} alt={nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
            <ImageOff size={14} className="text-gray-300 dark:text-slate-500" />
          </div>
        )}

        {/* overlay */}
        <span
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            uploading
              ? "opacity-100 bg-black/50"
              : "opacity-0 group-hover/img:opacity-100 bg-black/40"
          }`}
        >
          {uploading ? (
            <Loader2 size={14} className="text-white animate-spin" />
          ) : (
            <Camera size={14} className="text-white" />
          )}
        </span>
      </button>
    </>
  );
}
