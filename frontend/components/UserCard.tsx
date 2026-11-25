import Link from "next/link";

import { Avatar } from "@/components/Avatar";
import type { User } from "@/lib/api";

// Linha de pessoa (seguidores, seguindo, lista de usuários): toca e abre o perfil.
export function UserCard({ user }: { user: User }) {
  return (
    <Link
      href={`/u/${user.username}`}
      className="flex min-h-11 items-center gap-3 rounded-2xl border border-borda bg-superficie p-3 hover:border-tinta"
    >
      <Avatar name={user.name} avatarUrl={user.avatar_url} />
      <div className="min-w-0">
        <p className="truncate font-semibold">{user.name}</p>
        <p className="truncate text-sm text-suave">
          @{user.username}
          {user.bio ? ` · ${user.bio}` : ""}
        </p>
      </div>
    </Link>
  );
}
