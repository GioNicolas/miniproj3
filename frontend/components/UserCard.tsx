import { Avatar } from "@/components/Avatar";
import type { User } from "@/lib/api";

// Pessoa numa lista: linha, não card. A linha de baixo separa uma da outra.
export function UserCard({ user }: { user: User }) {
  return (
    <div className="flex min-h-16 items-center gap-3 border-b border-borda py-3">
      <Avatar name={user.name} avatarUrl={user.avatar_url} />
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold">{user.name}</p>
        <p className="truncate text-[13px] text-suave">
          @{user.username}
          {user.bio ? ` · ${user.bio}` : ""}
        </p>
      </div>
    </div>
  );
}
