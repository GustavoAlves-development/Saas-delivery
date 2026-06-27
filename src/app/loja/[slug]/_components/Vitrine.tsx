"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Clock,
  Bike,
  Store,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  MessageSquare,
  CreditCard,
  Banknote,
  Landmark,
  QrCode,
  ArrowLeft,
  PackageCheck,
  AlertCircle,
  CalendarClock,
  Sun,
  Moon,
} from "lucide-react";
import { getPaleta } from "@/lib/paletas";
import { useTheme } from "@/components/ThemeProvider";

function ThemeToggleVitrine() {
  const { tema, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={tema === "dark" ? "Tema claro" : "Tema escuro"}
      className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-black/20 hover:bg-black/35 text-white backdrop-blur-sm transition-colors"
    >
      {tema === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

/* ─── tipos ─── */
type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: string;
  imagemUrl: string | null;
  categoriaId: string;
};

type Acompanhamento = {
  id: string;
  nome: string;
  preco: string;
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
  paletaCor: string;
};

type ItemCarrinho = { produto: Produto; quantidade: number };
type FormaPagamento = "Dinheiro" | "Cartão de Débito" | "Cartão de Crédito" | "PIX";
type TipoEntrega = "entrega" | "retirada";

type FormPedido = {
  nome: string;
  telefone: string;
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

function fmt(valor: string | number) {
  return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
}

function estaAbertoAgora(dia: DiaSemana | undefined): boolean {
  if (!dia?.aberto) return false;
  const agora = new Date();
  const [hA, mA] = dia.abertura.split(":").map(Number);
  const [hF, mF] = dia.fechamento.split(":").map(Number);
  const min = agora.getHours() * 60 + agora.getMinutes();
  return min >= hA * 60 + mA && min < hF * 60 + mF;
}

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function proximaAbertura(horario: DiaSemana[]): string | null {
  const agora = new Date();
  const diaIdx = agora.getDay();
  const minAgora = agora.getHours() * 60 + agora.getMinutes();

  for (let i = 0; i < 7; i++) {
    const idx = (diaIdx + i) % 7;
    const dia = horario.find((d) => d.dia === DIAS[idx]);
    if (!dia?.aberto) continue;
    const [hA, mA] = dia.abertura.split(":").map(Number);
    const minAbr = hA * 60 + mA;
    if (i === 0 && minAgora >= minAbr) continue;
    const label = i === 0 ? "hoje" : i === 1 ? "amanhã" : dia.dia.toLowerCase();
    return `${label} às ${dia.abertura}`;
  }
  return null;
}

function gerarMensagemWhatsApp(
  empresa: Empresa,
  itens: ItemCarrinho[],
  form: FormPedido,
  taxaEfetiva: number,
  acompSelecionados: Acompanhamento[]
) {
  const enderecoFormatado =
    form.tipoEntrega === "retirada"
      ? "Retirada no local"
      : `${form.rua}, ${form.numero}${form.complemento ? ` - ${form.complemento}` : ""}, ${form.bairro}, CEP ${form.cep}`;

  const linhasItens = itens
    .map((i) => `• ${i.quantidade}x ${i.produto.nome} — ${fmt(Number(i.produto.preco) * i.quantidade)}`)
    .join("\n");
  const subtotal = itens.reduce((s, i) => s + Number(i.produto.preco) * i.quantidade, 0);
  const totalAcomp = acompSelecionados.reduce((s, a) => s + Number(a.preco), 0);
  const total = subtotal + taxaEfetiva + totalAcomp;

  const linhaEntrega = form.tipoEntrega === "retirada"
    ? `*Tipo:* Retirada no local ✅\n`
    : `*Endereço:* ${enderecoFormatado}\n`;

  const linhaTaxa = form.tipoEntrega === "retirada"
    ? ""
    : `*Taxa de entrega:* ${fmt(taxaEfetiva)}\n`;

  const linhaAcomp = acompSelecionados.length > 0
    ? `*Acompanhamentos:* ${acompSelecionados.map((a) => `${a.nome}${Number(a.preco) > 0 ? ` (${fmt(a.preco)})` : ""}`).join(", ")}\n`
    : "";

  const msg =
    `*Novo Pedido — ${empresa.nome}*\n\n` +
    `*Cliente:* ${form.nome}\n` +
    linhaEntrega +
    `*Pagamento:* ${form.pagamento}\n` +
    (form.obs ? `*Obs:* ${form.obs}\n` : "") +
    `\n*Itens:*\n${linhasItens}\n` +
    (linhaAcomp ? `\n${linhaAcomp}` : "") +
    `\n*Subtotal:* ${fmt(subtotal)}\n` +
    linhaTaxa +
    `*Total:* ${fmt(total)}`;

  const numero = empresa.telefoneWhatsapp.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
}

/* ─── ícones de pagamento ─── */
const PAGAMENTO_ICONE: Record<FormaPagamento, React.ReactNode> = {
  PIX: <QrCode size={15} />,
  Dinheiro: <Banknote size={15} />,
  "Cartão de Débito": <CreditCard size={15} />,
  "Cartão de Crédito": <Landmark size={15} />,
};

/* ─── componente carrinho / checkout ─── */
function Carrinho({
  itens,
  empresa,
  acompanhamentos,
  onClose,
  onAlterarQtd,
  onFinalizar,
}: {
  itens: ItemCarrinho[];
  empresa: Empresa;
  acompanhamentos: Acompanhamento[];
  onClose: () => void;
  onAlterarQtd: (id: string, delta: number) => void;
  onFinalizar: (form: FormPedido, selecionados: Acompanhamento[]) => void;
}) {
  const [etapa, setEtapa] = useState<"carrinho" | "checkout">("carrinho");
  const [acompSelecionados, setAcompSelecionados] = useState<Set<string>>(new Set());
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
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
  const totalAcomp = acompanhamentos
    .filter((a) => acompSelecionados.has(a.id))
    .reduce((s, a) => s + Number(a.preco), 0);
  const total = subtotal + taxaEfetiva + totalAcomp;

  function toggleAcomp(id: string) {
    setAcompSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

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
    if (!telefone.trim()) return alert("Informe seu telefone.");
    if (tipoEntrega === "entrega" && (!rua.trim() || !numero.trim() || !bairro.trim())) {
      return alert("Preencha Rua, Número e Bairro.");
    }
    const selecionados = acompanhamentos.filter((a) => acompSelecionados.has(a.id));
    onFinalizar({ nome, telefone, tipoEntrega, cep, rua, numero, complemento, bairro, pagamento, obs }, selecionados);
  }

  const inp =
    "w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none v-ring transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          {etapa === "checkout" && (
            <button
              onClick={() => setEtapa("carrinho")}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900 text-base leading-tight">
              {etapa === "carrinho" ? "Seu Pedido" : "Finalizar Pedido"}
            </h2>
            {etapa === "carrinho" && (
              <p className="text-xs text-slate-400 mt-0.5">
                {itens.reduce((s, i) => s + i.quantidade, 0)} {itens.reduce((s, i) => s + i.quantidade, 0) === 1 ? "item" : "itens"}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── ETAPA CARRINHO ── */}
        {etapa === "carrinho" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {itens.map((item) => (
                <div
                  key={item.produto.id}
                  className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3"
                >
                  {item.produto.imagemUrl && (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={item.produto.imagemUrl}
                        alt={item.produto.nome}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm leading-tight truncate">
                      {item.produto.nome}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{fmt(item.produto.preco)} cada</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onAlterarQtd(item.produto.id, -1)}
                      className="w-7 h-7 rounded-full bg-white border border-slate-200 v-hover flex items-center justify-center text-slate-600 transition-all duration-200"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold text-slate-900 w-5 text-center">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => onAlterarQtd(item.produto.id, 1)}
                      className="w-7 h-7 rounded-full v-btn flex items-center justify-center transition-all duration-200"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-slate-900 w-16 text-right shrink-0">
                    {fmt(Number(item.produto.preco) * item.quantidade)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 px-5 py-4 space-y-3">
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Bike size={13} /> Taxa de entrega
                  </span>
                  <span>
                    {Number(empresa.taxaEntrega) > 0 ? fmt(empresa.taxaEntrega) : "Grátis"}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-200">
                  <span>Total estimado</span>
                  <span>{fmt(subtotal + Number(empresa.taxaEntrega))}</span>
                </div>
              </div>
              <button
                onClick={() => setEtapa("checkout")}
                className="w-full v-btn active:scale-[0.98] font-semibold py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 v-shadow"
              >
                Continuar para o checkout
              </button>
            </div>
          </>
        )}

        {/* ── ETAPA CHECKOUT ── */}
        {etapa === "checkout" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Identificação */}
              <Secao label="Identificação">
                <Field label="Nome completo" icon={<User size={14} />}>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Como você se chama?"
                    className={inp}
                  />
                </Field>
                <Field label="Telefone / WhatsApp" icon={<Phone size={14} />}>
                  <input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    type="tel"
                    className={inp}
                  />
                </Field>
              </Secao>

              {/* Entrega */}
              <Secao label="Entrega">
                <div className="grid grid-cols-2 gap-2">
                  {(["entrega", "retirada"] as TipoEntrega[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipoEntrega(t)}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                        tipoEntrega === t
                          ? "v-selected shadow-sm"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {t === "entrega" ? <Bike size={15} /> : <Store size={15} />}
                      {t === "entrega" ? "Entrega" : "Retirada"}
                    </button>
                  ))}
                </div>

                {tipoEntrega === "entrega" && (
                  <div className="space-y-3 mt-2 bg-slate-50 rounded-2xl p-4">
                    <Field label="CEP" icon={<MapPin size={14} />}>
                      <div className="relative">
                        <input
                          value={cep}
                          onChange={(e) => buscarCep(e.target.value)}
                          placeholder="00000-000"
                          maxLength={9}
                          className={inp}
                        />
                        {cepLoading && (
                          <Loader2
                            size={15}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
                          />
                        )}
                      </div>
                      {cepErro && <p className="text-xs text-red-500 mt-1">{cepErro}</p>}
                    </Field>
                    <Field label="Rua">
                      <input value={rua} onChange={(e) => setRua(e.target.value)} className={inp} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Número">
                        <input value={numero} onChange={(e) => setNumero(e.target.value)} className={inp} />
                      </Field>
                      <Field label="Complemento">
                        <input
                          value={complemento}
                          onChange={(e) => setComplemento(e.target.value)}
                          placeholder="Apto, bloco…"
                          className={inp}
                        />
                      </Field>
                    </div>
                    <Field label="Bairro">
                      <input value={bairro} onChange={(e) => setBairro(e.target.value)} className={inp} />
                    </Field>
                  </div>
                )}
              </Secao>

              {/* Acompanhamentos */}
              {acompanhamentos.length > 0 && (
                <Secao label="Acompanhamentos" sublabel="opcional">
                  <div className="space-y-2">
                    {acompanhamentos.map((a) => {
                      const sel = acompSelecionados.has(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggleAcomp(a.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                            sel
                              ? "v-selected shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                                sel ? "v-icon" : "border-slate-300"
                              }`}
                            >
                              {sel && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                            </span>
                            <span className="font-medium">{a.nome}</span>
                          </span>
                          <span className={`font-semibold text-xs ${sel ? "v-text" : "text-slate-400"}`}>
                            {Number(a.preco) > 0 ? `+ ${fmt(a.preco)}` : "Grátis"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Secao>
              )}

              {/* Pagamento */}
              <Secao label="Pagamento">
                <div className="grid grid-cols-2 gap-2">
                  {(["PIX", "Dinheiro", "Cartão de Débito", "Cartão de Crédito"] as FormaPagamento[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setPagamento(f)}
                      className={`flex items-center gap-2 py-3 px-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                        pagamento === f
                          ? "v-selected shadow-sm"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {PAGAMENTO_ICONE[f]}
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>
              </Secao>

              {/* Observações */}
              <Secao label="Observações" sublabel="opcional">
                <div className="relative">
                  <MessageSquare
                    size={14}
                    className="absolute left-3 top-3.5 text-slate-400 pointer-events-none"
                  />
                  <textarea
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                    rows={2}
                    placeholder="Sem cebola, troco para R$ 50…"
                    className={`${inp} pl-9 resize-none`}
                  />
                </div>
              </Secao>

              {/* Resumo do pedido */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-slate-700 text-xs uppercase tracking-wide mb-3">
                  Resumo
                </p>
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span><span>{fmt(subtotal)}</span>
                </div>
                {tipoEntrega === "entrega" && (
                  <div className="flex justify-between text-slate-500">
                    <span>Taxa de entrega</span>
                    <span>{taxaEfetiva > 0 ? fmt(taxaEfetiva) : <span className="text-emerald-600 font-medium">Grátis</span>}</span>
                  </div>
                )}
                {tipoEntrega === "retirada" && (
                  <div className="flex justify-between text-emerald-600 text-xs font-medium">
                    <span>Retirada no local</span><span>Sem taxa</span>
                  </div>
                )}
                {totalAcomp > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Acompanhamentos</span><span>+ {fmt(totalAcomp)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-200">
                  <span>Total</span><span className="v-text">{fmt(total)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-5 py-4">
              <button
                onClick={handleFinalizar}
                className="w-full v-btn active:scale-[0.98] font-semibold py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 v-shadow"
              >
                <PackageCheck size={18} />
                Fazer Pedido via WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── sub-componentes de layout ─── */
function Secao({
  label,
  sublabel,
  children,
}: {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {sublabel && <span className="text-xs text-slate-400">{sublabel}</span>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── vitrine principal ─── */
const STORAGE_KEY = (slug: string) => `carrinho_${slug}`;

export default function Vitrine({
  empresa,
  categorias,
  acompanhamentos,
}: {
  empresa: Empresa;
  categorias: Categoria[];
  acompanhamentos: Acompanhamento[];
}) {
  const paleta = getPaleta(empresa.paletaCor);

  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const horario = parsedHorario(empresa.horarioFuncionamento);
  const hoje = horario?.find((d) => d.dia === DIAS[new Date().getDay()]);
  const aberto = estaAbertoAgora(hoje);
  const [horarioExpandido, setHorarioExpandido] = useState(!aberto);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(empresa.slug));
      if (raw) setItens(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [empresa.slug]);

  const salvar = useCallback(
    (novos: ItemCarrinho[]) => {
      setItens(novos);
      localStorage.setItem(STORAGE_KEY(empresa.slug), JSON.stringify(novos));
    },
    [empresa.slug]
  );

  function adicionarProduto(produto: Produto) {
    const existe = itens.find((i) => i.produto.id === produto.id);
    if (existe) {
      salvar(itens.map((i) => i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i));
    } else {
      salvar([...itens, { produto, quantidade: 1 }]);
    }
  }

  function alterarQuantidade(produtoId: string, delta: number) {
    salvar(
      itens
        .map((i) => i.produto.id === produtoId ? { ...i, quantidade: i.quantidade + delta } : i)
        .filter((i) => i.quantidade > 0)
    );
  }

  async function finalizarPedido(form: FormPedido, acompSelecionados: Acompanhamento[]) {
    const subtotal = itens.reduce((s, i) => s + Number(i.produto.preco) * i.quantidade, 0);
    const taxaEfetiva = form.tipoEntrega === "retirada" ? 0 : Number(empresa.taxaEntrega);
    const totalAcomp = acompSelecionados.reduce((s, a) => s + Number(a.preco), 0);
    const total = subtotal + taxaEfetiva + totalAcomp;

    const enderecoString =
      form.tipoEntrega === "retirada"
        ? "Retirada no local"
        : `${form.rua}, ${form.numero}${form.complemento ? ` - ${form.complemento}` : ""}, ${form.bairro}, CEP ${form.cep}`;

    const itensApi = [
      ...itens.map((i) => ({ produtoId: i.produto.id, nomeProduto: i.produto.nome, preco: i.produto.preco, quantidade: i.quantidade })),
      ...acompSelecionados.map((a) => ({ produtoId: a.id, nomeProduto: a.nome, preco: a.preco, quantidade: 1 })),
    ];

    try {
      await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresaId: empresa.id, nomeCliente: form.nome, telefoneCliente: form.telefone, endereco: enderecoString, formaPagamento: form.pagamento, observacoes: form.obs, total, itens: itensApi }),
      });
    } catch { /* falha silenciosa */ }

    window.open(gerarMensagemWhatsApp(empresa, itens, form, taxaEfetiva, acompSelecionados), "_blank");
    salvar([]);
    setCarrinhoAberto(false);
    setPedidoEnviado(true);
    setTimeout(() => setPedidoEnviado(false), 6000);
  }

  const totalItens = itens.reduce((s, i) => s + i.quantidade, 0);
  const valorCarrinho = itens.reduce((s, i) => s + Number(i.produto.preco) * i.quantidade, 0);
  const proximaAberturaLabel = !aberto && horario ? proximaAbertura(horario) : null;

  /* ─── CSS de paleta injetado uma vez no root ─── */
  const css = `
    [data-vitrine] .v-btn { background-color: ${paleta.hex}; color: white; }
    [data-vitrine] .v-btn:hover { background-color: ${paleta.hexDark}; }
    [data-vitrine] .v-btn:active { transform: scale(0.98); }
    [data-vitrine] .v-selected { border-color: ${paleta.hex} !important; background-color: ${paleta.hexLight} !important; color: ${paleta.hexText} !important; }
    [data-vitrine] .v-icon { background-color: ${paleta.hex}; border-color: ${paleta.hex}; }
    [data-vitrine] .v-text { color: ${paleta.hex}; }
    [data-vitrine] .v-hover:hover { border-color: ${paleta.hexBorder}; background-color: ${paleta.hexLight}; color: ${paleta.hex}; }
    [data-vitrine] .v-shadow { box-shadow: 0 8px 24px -4px ${paleta.hex}55; }
    [data-vitrine] .v-gradient { background: linear-gradient(to bottom right, ${paleta.hex}, ${paleta.hexDark}); }
    [data-vitrine] .v-sched { background-color: ${paleta.hexLight}; border-color: ${paleta.hexBorder}; }
    [data-vitrine] .v-sched-text { color: ${paleta.hexText}; }
    [data-vitrine] .v-ring:focus { box-shadow: 0 0 0 2px ${paleta.hex}40; border-color: ${paleta.hex}; }
    [data-vitrine] .v-badge { background-color: white; color: ${paleta.hex}; }

    /* ── dark mode ── */
    .dark [data-vitrine] .bg-white { background-color: #1e293b; }
    .dark [data-vitrine] .bg-gray-50 { background-color: #0f172a; }
    .dark [data-vitrine] .bg-slate-50 { background-color: rgba(30,41,59,0.5); }
    .dark [data-vitrine] .bg-slate-100 { background-color: #334155; }
    .dark [data-vitrine] .border-slate-100 { border-color: rgba(51,65,85,0.5); }
    .dark [data-vitrine] .border-slate-200 { border-color: #475569; }
    .dark [data-vitrine] .text-slate-900 { color: #f1f5f9; }
    .dark [data-vitrine] .text-slate-800 { color: #e2e8f0; }
    .dark [data-vitrine] .text-slate-700 { color: #cbd5e1; }
    .dark [data-vitrine] .text-slate-600 { color: #94a3b8; }
    .dark [data-vitrine] .text-slate-500 { color: #64748b; }
    .dark [data-vitrine] .text-slate-400 { color: #475569; }
    .dark [data-vitrine] input, .dark [data-vitrine] textarea { background-color: #334155; border-color: #475569; color: #f1f5f9; }
    .dark [data-vitrine] input::placeholder, .dark [data-vitrine] textarea::placeholder { color: #64748b; }
    .dark [data-vitrine] .v-gradient { background: linear-gradient(to bottom right, ${paleta.hexDark}, #1e293b); }
    .dark [data-vitrine] .hover\\:bg-slate-50:hover { background-color: rgba(30,41,59,0.5); }
    .dark [data-vitrine] .hover\\:bg-slate-100:hover { background-color: #334155; }
    .dark [data-vitrine] .hover\\:shadow-md:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.5); }
    .dark [data-vitrine] .shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.4); }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div data-vitrine="" className="min-h-screen bg-gray-50 dark:bg-slate-900">

        {/* ── HERO / BANNER ── */}
        <div className={`relative w-full ${empresa.imagemBanner ? "h-56 sm:h-64" : "h-28"} v-gradient`}>
          {empresa.imagemBanner && (
            <Image
              src={empresa.imagemBanner}
              alt="Banner"
              fill
              className="object-cover"
              unoptimized
              loading="eager"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <ThemeToggleVitrine />
        </div>

        {/* ── HEADER DA LOJA ── */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative -mt-12 mb-5 flex items-end gap-4">
            {/* Avatar */}
            {empresa.imagemPerfil ? (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                <Image
                  src={empresa.imagemPerfil}
                  alt={empresa.nome}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl v-gradient border-4 border-white shadow-xl flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {empresa.nome.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="pb-1 flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                {empresa.nome}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {hoje && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      aberto
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        aberto ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                      }`}
                    />
                    {aberto ? "Aberto agora" : "Fechado"}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Bike size={12} />
                  {Number(empresa.taxaEntrega) > 0
                    ? `Entrega ${fmt(empresa.taxaEntrega)}`
                    : "Entrega grátis"}
                </span>
                {hoje && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={12} />
                    {hoje.aberto ? `${hoje.abertura}–${hoje.fechamento}` : "Fechado hoje"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── BANNER FECHADO ── */}
          {!aberto && horario && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 mb-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-800 text-sm">
                  Estabelecimento fechado no momento
                </p>
                {proximaAberturaLabel ? (
                  <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                    <CalendarClock size={12} />
                    Abre {proximaAberturaLabel}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 mt-0.5">
                    Consulte os horários de funcionamento abaixo
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── HORÁRIOS ── */}
          {horario && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
              <button
                onClick={() => setHorarioExpandido((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200"
              >
                <span className="flex items-center gap-2 text-slate-600">
                  <Clock size={14} className="text-slate-400" />
                  Horário de funcionamento
                </span>
                {horarioExpandido
                  ? <ChevronUp size={15} className="text-slate-400" />
                  : <ChevronDown size={15} className="text-slate-400" />}
              </button>

              {horarioExpandido && (
                <div className="border-t border-slate-100 px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {horario.map((d) => {
                    const isHoje = d.dia === DIAS[new Date().getDay()];
                    return (
                      <div
                        key={d.dia}
                        className={`text-xs rounded-xl p-2.5 border ${
                          isHoje ? "v-sched" : "bg-slate-50 border-transparent"
                        }`}
                      >
                        <span
                          className={`font-semibold block mb-0.5 ${
                            isHoje ? "v-sched-text" : d.aberto ? "text-slate-700" : "text-slate-400"
                          }`}
                        >
                          {d.dia}
                        </span>
                        <span className={d.aberto ? "text-slate-500" : "text-slate-400"}>
                          {d.aberto ? `${d.abertura} – ${d.fechamento}` : "Fechado"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── CATÁLOGO ── */}
          <div className="space-y-10 pb-36">
            {categorias.map((cat) => (
              <section key={cat.id}>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  {cat.nome}
                </h2>
                <div className="space-y-3">
                  {cat.produtos.map((produto) => {
                    const qtd = itens.find((i) => i.produto.id === produto.id)?.quantidade ?? 0;
                    return (
                      <div
                        key={produto.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 flex gap-4 items-stretch"
                      >
                        {/* Info do produto */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm leading-snug">
                              {produto.nome}
                            </p>
                            {produto.descricao && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {produto.descricao}
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-bold v-text mt-3">
                            {fmt(produto.preco)}
                          </p>
                        </div>

                        {/* Imagem + controles */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-2.5">
                          {produto.imagemUrl && (
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm">
                              <Image
                                src={produto.imagemUrl}
                                alt={produto.nome}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )}

                          {qtd === 0 ? (
                            aberto ? (
                              <button
                                onClick={() => adicionarProduto(produto)}
                                className="flex items-center gap-1.5 v-btn active:scale-95 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 v-shadow"
                              >
                                <Plus size={13} />
                                Adicionar
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium px-3 py-2 rounded-xl bg-slate-100 cursor-not-allowed">
                                Fechado
                              </span>
                            )
                          ) : (
                            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2 py-1.5">
                              <button
                                onClick={() => alterarQuantidade(produto.id, -1)}
                                className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 v-hover transition-colors"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="text-sm font-bold text-slate-900 w-4 text-center">
                                {qtd}
                              </span>
                              <button
                                onClick={() => alterarQuantidade(produto.id, 1)}
                                className="w-6 h-6 rounded-lg v-btn flex items-center justify-center transition-colors"
                              >
                                <Plus size={11} />
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

        {/* ── BARRA DE CARRINHO STICKY ── */}
        {totalItens > 0 && !carrinhoAberto && aberto && (
          <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-2 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent dark:from-slate-900 dark:via-slate-900/90">
            <button
              onClick={() => setCarrinhoAberto(true)}
              className="flex items-center gap-3 w-full max-w-2xl mx-auto v-btn active:scale-[0.98] font-semibold px-5 py-4 rounded-2xl v-shadow transition-all duration-200"
            >
              <div className="relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2.5 v-badge text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {totalItens}
                </span>
              </div>
              <span className="flex-1 text-left text-sm">Ver meu pedido</span>
              <span className="text-sm font-bold">{fmt(valorCarrinho)}</span>
            </button>
          </div>
        )}

        {/* ── TOAST DE SUCESSO ── */}
        {pedidoEnviado && (
          <div className="fixed top-5 left-0 right-0 flex justify-center z-50 px-4 pointer-events-none">
            <div className="flex items-center gap-3 bg-slate-900 text-white text-sm font-medium px-5 py-3.5 rounded-2xl shadow-2xl">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              Pedido enviado! Verifique o WhatsApp.
            </div>
          </div>
        )}

        {/* ── DRAWER CARRINHO ── */}
        {carrinhoAberto && (
          <Carrinho
            itens={itens}
            empresa={empresa}
            acompanhamentos={acompanhamentos}
            onClose={() => setCarrinhoAberto(false)}
            onAlterarQtd={alterarQuantidade}
            onFinalizar={finalizarPedido}
          />
        )}
      </div>
    </>
  );
}
