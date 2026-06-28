"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";

type Props = {
  name: string;
  currentUrl?: string | null;
  label: string;
  variant?: "square" | "banner" | "mini";
  onUrlChange?: (url: string) => void;
};

export default function ImageUpload({
  name,
  currentUrl,
  label,
  variant = "square",
  onUrlChange,
}: Props) {
  const [url, setUrl] = useState(currentUrl ?? "");

  function updateUrl(newUrl: string) {
    setUrl(newUrl);
    onUrlChange?.(newUrl);
  }
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("file", file);
    form.append("variant", apiVariant);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar");
      updateUrl(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  }

  const isBanner = variant === "banner";
  const isMini = variant === "mini";
  const apiVariant = isMini ? "square" : (variant ?? "square");
  const sizeClass = isBanner ? "h-36 w-full" : isMini ? "h-12 w-12" : "h-28 w-28";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />

      <div
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 overflow-hidden group transition-colors ${
          url
            ? "border-gray-200 hover:border-blue-400"
            : "border-dashed border-gray-300 hover:border-blue-400 bg-gray-50"
        } ${sizeClass}`}
      >
        {url ? (
          <>
            <Image
              src={url}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload size={20} className="text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-400">
            <Upload size={isMini ? 14 : 20} />
            {!isMini && (
              <span className="text-xs">
                {uploading ? "Enviando..." : "Clique para enviar"}
              </span>
            )}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs text-gray-600 animate-pulse">Enviando...</span>
          </div>
        )}
      </div>

      {url && (
        <button
          type="button"
          onClick={() => updateUrl("")}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-1.5"
        >
          <X size={12} /> Remover imagem
        </button>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
