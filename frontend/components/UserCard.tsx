import Link from "next/link";

import { Avatar } from "@/components/Avatar";
import type { User } from "@/lib/api";

// Pessoa numa lista: linha, não card; toca e abre o perfil. A linha de baixo separa uma da outra.
export function UserCard({ user }: { user: User }) {
  return (
    <Link href={`/u/${user.username}`} className="flex min-h-16 items-center gap-3 border-b border-borda py-3 hover:bg-superficie/60">
      <Avatar name={user.name} avatarUrl={user.avatar_url} />
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold">{user.name}</p>
        <p className="truncate text-[13px] text-suave">
          @{user.username}
          {user.bio ? ` · ${user.bio}` : ""}
        </p>
      </div>
    </Link>
  );
}
