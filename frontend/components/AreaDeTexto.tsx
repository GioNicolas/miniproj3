import type { TextareaHTMLAttributes } from "react";

// Caixa de texto de várias linhas (post, comentário, edição). Mesmo visual do Campo.
export function AreaDeTexto({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full resize-none rounded-[10px] border border-borda-forte bg-superficie px-4 py-3 text-base leading-relaxed text-tinta outline-none placeholder:text-suave focus-visible:ring-2 focus-visible:ring-destaque focus-visible:ring-offset-2 focus-visible:ring-offset-fundo ${className}`}
      {...props}
    />
  );
}
