import { getSASession } from "@/lib/superadmin-session";
import { redirect } from "next/navigation";
import { loginSuperAdmin } from "./actions";
import { ShieldCheck, AlertCircle } from "lucide-react";

export default async function SuperAdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const session = await getSASession();
  if (session) redirect("/superadmin");

  const { erro } = await searchParams;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 mb-4">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Super Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Painel exclusivo do proprietário do SaaS</p>
        </div>

        <form action={loginSuperAdmin} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          {erro && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              E-mail ou senha incorretos.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
            <input
              name="email"
              type="email"
              required
              autoFocus
              placeholder="seu@email.com"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
            <input
              name="senha"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.99] text-white font-semibold py-2.5 rounded-xl transition-all text-sm mt-2"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
