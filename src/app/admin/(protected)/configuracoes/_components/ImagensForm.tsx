"use client";

import { useState, useTransition } from "react";
import ImageUpload from "../../_components/ImageUpload";
import { salvarImagens } from "../actions";

export default function ImagensForm({
  currentPerfil,
  currentBanner,
}: {
  currentPerfil?: string | null;
  currentBanner?: string | null;
}) {
  const [perfilUrl, setPerfilUrl] = useState(currentPerfil ?? "");
  const [bannerUrl, setBannerUrl] = useState(currentBanner ?? "");
  const [isPending, startTransition] = useTransition();
  const [salvo, setSalvo] = useState(false);

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData();
      fd.append("imagemPerfil", perfilUrl);
      fd.append("imagemBanner", bannerUrl);
      await salvarImagens(fd);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSalvar} className="space-y-5">
      <ImageUpload
        name="imagemPerfil"
        currentUrl={currentPerfil}
        label="Logo / Foto de Perfil"
        variant="square"
        onUrlChange={setPerfilUrl}
      />
      <ImageUpload
        name="imagemBanner"
        currentUrl={currentBanner}
        label="Banner da Loja"
        variant="banner"
        onUrlChange={setBannerUrl}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {isPending ? "Salvando..." : "Salvar Imagens"}
        </button>
        {salvo && <span className="text-sm text-green-600 font-medium">Salvo!</span>}
      </div>
    </form>
  );
}
