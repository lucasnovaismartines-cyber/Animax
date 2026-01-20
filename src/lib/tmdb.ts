/**
 * Developed by BLACK GOLD STUDIOS and Lucas Novais Martines
 */
import 'server-only';
import { Content, Episode } from "@/types";
import { env } from "./env";

const TMDB_API_KEY = env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

type TmdbMediaType = "movie" | "tv";

interface TmdbMovieReleaseDate {
  certification: string;
}

interface TmdbMovieReleaseDatesResult {
  iso_3166_1: string;
  release_dates: TmdbMovieReleaseDate[];
}

interface TmdbMovieReleaseDatesResponse {
  results?: TmdbMovieReleaseDatesResult[];
}

interface TmdbTvContentRating {
  iso_3166_1: string;
  rating: string;
}

interface TmdbTvContentRatingsResponse {
  results?: TmdbTvContentRating[];
}

function mapCertificationToAgeRating(
  certification: string | undefined,
  mediaType: "movie" | "tv",
  isAdult: boolean
): string {
  const fallback = isAdult ? "18" : "14";

  if (!certification) {
    return fallback;
  }

  const value = certification.trim().toUpperCase();
  let result = fallback;

  if (mediaType === "movie") {
    if (value === "L" || value === "0") result = "0";
    else if (value === "10") result = "10";
    else if (value === "12") result = "12";
    else if (value === "14") result = "14";
    else if (value === "16") result = "16";
    else if (value === "18") result = "18";
    else if (value === "G") result = "0";
    else if (value === "PG") result = "10";
    else if (value === "PG-13") result = "14";
    else if (value === "R" || value === "NC-17") result = "18";
  } else {
    if (value === "L" || value === "0" || value === "TV-Y" || value === "TV-G")
      result = "0";
    else if (value === "10" || value === "TV-Y7" || value === "TV-PG")
      result = "10";
    else if (value === "12") result = "12";
    else if (value === "14" || value === "TV-14") result = "14";
    else if (value === "16" || value === "18" || value === "TV-MA") result = "18";
  }

  if (isAdult) {
    const numeric = Number(result);
    if (!Number.isNaN(numeric) && numeric < 18) {
      return "18";
    }
  }

  return result;
}

async function getMovieCertification(movieId: number): Promise<string | undefined> {
  if (!TMDB_API_KEY) {
    return undefined;
  }

  const url = new URL(`${TMDB_BASE_URL}/movie/${movieId}/release_dates`);
  url.searchParams.set("api_key", TMDB_API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    return undefined;
  }

  const data: TmdbMovieReleaseDatesResponse = await res.json();
  if (!data.results || !Array.isArray(data.results)) {
    return undefined;
  }

  const preferredCountries = ["BR", "US"];

  for (const country of preferredCountries) {
    const entry = data.results.find(
      (r) => r.iso_3166_1 === country && Array.isArray(r.release_dates)
    );
    if (entry) {
      const withCert = entry.release_dates.find(
        (d) => typeof d.certification === "string" && d.certification.trim().length > 0
      );
      if (withCert) {
        return withCert.certification.trim();
      }
    }
  }

  const anyEntry = data.results.find(
    (r) =>
      Array.isArray(r.release_dates) &&
      r.release_dates.some(
        (d) => typeof d.certification === "string" && d.certification.trim().length > 0
      )
  );

  if (anyEntry) {
    const withCert = anyEntry.release_dates.find(
      (d) => typeof d.certification === "string" && d.certification.trim().length > 0
    );
    if (withCert) {
      return withCert.certification.trim();
    }
  }

  return undefined;
}

