import type { TextareaHTMLAttributes } from "react";

// Caixa de texto de várias linhas (post, comentário, edição). Mesmo visual do Campo.
export function AreaDeTexto({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full resize-y rounded-lg border border-borda bg-superficie px-3 py-2 text-tinta outline-none placeholder:text-suave focus:border-destaque ${className}`}
      {...props}
    />
  );
}
