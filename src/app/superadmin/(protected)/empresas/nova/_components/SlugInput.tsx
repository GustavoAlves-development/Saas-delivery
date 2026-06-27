"use client";

import { useState } from "react";

export default function SlugInput() {
  const [slug, setSlug] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(val);
  }

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none pointer-events-none">
        /loja/
      </span>
      <input
        name="slug"
        type="text"
        required
        value={slug}
        onChange={handleChange}
        placeholder="minha-loja"
        className="w-full pl-14 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm transition-all"
      />
    </div>
  );
}
