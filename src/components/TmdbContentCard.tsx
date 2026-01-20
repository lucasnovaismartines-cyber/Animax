import { Content } from "@/types";
import { getTmdbImages } from "@/lib/tmdb";
import { ContentCard } from "./ContentCard";

interface TmdbContentCardProps {
  content: Content;
}

export async function TmdbContentCard({ content }: TmdbContentCardProps) {
  const mediaType = content.type === "movie" ? "movie" : "tv";
  const images = await getTmdbImages(content.title, content.year, mediaType);

  const patchedContent: Content = {
    ...content,
    thumbnailUrl: images?.posterUrl ?? content.thumbnailUrl,
    coverUrl: images?.backdropUrl ?? content.coverUrl,
  };

  return <ContentCard content={patchedContent} />;
}

