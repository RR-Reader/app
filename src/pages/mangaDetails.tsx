import { useParams } from "react-router";
import { useGetMangaDetails } from "@/hooks/queries";

export default function MangaDetail() {
  const { identifier, source } = useParams<{
    identifier: string;
    source: string;
  }>();

  const { data, isLoading, error } = useGetMangaDetails(identifier, source);

  console.log("Data:", data);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        Error loading manga details: {error.message} | Identifier: {identifier}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="aspect-[3/4] max-h-96">
        <img
          src={data?.cover_url}
          alt=""
          className="size-full rounded object-cover"
        />
      </div>
      <div className="flex max-w-120 flex-col gap-1">
        <h1 className="text-3xl font-bold">{data?.title}</h1>
        {data?.authors && (
          <p className="text-muted-foreground text-sm">
            <span className="text-primary font-bold">Authors:</span>{" "}
            {data.authors.join(", ")}
          </p>
        )}

        {data?.artists && (
          <p className="text-muted-foreground text-sm">
            <span className="text-primary font-bold">Artists:</span>{" "}
            {data.artists.join(", ")}
          </p>
        )}

        {data?.genres && (
          <p className="text-muted-foreground text-sm">
            <span className="text-primary font-bold">Genres:</span>{" "}
            {data.genres.join(", ")}
          </p>
        )}

        <p className="text-muted-foreground mt-4">{data?.description}</p>
      </div>
      <div>test</div>
    </div>
  );
}
