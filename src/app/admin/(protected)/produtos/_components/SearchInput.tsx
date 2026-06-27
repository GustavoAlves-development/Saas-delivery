"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useCallback, useState } from "react";

export default function SearchInput({ placeholder = "Pesquisar produtos…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  const update = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set("search", term);
      } else {
        params.delete("search");
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    update(e.target.value);
  }

  function clear() {
    setValue("");
    update("");
  }

  return (
    <div className="relative w-full sm:w-64">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
      {value && (
        <button
          onClick={clear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