async function getTvCertification(tvId: number): Promise<string | undefined> {
  if (!TMDB_API_KEY) {
    return undefined;
  }

  const url = new URL(`${TMDB_BASE_URL}/tv/${tvId}/content_ratings`);
  url.searchParams.set("api_key", TMDB_API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    return undefined;
  }

  const data: TmdbTvContentRatingsResponse = await res.json();
  if (!data.results || !Array.isArray(data.results)) {
    return undefined;
  }

  const preferredCountries = ["BR", "US"];

  for (const country of preferredCountries) {
    const entry = data.results.find(
      (r) =>
        r.iso_3166_1 === country &&
        typeof r.rating === "string" &&
        r.rating.trim().length > 0
    );
    if (entry) {
      return entry.rating.trim();
    }
  }

  const anyEntry = data.results.find(
    (r) => typeof r.rating === "string" && r.rating.trim().length > 0
  );

  if (anyEntry) {
    return anyEntry.rating.trim();
  }

  return undefined;
}

export async function getTmdbImages(
  title: string,
  year: number,
  mediaType: TmdbMediaType
) {
  if (!TMDB_API_KEY) {
    return null;
  }

  const searchPath = mediaType === "movie" ? "movie" : "tv";
  const url = new URL(`${TMDB_BASE_URL}/search/${searchPath}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("query", title);
  if (year) {
    if (mediaType === "movie") {
      url.searchParams.set("year", String(year));
    } else {
      url.searchParams.set("first_air_date_year", String(year));
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = await res.json();
  const result = data.results?.[0];
  if (!result) return null;

  return {
    posterUrl: result.poster_path
      ? `${TMDB_IMAGE_BASE}/w500${result.poster_path}`
      : null,
    backdropUrl: result.backdrop_path
      ? `${TMDB_IMAGE_BASE}/w780${result.backdrop_path}`
      : null,
  };
}

interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  adult?: boolean;
}

function mapTmdbMovieToContent(movie: TmdbMovie, ageRating: string): Content {
  const year = movie.release_date ? Number(movie.release_date.slice(0, 4)) : 0;

  return {
    id: `tmdb-movie-${movie.id}`,
    title: movie.title,
    description: movie.overview || "Sem descrição disponível.",
    thumbnailUrl: movie.poster_path
      ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}`
      : "",
    coverUrl: movie.backdrop_path
      ? `${TMDB_IMAGE_BASE}/w780${movie.backdrop_path}`
      : "",
    genre: [],
    rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : 0,
    year,
    ageRating,
    type: "movie",
    duration: undefined,
  };
}

export async function getPopularMovies(limit = 60): Promise<Content[]> {
  if (!TMDB_API_KEY) {
    return [];
  }

  const perPage = 20;
  const maxPages = Math.max(1, Math.ceil(limit / perPage));
  const items: Content[] = [];

  for (let page = 1; page <= maxPages && items.length < limit; page++) {
    const url = new URL(`${TMDB_BASE_URL}/movie/popular`);
    url.searchParams.set("api_key", TMDB_API_KEY);
    url.searchParams.set("language", "pt-BR");
    url.searchParams.set("page", String(page));

    const res = await fetch(url.toString());
    if (!res.ok) break;

    const data = await res.json();
    const results: TmdbMovie[] = data.results ?? [];
    if (!results.length) break;

    const mapped = await Promise.all(
      results.map(async (movie) => {
        const certification = await getMovieCertification(movie.id);
        const ageRating = mapCertificationToAgeRating(
          certification,
          "movie",
          movie.adult === true
        );
        return mapTmdbMovieToContent(movie, ageRating);
      })
    );

    for (const content of mapped) {
      items.push(content);
      if (items.length >= limit) break;
    }
  }

  return items;
}

