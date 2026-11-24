import { Avatar } from "@/components/Avatar";
import type { User } from "@/lib/api";

export function UserCard({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-borda bg-superficie p-3">
      <Avatar name={user.name} avatarUrl={user.avatar_url} />
      <div className="min-w-0">
        <p className="truncate font-semibold">{user.name}</p>
        <p className="truncate text-sm text-suave">
          @{user.username}
          {user.bio ? ` · ${user.bio}` : ""}
        </p>
      </div>
    </div>
  );
}
