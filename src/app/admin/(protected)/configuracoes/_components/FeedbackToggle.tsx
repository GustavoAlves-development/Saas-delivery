"use client";

import { useTransition } from "react";
import { salvarFeedbackWhatsapp } from "../actions";
import { MessageCircle } from "lucide-react";

export default function FeedbackToggle({ atual }: { atual: boolean }) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(() => salvarFeedbackWhatsapp(!atual));
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${atual ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-slate-700"}`}>
          <MessageCircle size={16} className={atual ? "text-green-600 dark:text-green-400" : "text-gray-400"} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-slate-100">Feedback ao cliente via WhatsApp</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {atual
              ? "Ao despachar, abre link wa.me com mensagem ao cliente"
              : "Ao despachar, apenas muda o status sem abrir WhatsApp"}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
          atual ? "bg-green-500" : "bg-gray-300 dark:bg-slate-600"
        }`}
        role="switch"
        aria-checked={atual}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
            atual ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
