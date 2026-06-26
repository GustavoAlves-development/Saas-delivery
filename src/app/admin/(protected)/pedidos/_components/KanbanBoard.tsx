"use client";

import { useTransition } from "react";
import { StatusPedido } from "@/generated/prisma";
import { atualizarStatusPedido } from "../actions";
import { gerarLinkWhatsApp, mensagemDespacho } from "@/lib/whatsapp";

type ItemPedido = {
  id: string;
  nomeProduto: string;
  quantidade: number;
  preco: string | number;
};

type Pedido = {
  id: string;
  nomeCliente: string;
  telefoneCliente: string;
  endereco: string;
  formaPagamento: string;
  observacoes: string | null;
  total: string | number;
  status: StatusPedido;
  criadoEm: Date;
  itens: ItemPedido[];
};

const COLUNAS: { status: StatusPedido; label: string; cor: string }[] = [
  { status: "RECEBIDO", label: "Recebido", cor: "bg-blue-500" },
  { status: "EM_PREPARO", label: "Em Preparo", cor: "bg-amber-500" },
  { status: "DESPACHADO", label: "Despachado", cor: "bg-orange-500" },
  { status: "ENTREGUE", label: "Entregue", cor: "bg-green-500" },
  { status: "CANCELADO", label: "Cancelado", cor: "bg-gray-400" },
];

function formatarHora(date: Date) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function KanbanCard({ pedido }: { pedido: Pedido }) {
  const [isPending, startTransition] = useTransition();

  function handleAvancar(novoStatus: StatusPedido) {
    startTransition(() => atualizarStatusPedido(pedido.id, novoStatus));
  }

  function handleDespachar() {
    const mensagem = mensagemDespacho({
      nomeCliente: pedido.nomeCliente,
      telefoneCliente: pedido.telefoneCliente,
      endereco: pedido.endereco,
      total: pedido.total,
      itens: pedido.itens,
    });
    const link = gerarLinkWhatsApp(pedido.telefoneCliente, mensagem);
    window.open(link, "_blank");
    startTransition(() => atualizarStatusPedido(pedido.id, "DESPACHADO"));
  }

  function handleCancelar() {
    if (!confirm("Cancelar este pedido?")) return;
    startTransition(() => atualizarStatusPedido(pedido.id, "CANCELADO"));
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3 ${isPending ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {pedido.nomeCliente}
          </p>
          <p className="text-xs text-gray-500">{pedido.telefoneCliente}</p>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatarHora(pedido.criadoEm)}
        </span>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <p className="font-medium">Itens:</p>
        {pedido.itens.map((item) => (
          <p key={item.id}>
            {item.quantidade}x {item.nomeProduto}
          </p>
        ))}
      </div>

      <div className="text-xs text-gray-500 truncate">{pedido.endereco}</div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="text-sm font-bold text-gray-900">
          R$ {Number(pedido.total).toFixed(2)}
        </span>
        <span className="text-xs text-gray-400">{pedido.formaPagamento}</span>
      </div>

      {pedido.observacoes && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">
          {pedido.observacoes}
        </p>
      )}

      <div className="space-y-1.5">
        {pedido.status === "RECEBIDO" && (
          <button
            onClick={() => handleAvancar("EM_PREPARO")}
            disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
          >
            Iniciar Preparo
          </button>
        )}
        {pedido.status === "EM_PREPARO" && (
          <button
            onClick={handleDespachar}
            disabled={isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
          >
            Despachar + WhatsApp
          </button>
        )}
        {pedido.status === "DESPACHADO" && (
          <button
            onClick={() => handleAvancar("ENTREGUE")}
            disabled={isPending}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
          >
            Confirmar Entrega
          </button>
        )}
        {!["ENTREGUE", "CANCELADO"].includes(pedido.status) && (
          <button
            onClick={handleCancelar}
            disabled={isPending}
            className="w-full border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium py-1.5 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ pedidos }: { pedidos: Pedido[] }) {
  const porStatus = (status: StatusPedido) =>
    pedidos.filter((p) => p.status === status);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUNAS.map(({ status, label, cor }) => {
        const cards = porStatus(status);
        return (
          <div key={status} className="flex-shrink-0 w-72">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2.5 h-2.5 rounded-full ${cor}`} />
              <h3 className="font-semibold text-gray-700 text-sm">{label}</h3>
              <span className="ml-auto bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
                {cards.length}
              </span>
            </div>
            <div className="space-y-3 min-h-20">
              {cards.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">
                  Nenhum pedido
                </p>
              )}
              {cards.map((pedido) => (
                <KanbanCard key={pedido.id} pedido={pedido} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
