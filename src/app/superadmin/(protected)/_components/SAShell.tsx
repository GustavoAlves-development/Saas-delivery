"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/superadmin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/superadmin/empresas", label: "Empresas", icon: Building2 },
];

function Sidebar({
  adminEmail,
  onClose,
  logout,
}: {
  adminEmail: string;
  onClose?: () => void;
  logout: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-violet-400 uppercase tracking-wider">Super Admin</p>
          <p className="text-xs text-slate-500 truncate">{adminEmail}</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={17} />
          Sair
        </button>
      </div>
    </aside>
  );
}

export default function SAShell({
  adminEmail,
  children,
}: {
  adminEmail: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch("/api/superadmin/logout", { method: "POST" });
    router.push("/superadmin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setOpen(false)} />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar adminEmail={adminEmail} onClose={() => setOpen(false)} logout={logout} />
      </div>

      <div className="flex-1 md:ml-64 min-w-0 flex flex-col">
        <header className="flex items-center gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800 md:hidden sticky top-0 z-30">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-semibold text-white text-sm">Super Admin</span>
        </header>
        <main className="flex-1 p-4 md:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
