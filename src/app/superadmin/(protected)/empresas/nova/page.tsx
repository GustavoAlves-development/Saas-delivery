import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { criarEmpresa } from "./actions";
import SlugInput from "./_components/SlugInput";

export default function NovaEmpresaPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/superadmin"
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Nova Empresa</h1>
          <p className="text-slate-400 text-sm mt-0.5">Cadastrar um novo cliente no SaaS</p>
        </div>
      </div>

      <form action={criarEmpresa} className="space-y-6">
        {/* Dados da empresa */}
        <Section title="Dados da Empresa">
          <Field label="Nome da empresa" required>
            <input
              name="nome"
              type="text"
              required
              placeholder="Ex: Burger Gourmet"
              className={inputCls}
            />
          </Field>
          <Field label="Slug (URL da loja)" required>
            <SlugInput />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="WhatsApp" required>
              <input
                name="telefoneWhatsapp"
                type="text"
                required
                placeholder="55119..."
                className={inputCls}
              />
            </Field>
            <Field label="Taxa de entrega (R$)">
              <input
                name="taxaEntrega"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* Admin da loja */}
        <Section title="Acesso Admin da Loja">
          <Field label="E-mail do administrador" required>
            <input
              name="adminEmail"
              type="email"
              required
              placeholder="admin@empresa.com"
              className={inputCls}
            />
          </Field>
          <Field label="Senha temporária" required>
            <input
              name="adminSenha"
              type="text"
              required
              minLength={6}
              placeholder="Senha de acesso inicial"
              className={inputCls}
            />
          </Field>
        </Section>

        {/* Mensalidade */}
        <Section title="Mensalidade">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Plano">
              <select name="plano" className={inputCls}>
                <option value="basico">Básico</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </Field>
            <Field label="Status">
              <select name="statusMensalidade" className={inputCls}>
                <option value="TRIAL">Trial</option>
                <option value="EM_DIA">Em dia</option>
                <option value="VENCIDA">Vencida</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor (R$/mês)">
              <input
                name="valorMensalidade"
                type="number"
                step="0.01"
                min="0"
                defaultValue="99.90"
                className={inputCls}
              />
            </Field>
            <Field label="Vencimento">
              <input
                name="vencimentoMensalidade"
                type="date"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-violet-600 hover:bg-violet-700 active:scale-[0.99] text-white font-semibold py-3 rounded-xl transition-all text-sm"
          >
            Criar empresa
          </button>
          <Link
            href="/superadmin"
            className="px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-sm font-medium"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm transition-all";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-300 pb-1 border-b border-slate-800">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-1.5">
        {label}
        {required && <span className="text-violet-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
