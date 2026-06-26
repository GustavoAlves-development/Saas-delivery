"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShoppingCart, Plus, Minus, X, Clock, Bike, Store, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

/* ─── tipos ─── */
type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: string;
  imagemUrl: string | null;
  categoriaId: string;
};

type Categoria = {
  id: string;
  nome: string;
  produtos: Produto[];
};

type Empresa = {
  id: string;
  nome: string;
  slug: string;
  telefoneWhatsapp: string;
  taxaEntrega: string;
  imagemPerfil: string | null;
  imagemBanner: string | null;
  horarioFuncionamento: string | null;
};

type ItemCarrinho = {
  produto: Produto;
  quantidade: number;
};

type FormaPagamento = "Dinheiro" | "Cartão de Débito" | "Cartão de Crédito" | "PIX";
type TipoEntrega = "entrega" | "retirada";

type FormPedido = {
  nome: string;
  tipoEntrega: TipoEntrega;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  pagamento: string;
  obs: string;
};

/* ─── helpers ─── */
type DiaSemana = { dia: string; aberto: boolean; abertura: string; fechamento: string };

function parsedHorario(json: string | null): DiaSemana[] | null {
  if (!json) return null;
  try { return JSON.parse(json) as DiaSemana[]; }
  catch { return null; }
}

function formatarMoeda(valor: string | number) {
  return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
}

function estaAbertoAgora(dia: DiaSemana | undefined): boolean {
  if (!dia?.aberto) return false;
  const agora = new Date();
  const [hA, mA] = dia.abertura.split(":").map(Number);
  const [hF, mF] = dia.fechamento.split(":").map(Number);
  const minAgora = agora.getHours() * 60 + agora.getMinutes();
  return minAgora >= hA * 60 + mA && minAgora < hF * 60 + mF;
}

function gerarMensagemWhatsApp(
  empresa: Empresa,
  itens: ItemCarrinho[],
  form: FormPedido,
  taxaEfetiva: number
) {
  const enderecoFormatado =
    form.tipoEntrega === "retirada"
      ? "Retirada no local"
      : `${form.rua}, ${form.numero}${form.complemento ? ` - ${form.complemento}` : ""}, ${form.bairro}, CEP ${form.cep}`;

  const linhasItens = itens
    .map((i) => `• ${i.quantidade}x ${i.produto.nome} — ${formatarMoeda(Number(i.produto.preco) * i.quantidade)}`)
    .join("\n");
  const subtotal = itens.reduce((s, i) => s + Number(i.produto.preco) * i.quantidade, 0);
  const total = subtotal + taxaEfetiva;

  const linhaEntrega =
    form.tipoEntrega === "retirada"
      ? `*Tipo:* Retirada no local ✅\n`
      : `*Endereço:* ${enderecoFormatado}\n`;

  const linhaTaxa =
    form.tipoEntrega === "retirada"
      ? ""
      : `*Taxa de entrega:* ${formatarMoeda(taxaEfetiva)}\n`;

  const msg =
    `*Novo Pedido — ${empresa.nome}*\n\n` +
    `*Cliente:* ${form.nome}\n` +
    linhaEntrega +
    `*Pagamento:* ${form.pagamento}\n` +
    (form.obs ? `*Obs:* ${form.obs}\n` : "") +
    `\n*Itens:*\n${linhasItens}\n\n` +
    `*Subtotal:* ${formatarMoeda(subtotal)}\n` +
    linhaTaxa +
    `*Total:* ${formatarMoeda(total)}`;

  const numero = empresa.telefoneWhatsapp.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
}

