"use client";

import { useState, useTransition } from "react";
import { Save, CheckCircle2 } from "lucide-react";
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
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm"
        >
          <Save size={15} />
          {isPending ? "Salvando…" : "Salvar Imagens"}
        </button>
        {salvo && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <CheckCircle2 size={15} />
            Salvo!
          </span>
        )}
      </div>
    </form>
  );
}
