import { Link } from "react-router";

export function MangaCard({
  coverUrl,
  title,
  identifier,
  source,
}: {
  coverUrl: string | undefined;
  title: string;
  identifier: string;
  source: string;
}) {
  return (
    <Link to={`/manga/${source}/${identifier}`}>
      <div>
        <img
          className="aspect-[3/4] rounded-lg object-cover"
          src={coverUrl}
          alt="manga cover"
        />
        <h2 className="line-clamp-2 font-medium overflow-ellipsis">{title}</h2>
      </div>
    </Link>
  );
}