/* ─── componente carrinho ─── */
function Carrinho({
  itens,
  empresa,
  onClose,
  onAlterarQtd,
  onFinalizar,
}: {
  itens: ItemCarrinho[];
  empresa: Empresa;
  onClose: () => void;
  onAlterarQtd: (id: string, delta: number) => void;
  onFinalizar: (form: FormPedido) => void;
}) {
  const [etapa, setEtapa] = useState<"carrinho" | "checkout">("carrinho");
  const [nome, setNome] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>("entrega");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepErro, setCepErro] = useState("");
  const [pagamento, setPagamento] = useState<FormaPagamento>("PIX");
  const [obs, setObs] = useState("");

  const subtotal = itens.reduce((s, i) => s + Number(i.produto.preco) * i.quantidade, 0);
  const taxaEfetiva = tipoEntrega === "retirada" ? 0 : Number(empresa.taxaEntrega);
  const total = subtotal + taxaEfetiva;

  async function buscarCep(valor: string) {
    const digits = valor.replace(/\D/g, "");
    setCep(valor);
    setCepErro("");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) { setCepErro("CEP não encontrado"); return; }
      setRua(data.logradouro ?? "");
      setBairro(data.bairro ?? "");
    } catch {
      setCepErro("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }

  function handleFinalizar() {
    if (!nome.trim()) return alert("Informe seu nome.");
    if (tipoEntrega === "entrega" && (!rua.trim() || !numero.trim() || !bairro.trim())) {
      return alert("Preencha Rua, Número e Bairro.");
    }
    onFinalizar({ nome, tipoEntrega, cep, rua, numero, complemento, bairro, pagamento, obs });
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-gray-900 text-lg">
            {etapa === "carrinho" ? "Seu Pedido" : "Finalizar Pedido"}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {etapa === "carrinho" ? (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {itens.map((item) => (
                <div key={item.produto.id} className="flex items-center gap-3">
                  {item.produto.imagemUrl && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.produto.imagemUrl} alt={item.produto.nome} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.produto.nome}</p>
                    <p className="text-xs text-gray-500">{formatarMoeda(item.produto.preco)} cada</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onAlterarQtd(item.produto.id, -1)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700">
                      <Minus size={13} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center text-gray-900">{item.quantidade}</span>
                    <button onClick={() => onAlterarQtd(item.produto.id, 1)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700">
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                    {formatarMoeda(Number(item.produto.preco) * item.quantidade)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t p-5 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>{formatarMoeda(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1"><Bike size={14} /> Taxa de entrega</span>
                <span>{Number(empresa.taxaEntrega) > 0 ? formatarMoeda(empresa.taxaEntrega) : "Grátis"}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-3">
                <span>Total</span><span>{formatarMoeda(subtotal + Number(empresa.taxaEntrega))}</span>
              </div>
              <button
                onClick={() => setEtapa("checkout")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Ir para o Checkout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
              </div>

              {/* Toggle entrega/retirada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Como deseja receber?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setTipoEntrega("entrega")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${tipoEntrega === "entrega" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                    <Bike size={15} /> Entrega
                  </button>
                  <button type="button" onClick={() => setTipoEntrega("retirada")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${tipoEntrega === "retirada" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                    <Store size={15} /> Retirada
                  </button>
                </div>
              </div>

              {/* Campos de endereço — só para entrega */}
              {tipoEntrega === "entrega" && (
                <div className="space-y-3 rounded-xl bg-gray-50 p-3">
                  {/* CEP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <div className="relative">
                      <input
                        value={cep}
                        onChange={(e) => buscarCep(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                        className={inputClass}
                      />
                      {cepLoading && (
                        <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                      )}
                    </div>
                    {cepErro && <p className="text-xs text-red-500 mt-1">{cepErro}</p>}
                  </div>

                  {/* Rua */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                    <input value={rua} onChange={(e) => setRua(e.target.value)} className={inputClass} />
                  </div>

                  {/* Número + Complemento */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                      <input value={numero} onChange={(e) => setNumero(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                      <input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto, bloco..." className={inputClass} />
                    </div>
                  </div>

                  {/* Bairro */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                    <input value={bairro} onChange={(e) => setBairro(e.target.value)} className={inputClass} />
                  </div>
                </div>
              )}

              {/* Pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forma de pagamento *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["PIX", "Dinheiro", "Cartão de Débito", "Cartão de Crédito"] as FormaPagamento[]).map((f) => (
                    <button key={f} type="button" onClick={() => setPagamento(f)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${pagamento === f ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2}
                  placeholder="Ex: sem cebola, troco para R$50..."
                  className={`${inputClass} resize-none`} />
              </div>

              {/* Resumo */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatarMoeda(subtotal)}</span>
                </div>
                {tipoEntrega === "entrega" && (
                  <div className="flex justify-between text-gray-600">
                    <span>Taxa de entrega</span>
                    <span>{taxaEfetiva > 0 ? formatarMoeda(taxaEfetiva) : "Grátis"}</span>
                  </div>
                )}
                {tipoEntrega === "retirada" && (
                  <div className="flex justify-between text-green-600 text-xs">
                    <span>Retirada no local</span><span>Sem taxa</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t">
                  <span>Total</span><span>{formatarMoeda(total)}</span>
                </div>
              </div>
            </div>

            <div className="border-t p-5 space-y-3">
              <button
                onClick={handleFinalizar}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Fazer Pedido via WhatsApp
              </button>
              <button onClick={() => setEtapa("carrinho")} className="w-full text-sm text-gray-500 hover:text-gray-700">
                ← Voltar ao carrinho
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── vitrine principal ─── */
const STORAGE_KEY = (slug: string) => `carrinho_${slug}`;

export default function Vitrine({ empresa, categorias }: { empresa: Empresa; categorias: Categoria[] }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [horarioExpandido, setHorarioExpandido] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(empresa.slug));
      if (raw) setItens(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [empresa.slug]);

  const salvar = useCallback((novos: ItemCarrinho[]) => {
    setItens(novos);
    localStorage.setItem(STORAGE_KEY(empresa.slug), JSON.stringify(novos));
  }, [empresa.slug]);

  function adicionarProduto(produto: Produto) {
    const existe = itens.find((i) => i.produto.id === produto.id);
    if (existe) {
      salvar(itens.map((i) => i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i));
    } else {
      salvar([...itens, { produto, quantidade: 1 }]);
    }
  }

  function alterarQuantidade(produtoId: string, delta: number) {
    const novo = itens
      .map((i) => i.produto.id === produtoId ? { ...i, quantidade: i.quantidade + delta } : i)
      .filter((i) => i.quantidade > 0);
    salvar(novo);
  }

  async function finalizarPedido(form: FormPedido) {
    const subtotal = itens.reduce((s, i) => s + Number(i.produto.preco) * i.quantidade, 0);
    const taxaEfetiva = form.tipoEntrega === "retirada" ? 0 : Number(empresa.taxaEntrega);
    const total = subtotal + taxaEfetiva;

    const enderecoString =
      form.tipoEntrega === "retirada"
        ? "Retirada no local"
        : `${form.rua}, ${form.numero}${form.complemento ? ` - ${form.complemento}` : ""}, ${form.bairro}, CEP ${form.cep}`;

    try {
      await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresaId: empresa.id,
          nomeCliente: form.nome,
          telefoneCliente: "",
          endereco: enderecoString,
          formaPagamento: form.pagamento,
          observacoes: form.obs,
          total,
          itens: itens.map((i) => ({
            produtoId: i.produto.id,
            nomeProduto: i.produto.nome,
            preco: i.produto.preco,
            quantidade: i.quantidade,
          })),
        }),
      });
    } catch { /* falha silenciosa — WhatsApp é o canal principal */ }

    const waLink = gerarMensagemWhatsApp(empresa, itens, form, taxaEfetiva);
    window.open(waLink, "_blank");

    salvar([]);
    setCarrinhoAberto(false);
    setPedidoEnviado(true);
    setTimeout(() => setPedidoEnviado(false), 6000);
  }

  const totalItens = itens.reduce((s, i) => s + i.quantidade, 0);
  const horario = parsedHorario(empresa.horarioFuncionamento);
  const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const hoje = horario?.find((d) => d.dia === DIAS_SEMANA[new Date().getDay()]);
  const aberto = estaAbertoAgora(hoje);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className={`relative w-full ${empresa.imagemBanner ? "h-52" : "h-24"} bg-gradient-to-r from-orange-500 to-red-500`}>
        {empresa.imagemBanner && (
          <Image src={empresa.imagemBanner} alt="Banner" fill className="object-cover" unoptimized loading="eager" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Header da loja */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="relative -mt-10 mb-4 flex items-end gap-4">
          {empresa.imagemPerfil ? (
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              <Image src={empresa.imagemPerfil} alt={empresa.nome} fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-orange-500 border-4 border-white shadow-lg flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{empresa.nome.charAt(0)}</span>
            </div>
          )}
          <div className="pb-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{empresa.nome}</h1>
              {hoje && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${aberto ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${aberto ? "bg-green-500" : "bg-red-500"}`} />
                  {aberto ? "Aberto agora" : "Fechado"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Bike size={13} />
                {Number(empresa.taxaEntrega) > 0 ? `Entrega ${formatarMoeda(empresa.taxaEntrega)}` : "Entrega grátis"}
              </span>
              {hoje && (
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {hoje.aberto ? `${hoje.abertura}–${hoje.fechamento}` : "Fechado hoje"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Horários — colapsável */}
        {horario && (
          <div className="bg-white rounded-xl border border-gray-100 mb-6 overflow-hidden">
            <button
              onClick={() => setHorarioExpandido((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                Horário de funcionamento
              </span>
              {horarioExpandido ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
            </button>

            {horarioExpandido && (
              <div className="border-t border-gray-100 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {horario.map((d) => (
                  <div key={d.dia} className={`text-xs rounded-lg p-2 ${d.dia === DIAS_SEMANA[new Date().getDay()] ? "bg-orange-50 border border-orange-100" : ""}`}>
                    <span className={`font-semibold block ${d.aberto ? "text-gray-800" : "text-gray-400"}`}>{d.dia}</span>
                    <span className={d.aberto ? "text-gray-600" : "text-gray-400"}>
                      {d.aberto ? `${d.abertura} – ${d.fechamento}` : "Fechado"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Catálogo por categoria */}
        <div className="space-y-8 pb-32">
          {categorias.map((cat) => (
            <section key={cat.id}>
              <h2 className="text-base font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                {cat.nome}
              </h2>
              <div className="space-y-3">
                {cat.produtos.map((produto) => {
                  const qtdNoCarrinho = itens.find((i) => i.produto.id === produto.id)?.quantidade ?? 0;
                  return (
                    <div key={produto.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 items-center">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{produto.nome}</p>
                        {produto.descricao && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{produto.descricao}</p>
                        )}
                        <p className="text-sm font-bold text-orange-600 mt-1">{formatarMoeda(produto.preco)}</p>
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-center gap-2">
                        {produto.imagemUrl && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                            <Image src={produto.imagemUrl} alt={produto.nome} fill className="object-cover" unoptimized />
                          </div>
                        )}
                        {qtdNoCarrinho === 0 ? (
                          <button onClick={() => adicionarProduto(produto)}
                            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                            <Plus size={13} /> Adicionar
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => alterarQuantidade(produto.id, -1)}
                              className="w-7 h-7 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-700">
                              <Minus size={13} />
                            </button>
                            <span className="text-sm font-bold text-gray-900 w-4 text-center">{qtdNoCarrinho}</span>
                            <button onClick={() => alterarQuantidade(produto.id, 1)}
                              className="w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white">
                              <Plus size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Botão flutuante do carrinho */}
      {totalItens > 0 && !carrinhoAberto && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-40">
          <button onClick={() => setCarrinhoAberto(true)}
            className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-lg transition-colors max-w-sm w-full">
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItens}
              </span>
            </div>
            <span className="flex-1 text-left">Ver pedido</span>
            <span>{formatarMoeda(itens.reduce((s, i) => s + Number(i.produto.preco) * i.quantidade, 0))}</span>
          </button>
        </div>
      )}

      {/* Banner de sucesso */}
      {pedidoEnviado && (
        <div className="fixed top-4 left-0 right-0 flex justify-center z-50 px-4">
          <div className="bg-green-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg text-sm">
            Pedido enviado! Verifique o WhatsApp.
          </div>
        </div>
      )}

      {/* Carrinho lateral */}
      {carrinhoAberto && (
        <Carrinho
          itens={itens}
          empresa={empresa}
          onClose={() => setCarrinhoAberto(false)}
          onAlterarQtd={alterarQuantidade}
          onFinalizar={finalizarPedido}
        />
      )}
    </div>
  );
}
