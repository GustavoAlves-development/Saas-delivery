"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Package,
  Tag,
  Settings,
  LogOut,
  Store,
  UtensilsCrossed,
  LayoutDashboard,
  Layers,
} from "lucide-react";
import { signOut } from "next-auth/react";
import NotificadorPedidos from "./NotificadorPedidos";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tag },
  { href: "/admin/adicionais", label: "Adicionais", icon: Layers },
  { href: "/admin/acompanhamentos", label: "Acompanhamentos", icon: UtensilsCrossed },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar({
  empresaNome,
  onClose,
}: {
  empresaNome: string;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-full bg-gray-900 dark:bg-slate-950 text-white flex flex-col transition-colors duration-200">
      <div className="p-5 border-b border-gray-700 dark:border-slate-800 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Store size={20} className="text-blue-400 shrink-0" />
            <span className="font-bold text-sm tracking-wide uppercase text-blue-400">
              Delivery Admin
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate">{empresaNome}</p>
        </div>
        <ThemeToggle className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 dark:hover:bg-slate-800 transition-colors shrink-0 mt-0.5" />
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navLinks.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 dark:hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-700 dark:border-slate-800 space-y-1">
        <NotificadorPedidos />
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 dark:hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