export async function getTmdbContentById(id: string): Promise<Content | undefined> {
  if (!TMDB_API_KEY) return undefined;

  let tmdbId: number;
  let mediaType: "movie" | "tv";

  if (id.startsWith("tmdb-movie-")) {
    tmdbId = Number(id.replace("tmdb-movie-", ""));
    mediaType = "movie";
  } else if (id.startsWith("tmdb-tv-")) {
    tmdbId = Number(id.replace("tmdb-tv-", ""));
    mediaType = "tv";
  } else {
    return undefined;
  }

  if (Number.isNaN(tmdbId)) return undefined;

  const url = new URL(`${TMDB_BASE_URL}/${mediaType}/${tmdbId}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "pt-BR");

  const res = await fetch(url.toString());
  if (!res.ok) return undefined;

  const data = await res.json();

  if (mediaType === "movie") {
    const movie = data as TmdbMovie;
    const certification = await getMovieCertification(movie.id);
    const ageRating = mapCertificationToAgeRating(
      certification,
      "movie",
      movie.adult === true
    );
    return mapTmdbMovieToContent(movie, ageRating);
  } else {
    const tv = data;
    // Check if anime based on genre (16) and language (ja)
    const isAnime =
      tv.original_language === "ja" &&
      Array.isArray(tv.genres) &&
      tv.genres.some((g: any) => g.id === 16);

    const certification = await getTvCertification(tv.id);
    const ageRating = mapCertificationToAgeRating(
      certification,
      "tv",
      tv.adult === true
    );
    return mapTmdbTvToContent(
      tv as TmdbTv,
      isAnime ? "anime" : "series",
      ageRating
    );
  }
}

export async function getPopularMoviesPage(page: number): Promise<Content[]> {
  if (!TMDB_API_KEY) {
    return [];
  }

  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;

  const url = new URL(`${TMDB_BASE_URL}/movie/popular`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("page", String(currentPage));

  const res = await fetch(url.toString());
  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  const results: TmdbMovie[] = data.results ?? [];
  if (!results.length) {
    return [];
  }

  const mapped = await Promise.all(
    results.map(async (movie) => {
      const certification = await getMovieCertification(movie.id);
      const ageRating = mapCertificationToAgeRating(
        certification,
        "movie",
        movie.adult === true
      );
      return mapTmdbMovieToContent(movie, ageRating);
    })
  );

  return mapped;
}

export async function getRecentAnimeEpisodes(limit = 10): Promise<Episode[]> {
  if (!TMDB_API_KEY) {
    return [];
  }

  // Calculate dates
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const url = new URL(`${TMDB_BASE_URL}/discover/tv`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("with_genres", "16"); // Anime
  url.searchParams.set("with_original_language", "ja");
  url.searchParams.set("air_date.gte", formatDate(oneWeekAgo));
  url.searchParams.set("air_date.lte", formatDate(today));
  url.searchParams.set("sort_by", "popularity.desc");

  const res = await fetch(url.toString());
  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  const results: TmdbTv[] = data.results ?? [];

  // Limit candidates to avoid too many requests
  const candidates = results.slice(0, limit * 2);
  const episodes: Episode[] = [];

  await Promise.all(
    candidates.map(async (show) => {
      const detailsUrl = new URL(`${TMDB_BASE_URL}/tv/${show.id}`);
      detailsUrl.searchParams.set("api_key", TMDB_API_KEY);
      detailsUrl.searchParams.set("language", "pt-BR");
      
      const detailsRes = await fetch(detailsUrl.toString());
      if (detailsRes.ok) {
        const details: TmdbTvDetails = await detailsRes.json();
        const lastEp = details.last_episode_to_air;
        
        if (lastEp) {
           episodes.push({
            id: `tmdb-ep-${lastEp.id}`,
            seriesId: `tmdb-tv-${show.id}`,
            seriesTitle: show.name,
            title: lastEp.name,
            description: lastEp.overview,
            thumbnailUrl: lastEp.still_path
              ? `${TMDB_IMAGE_BASE}/w500${lastEp.still_path}`
              : show.backdrop_path
              ? `${TMDB_IMAGE_BASE}/w780${show.backdrop_path}`
              : "",
            seasonNumber: lastEp.season_number,
            episodeNumber: lastEp.episode_number,
            airDate: lastEp.air_date,
            duration: lastEp.runtime,
          });
        }
      }
    })
  );

  // Sort by airDate desc
  return episodes
    .sort((a, b) => new Date(b.airDate).getTime() - new Date(a.airDate).getTime())
    .slice(0, limit);
}

export async function getPopularSeriesPage(page: number): Promise<Content[]> {
  if (!TMDB_API_KEY) {
    return [];
  }

  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;

  const url = new URL(`${TMDB_BASE_URL}/tv/popular`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("page", String(currentPage));

  const res = await fetch(url.toString());
  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  const results: TmdbTv[] = data.results ?? [];
  if (!results.length) {
    return [];
  }

  const mapped = await Promise.all(
    results.map(async (tv) => {
      const certification = await getTvCertification(tv.id);
      const ageRating = mapCertificationToAgeRating(
        certification,
        "tv",
        tv.adult === true
      );
      return mapTmdbTvToContent(tv, "series", ageRating);
    })
  );

  return mapped;
}

export async function getPopularAnimesPage(page: number): Promise<Content[]> {
  if (!TMDB_API_KEY) {
    return [];
  }

  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;

  const url = new URL(`${TMDB_BASE_URL}/discover/tv`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("page", String(currentPage));
  url.searchParams.set("with_genres", "16");
  url.searchParams.set("with_original_language", "ja");

  const res = await fetch(url.toString());
  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  const results: TmdbTv[] = data.results ?? [];
  if (!results.length) {
    return [];
  }

  const mapped = await Promise.all(
    results.map(async (tv) => {
      const certification = await getTvCertification(tv.id);
      const ageRating = mapCertificationToAgeRating(
        certification,
        "tv",
        tv.adult === true
      );
      return mapTmdbTvToContent(tv, "anime", ageRating);
    })
  );

  return mapped;
}

export async function searchMovies(query: string, limit = 20): Promise<Content[]> {
  if (!TMDB_API_KEY) {
    return [];
  }

  const url = new URL(`${TMDB_BASE_URL}/search/movie`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("query", query);
  url.searchParams.set("page", "1");
  url.searchParams.set("include_adult", "false");

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = await res.json();
  const results: TmdbMovie[] = data.results ?? [];

  const sliced = results.slice(0, limit);

  const mapped = await Promise.all(
    sliced.map(async (movie) => {
      const certification = await getMovieCertification(movie.id);
      const ageRating = mapCertificationToAgeRating(
        certification,
        "movie",
        movie.adult === true
      );
      return mapTmdbMovieToContent(movie, ageRating);
    })
  );

  return mapped;
}

export async function searchSeries(query: string, limit = 20): Promise<Content[]> {
  if (!TMDB_API_KEY) {
    return [];
  }

  const url = new URL(`${TMDB_BASE_URL}/search/tv`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("query", query);
  url.searchParams.set("page", "1");

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = await res.json();
  const results: TmdbTv[] = data.results ?? [];

  const sliced = results.slice(0, limit);

  const mapped = await Promise.all(
    sliced.map(async (tv) => {
      const certification = await getTvCertification(tv.id);
      const ageRating = mapCertificationToAgeRating(
        certification,
        "tv",
        tv.adult === true
      );
      return mapTmdbTvToContent(tv, "series", ageRating);
    })
  );

  return mapped;
}

interface TmdbTv {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date?: string;
  adult?: boolean;
}

interface TmdbSeasonInfo {
  season_number: number;
  episode_count: number;
}

interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  episode_number: number;
  season_number: number;
  runtime?: number;
}

interface TmdbTvDetails {
  number_of_seasons?: number;
  seasons?: TmdbSeasonInfo[];
  last_episode_to_air?: TmdbEpisode;
  next_episode_to_air?: TmdbEpisode;
}

function mapTmdbTvToContent(
  tv: TmdbTv,
  type: "series" | "anime",
  ageRating: string
): Content {
  const year = tv.first_air_date ? Number(tv.first_air_date.slice(0, 4)) : 0;

  return {
    id: `tmdb-tv-${tv.id}`,
    title: tv.name,
    description: tv.overview || "Sem descrição disponível.",
    thumbnailUrl: tv.poster_path
      ? `${TMDB_IMAGE_BASE}/w500${tv.poster_path}`
      : "",
    coverUrl: tv.backdrop_path
      ? `${TMDB_IMAGE_BASE}/w780${tv.backdrop_path}`
      : "",
    genre: [],
    rating: tv.vote_average ? Number(tv.vote_average.toFixed(1)) : 0,
    year,
    ageRating,
    type,
    seasons: undefined,
  };
}

export async function getTvSeasonsInfo(tvId: number) {
  if (!TMDB_API_KEY) {
    return null;
  }

  const url = new URL(`${TMDB_BASE_URL}/tv/${tvId}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "pt-BR");

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data: TmdbTvDetails = await res.json();

  const numberOfSeasons =
    typeof data.number_of_seasons === "number"
      ? data.number_of_seasons
      : data.seasons?.length ?? 0;

  const episodesBySeason: Record<number, number> = {};

  if (Array.isArray(data.seasons)) {
    for (const season of data.seasons) {
      if (
        typeof season.season_number === "number" &&
        typeof season.episode_count === "number" &&
        season.season_number > 0
      ) {
        episodesBySeason[season.season_number] = season.episode_count;
      }
    }
  }

  return {
    numberOfSeasons,
    episodesBySeason,
  };
}

