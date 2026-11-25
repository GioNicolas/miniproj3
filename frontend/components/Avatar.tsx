type Props = { name: string; avatarUrl: string; grande?: boolean };

export function Avatar({ name, avatarUrl, grande = false }: Props) {
  const tamanho = grande ? "h-20 w-20 text-3xl" : "h-10 w-10";
  return (
    <div className={`flex ${tamanho} shrink-0 items-center justify-center rounded-full bg-borda font-semibold`}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className={`${tamanho} rounded-full object-cover`} />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  );
}
