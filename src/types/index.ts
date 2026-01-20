export type ContentType = 'movie' | 'series' | 'anime';

export interface Content {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  coverUrl: string;
  genre: string[];
  rating: number;
  year: number;
  type: ContentType;
  ageRating: string;
  duration?: string; // Para filmes
  seasons?: number; // Para séries e animes
  videoUrl?: string; // Trailer oficial (YouTube)
  embedUrl?: string; // Player completo (iframe externo)
  cast?: string[];
  director?: string;
}

export interface Episode {
  id: string;
  seriesId: string;
  seriesTitle: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  seasonNumber: number;
  episodeNumber: number;
  airDate: string;
  duration?: number;
}

export interface Section {
  title: string;
  items: Content[];
}
