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
} from "lucide-react";
import { signOut } from "next-auth/react";

const navLinks = [
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tag },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar({ empresaNome }: { empresaNome: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-gray-900 text-white flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-1">
          <Store size={20} className="text-blue-400" />
          <span className="font-bold text-sm tracking-wide uppercase text-blue-400">
            Delivery Admin
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate">{empresaNome}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
