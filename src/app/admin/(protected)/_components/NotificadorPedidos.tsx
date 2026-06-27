"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff } from "lucide-react";

export default function NotificadorPedidos() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const knownIdsRef = useRef<Set<string> | null>(null);
  const [habilitado, setHabilitado] = useState(false);
  const [novos, setNovos] = useState(0);
  const router = useRouter();

  function tocarChime() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    // Três tons ascendentes — som de "novo pedido"
    const tom = (freq: number, delay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.9);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.9);
    };
    tom(880, 0);
    tom(1100, 0.2);
    tom(1320, 0.4);
  }

  async function habilitar() {
    const ctx = new AudioContext();
    await ctx.resume();
    audioCtxRef.current = ctx;
    setHabilitado(true);
    tocarChime(); // beep de confirmação
  }

  const verificar = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pedidos/novos");
      if (!res.ok) return;
      const { ids } = (await res.json()) as { ids: string[] };

      // Primeira carga: apenas registra IDs existentes, sem alertar
      if (knownIdsRef.current === null) {
        knownIdsRef.current = new Set(ids);
        return;
      }

      const recentes = ids.filter((id) => !knownIdsRef.current!.has(id));
      if (recentes.length > 0) {
        recentes.forEach((id) => knownIdsRef.current!.add(id));
        setNovos((n) => n + recentes.length);
        if (habilitado) tocarChime();
      }
    } catch {
      // silencia falhas de rede
    }
  }, [habilitado]);

  useEffect(() => {
    verificar();
    const id = setInterval(verificar, 20_000);
    return () => clearInterval(id);
  }, [verificar]);

  function handleClick() {
    if (!habilitado) {
      habilitar();
      return;
    }
    // Quando habilitado: navega para pedidos e limpa o badge
    if (novos > 0) {
      setNovos(0);
      router.push("/admin/pedidos");
    }
  }

  return (
    <button
      onClick={handleClick}
      title={
        !habilitado
          ? "Clique para ativar alertas sonoros de novos pedidos"
          : novos > 0
          ? `${novos} novo${novos > 1 ? "s" : ""} pedido${novos > 1 ? "s" : ""} — clique para ver`
          : "Alertas sonoros ativos"
      }
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
        !habilitado
          ? "text-amber-400 hover:bg-gray-800 hover:text-amber-300"
          : "text-green-400 hover:bg-gray-800"
      }`}
    >
      {habilitado ? (
        <Bell size={18} className={novos > 0 ? "animate-bounce" : ""} />
      ) : (
        <BellOff size={18} />
      )}
      <span>{habilitado ? "Alertas ativos" : "Habilitar alertas"}</span>

      {novos > 0 && (
        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {novos > 9 ? "9+" : novos}
        </span>
      )}
    </button>
  );
}
