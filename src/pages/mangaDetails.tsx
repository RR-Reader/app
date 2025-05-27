import { useParams } from "react-router";
import type { Manga } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";

const useMangaDetails = (identifier: string) => {
  return useQuery<Manga>({
    queryKey: ["manga_details", identifier],
    queryFn: () => invoke<Manga>("get_manga_details", { identifier }),
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export default function MangaDetail() {
  const { identifier = "Unknown" } = useParams<{
    identifier: string;
    provider: string;
  }>();

  const { data, isLoading, error } = useMangaDetails(identifier || "");

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
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="aspect-[3/4] max-h-96">
          <img src={data?.cover_url} alt="" className="rounded object-cover" />
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
    </>
  );
}
