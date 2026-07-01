"use client";

import { useEffect, useRef, useTransition } from "react";
import { StatusPedido } from "@/generated/prisma";
import { atualizarStatusPedido } from "../actions";
import { gerarLinkWhatsApp, mensagemDespacho } from "@/lib/whatsapp";
import { Printer } from "lucide-react";

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

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function gerarComanda(pedido: Pedido, empresaNome: string) {
  const mm = "54mm";
  const pageW = "58mm";
  const dataHora = new Date(pedido.criadoEm).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const idCurto = pedido.id.slice(-6).toUpperCase();
  const itensHtml = pedido.itens
    .map((item) => {
      const sub = brl(item.quantidade * Number(item.preco));
      // nomeProduto format: "Nome (Tamanho · TipoPão) + Adicional1, Adicional2"
      const addMatch = item.nomeProduto.match(/^(.*?)\s*\+\s*(.+)$/);
      const semAdicionais = addMatch ? addMatch[1].trim() : item.nomeProduto;
      const adicionais = addMatch ? addMatch[2].trim() : "";
      const detMatch = semAdicionais.match(/^(.*?)\s*\((.+)\)$/);
      const nomeBase = detMatch ? detMatch[1].trim() : semAdicionais;
      const detalhes = detMatch ? detMatch[2].trim() : "";
      // detalhes: "Tamanho · TipoPão" — split on ·
      const partes = detalhes ? detalhes.split("·").map((p) => p.trim()) : [];
      const tamanho = partes[0] ?? "";
      const tipoPao = partes[1] ?? "";

      return `<div class="item-bloco">
  <div class="row"><span class="bold item-nome">${item.quantidade}x ${nomeBase}</span><span class="nowrap bold">${sub}</span></div>
  ${tamanho ? `<div class="item-detalhe">Tamanho: <span class="bold">${tamanho}</span></div>` : ""}
  ${tipoPao ? `<div class="item-detalhe">Pão: <span class="bold">${tipoPao}</span></div>` : ""}
  ${adicionais ? `<div class="item-detalhe">+ <span class="bold">${adicionais}</span></div>` : ""}
</div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Comanda #${idCurto}</title>
<style>
  @page { size: ${pageW} auto; margin: 4mm 3mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', Courier, monospace; font-size: 16px; line-height: 1.7; color: #000; background: #fff; width: ${mm}; }
  .center { text-align: center; } .bold { font-weight: bold; } .lg { font-size: 19px; } .sm { font-size: 13px; }
  .sep { border-top: 1px dashed #000; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; gap: 4px; }
  .item-nome { flex: 1; word-break: break-word; }
  .item-detalhe { padding-left: 10px; font-size: 15px; }
  .item-bloco { margin-bottom: 5px; }
  .nowrap { white-space: nowrap; }
  .gap { margin-top: 4px; } .gap2 { margin-top: 8px; }
</style>
</head>
<body>
<div class="center bold lg">${empresaNome}</div>
<div class="center gap">COMANDA DE PEDIDO</div>
<div class="center sm">#${idCurto} — ${dataHora}</div>
<div class="sep"></div>
<div class="bold">Cliente: ${pedido.nomeCliente}</div>
${pedido.telefoneCliente ? `<div>Tel: ${pedido.telefoneCliente}</div>` : ""}
<div class="bold gap">Endereço:</div>
<div class="bold">${pedido.endereco}</div>
<div class="sep"></div>
<div class="bold gap">ITENS:</div>
${itensHtml}
<div class="sep"></div>
<div class="row bold lg gap"><span>TOTAL</span><span>${brl(Number(pedido.total))}</span></div>
${(() => {
  const trocoMatch = pedido.formaPagamento.match(/troco p\/ R\$\s*([\d.,]+)/);
  if (!trocoMatch) return "";
  const trocoPara = parseFloat(trocoMatch[1].replace(",", "."));
  const troco = trocoPara - Number(pedido.total);
  return `<div class="row gap"><span>Dinheiro (recebido)</span><span class="nowrap bold">${brl(trocoPara)}</span></div>
<div class="row"><span>Troco</span><span class="nowrap bold">${brl(troco > 0 ? troco : 0)}</span></div>`;
})()}
<div class="sep"></div>
<div>Pagamento: <span class="bold">${pedido.formaPagamento.replace(/ — troco p\/ R\$\s*[\d.,]+/, "")}</span></div>
${pedido.observacoes ? `<div class="sep"></div><div class="bold">Obs:</div><div>${pedido.observacoes}</div>` : ""}
<div class="sep"></div>
<div class="center gap2">*** OBRIGADO ***</div>
<script>window.onload=function(){setTimeout(function(){window.print();window.onafterprint=function(){window.close()};},150)}</script>
</body></html>`;
}

function imprimirComanda(pedido: Pedido, empresaNome: string) {
  const html = gerarComanda(pedido, empresaNome);
  const w = window.open("", "_blank", "width=320,height=600,toolbar=0,menubar=0");
  if (!w) { alert("Permita pop-ups para imprimir a comanda."); return; }
  w.document.write(html);
  w.document.close();
}

function imprimirViaIframe(html: string, delayMs: number) {
  setTimeout(() => {
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      try { iframe.contentWindow?.print(); } catch { /* silencia */ }
      setTimeout(() => { try { document.body.removeChild(iframe); } catch { /* silencia */ } }, 4000);
    }, 300);
  }, delayMs);
}

