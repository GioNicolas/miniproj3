export function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 font-semibold">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  );
}