export async function getPopularSeries(limit = 60): Promise<Content[]> {
  if (!TMDB_API_KEY) {
    return [];
  }

  const perPage = 20;
  const maxPages = Math.max(1, Math.ceil(limit / perPage));
  const items: Content[] = [];

  for (let page = 1; page <= maxPages && items.length < limit; page++) {
    const url = new URL(`${TMDB_BASE_URL}/tv/popular`);
    url.searchParams.set("api_key", TMDB_API_KEY);
    url.searchParams.set("language", "pt-BR");
    url.searchParams.set("page", String(page));

    const res = await fetch(url.toString());
    if (!res.ok) break;

    const data = await res.json();
    const results: TmdbTv[] = data.results ?? [];
    if (!results.length) break;

    const mapped = await Promise.all(
      results.map(async (tv) => {
        const certification = await getTvCertification(tv.id);
        const ageRating = mapCertificationToAgeRating(
          certification,
          "tv",
          tv.adult === true
        );
        return mapTmdbTvToContent(tv, "series", ageRating);
      })
    );

    for (const content of mapped) {
      items.push(content);
      if (items.length >= limit) break;
    }
  }

  return items;
}

export async function getPopularAnimes(limit = 60): Promise<Content[]> {
  if (!TMDB_API_KEY) {
    return [];
  }

  const perPage = 20;
  const maxPages = Math.max(1, Math.ceil(limit / perPage));
  const items: Content[] = [];

  for (let page = 1; page <= maxPages && items.length < limit; page++) {
    const url = new URL(`${TMDB_BASE_URL}/discover/tv`);
    url.searchParams.set("api_key", TMDB_API_KEY);
    url.searchParams.set("language", "pt-BR");
    url.searchParams.set("page", String(page));
    url.searchParams.set("with_genres", "16");
    url.searchParams.set("with_original_language", "ja");

    const res = await fetch(url.toString());
    if (!res.ok) break;

    const data = await res.json();
    const results: TmdbTv[] = data.results ?? [];
    if (!results.length) break;

    const mapped = await Promise.all(
      results.map(async (tv) => {
        const certification = await getTvCertification(tv.id);
        const ageRating = mapCertificationToAgeRating(
          certification,
          "tv",
          tv.adult === true
        );
        return mapTmdbTvToContent(tv, "anime", ageRating);
      })
    );

    for (const content of mapped) {
      items.push(content);
      if (items.length >= limit) break;
    }
  }

  return items;
}
