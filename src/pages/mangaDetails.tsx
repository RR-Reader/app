import { useParams } from "react-router-dom";

export default function MangaDetail() {
  const { identifier, provider } = useParams();

  const manga: {
    title: string;
    provider: string;
  } = { title: "", provider: "" };

  if (identifier && provider) {
    manga.title = identifier;
    manga.provider = provider;
  } else {
    manga.title = "Unknown";
    manga.provider = "Unknown";
  }

  return (
    <>
      <h2>Manga Title: {manga.title}</h2>
      <h2>Manga Provider: {manga.provider}</h2>
    </>
  );
}
