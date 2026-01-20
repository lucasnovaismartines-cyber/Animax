/**
 * Developed by BLACK GOLD STUDIOS and Lucas Novais Martines
 */
import { Content } from "@/types";
import { movies as localMovies } from "./catalog/movies";
import { series as localSeries } from "./catalog/series";
import { animes as localAnimes } from "./catalog/animes";
import { getPopularMovies, getPopularSeries, getPopularAnimes, getTmdbContentById } from "./tmdb";

export const featuredContent: Content = {
  id: "hero-1",
  title: "Cyberpunk: Edgerunners",
  description:
    "Em uma distopia repleta de corrupção e implantes cibernéticos, um garoto de rua talentoso e impulsivo tenta se tornar um mercenário fora da lei: um edgerunner.",
  thumbnailUrl:
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=60",
  coverUrl:
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1600&auto=format&fit=crop&q=80",
  genre: ["Anime", "Sci-Fi", "Ação"],
  rating: 4.8,
  year: 2022,
  ageRating: "16",
  type: "anime",
  seasons: 1,
  videoUrl: "https://www.youtube.com/embed/JtqIas3bYhg",
};

export async function getMovies(): Promise<Content[]> {
  const fromTmdb = await getPopularMovies(60);
  return fromTmdb.length > 0 ? fromTmdb : localMovies;
}

export async function getSeries(): Promise<Content[]> {
  const fromTmdb = await getPopularSeries(60);
  return fromTmdb.length > 0 ? fromTmdb : localSeries;
}

export async function getAnimes(): Promise<Content[]> {
  const fromTmdb = await getPopularAnimes(60);
  return fromTmdb.length > 0 ? fromTmdb : localAnimes;
}

export async function getAllContent(): Promise<Content[]> {
  const [movies, series, animes] = await Promise.all([
    getMovies(),
    getSeries(),
    getAnimes(),
  ]);
  return [...movies, ...series, ...animes, featuredContent];
}

export async function getContentById(id: string): Promise<Content | undefined> {
  // 1. Check local content first
  const local = [...localMovies, ...localSeries, ...localAnimes, featuredContent];
  const foundLocal = local.find((item) => item.id === id);
  if (foundLocal) return foundLocal;

  // 2. Try fetching from TMDB directly
  return getTmdbContentById(id);
}