function imprimirAutomatico(pedido: Pedido, empresaNome: string) {
  const html = gerarComanda(pedido, empresaNome);
  // Dois jobs separados: a impressora corta o papel entre eles
  imprimirViaIframe(html, 0);
  imprimirViaIframe(html, 5000);
}

function KanbanCard({ pedido, empresaNome, feedbackWhatsapp }: { pedido: Pedido; empresaNome: string; feedbackWhatsapp: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleAvancar(novoStatus: StatusPedido) {
    startTransition(() => atualizarStatusPedido(pedido.id, novoStatus));
  }

  function handleDespachar() {
    if (feedbackWhatsapp) {
      const mensagem = mensagemDespacho({
        nomeCliente: pedido.nomeCliente,
        telefoneCliente: pedido.telefoneCliente,
        endereco: pedido.endereco,
        total: pedido.total,
        itens: pedido.itens,
      });
      window.open(gerarLinkWhatsApp(pedido.telefoneCliente, mensagem), "_blank");
    }
    startTransition(() => atualizarStatusPedido(pedido.id, "DESPACHADO"));
  }

  function handleCancelar() {
    if (!confirm("Cancelar este pedido?")) return;
    startTransition(() => atualizarStatusPedido(pedido.id, "CANCELADO"));
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-4 space-y-3 transition-colors ${isPending ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{pedido.nomeCliente}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">{pedido.telefoneCliente}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-gray-400 dark:text-slate-500">{formatarHora(pedido.criadoEm)}</span>
          <button
            onClick={() => imprimirComanda(pedido, empresaNome)}
            title="Imprimir comanda (58mm)"
            className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Printer size={14} />
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-600 dark:text-slate-300 space-y-1">
        <p className="font-medium">Itens:</p>
        {pedido.itens.map((item) => (
          <p key={item.id}>{item.quantidade}x {item.nomeProduto}</p>
        ))}
      </div>

      <div className="text-xs text-gray-500 dark:text-slate-400 truncate">{pedido.endereco}</div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50 dark:border-slate-700/50">
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          R$ {Number(pedido.total).toFixed(2)}
        </span>
        <span className="text-xs text-gray-400 dark:text-slate-500">{pedido.formaPagamento}</span>
      </div>

      {pedido.observacoes && (
        <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded p-2">
          {pedido.observacoes}
        </p>
      )}

      <div className="space-y-1.5">
        {pedido.status === "RECEBIDO" && (
          <button onClick={() => handleAvancar("EM_PREPARO")} disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium py-1.5 rounded-lg transition-colors">
            Iniciar Preparo
          </button>
        )}
        {pedido.status === "EM_PREPARO" && (
          <button onClick={handleDespachar} disabled={isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors">
            {feedbackWhatsapp ? "Despachar + WhatsApp" : "Despachar"}
          </button>
        )}
        {pedido.status === "DESPACHADO" && (
          <button onClick={() => handleAvancar("ENTREGUE")} disabled={isPending}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1.5 rounded-lg transition-colors">
            Confirmar Entrega
          </button>
        )}
        {!["ENTREGUE", "CANCELADO"].includes(pedido.status) && (
          <button onClick={handleCancelar} disabled={isPending}
            className="w-full border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium py-1.5 rounded-lg transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

// Usa window como registro global — único por aba, imune a re-avaliação de módulo
function jaImpresso(id: string): boolean {
  const w = window as typeof window & { __ai_impressos?: Set<string> };
  if (!w.__ai_impressos) {
    // Restaura da sessão anterior (recarregamento de página)
    try { w.__ai_impressos = new Set(JSON.parse(sessionStorage.getItem("ai_impressos") ?? "[]")); }
    catch { w.__ai_impressos = new Set(); }
  }
  if (w.__ai_impressos.has(id)) return true;
  w.__ai_impressos.add(id);
  try { sessionStorage.setItem("ai_impressos", JSON.stringify([...w.__ai_impressos])); } catch { /* silencia */ }
  return false;
}

export default function KanbanBoard({ pedidos, empresaNome, feedbackWhatsapp, impressaoAutomatica }: { pedidos: Pedido[]; empresaNome: string; feedbackWhatsapp: boolean; impressaoAutomatica: boolean }) {
  const porStatus = (status: StatusPedido) => pedidos.filter((p) => p.status === status);

  useEffect(() => {
    if (!impressaoAutomatica) return;
    const novos = pedidos.filter((p) => p.status === "RECEBIDO" && !jaImpresso(p.id));
    novos.forEach((p) => imprimirAutomatico(p, empresaNome));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidos]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUNAS.map(({ status, label, cor }) => {
        const cards = porStatus(status);
        return (
          <div key={status} className="flex-shrink-0 w-72">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2.5 h-2.5 rounded-full ${cor}`} />
              <h3 className="font-semibold text-gray-700 dark:text-slate-200 text-sm">{label}</h3>
              <span className="ml-auto bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">
                {cards.length}
              </span>
            </div>
            <div className="space-y-3 min-h-20">
              {cards.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-slate-600 text-center py-6">Nenhum pedido</p>
              )}
              {cards.map((pedido) => (
                <KanbanCard key={pedido.id} pedido={pedido} empresaNome={empresaNome} feedbackWhatsapp={feedbackWhatsapp} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
