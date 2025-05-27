export function MangaCard({
  coverUrl,
  title,
}: {
  coverUrl: string | undefined;
  title: string;
}) {
  return (
    <div>
      <img
        className="aspect-[3/4] rounded-lg object-cover"
        src={coverUrl}
        alt="manga cover"
      />
      <h2 className="line-clamp-2 font-medium overflow-ellipsis">{title}</h2>
    </div>
  );
}
