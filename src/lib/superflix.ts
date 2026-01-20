import { Content } from "@/types";

const SUPERFLIX_BASE_URL = "https://superflixhd.epizy.com";

type SuperflixType = "movies" | "tvshows";

function buildSuperflixUrl(type: SuperflixType, imdbId: string) {
  const url = new URL("/embed-2/", SUPERFLIX_BASE_URL);
  url.searchParams.set("type", type);
  url.searchParams.set("imdb", imdbId);
  return url.toString();
}

export async function getTmdbImages(
  _title: string,
  _year: number,
  _mediaType: "movie" | "tv"
) {
  return null;
}

function mapSuperflixMovieToContent(imdbId: string, title: string): Content {
  return {
    id: `superflix-movie-${imdbId}`,
    title,
    description: "Assistir via Superflix",
    thumbnailUrl: "",
    coverUrl: "",
    genre: [],
    rating: 0,
    year: 0,
    ageRating: "14",
    type: "movie",
    duration: undefined,
    embedUrl: buildSuperflixUrl("movies", imdbId),
  };
}

export async function getPopularMovies(limit = 20): Promise<Content[]> {
  const movies = [
    { title: "Homem-Aranha", imdbId: "tt10872600" },
    { title: "Top Gun Maverick", imdbId: "tt1745960" },
  ];

  return movies.slice(0, limit).map((m) =>
    mapSuperflixMovieToContent(m.imdbId, m.title)
  );
}

export async function searchMovies(
  query: string,
  limit = 20
): Promise<Content[]> {
  const fakeResult = [{ title: query, imdbId: "tt1386697" }];

  return fakeResult.slice(0, limit).map((m) =>
    mapSuperflixMovieToContent(m.imdbId, m.title)
  );
}

function mapSuperflixTvToContent(
  imdbId: string,
  title: string,
  type: "series" | "anime"
): Content {
  return {
    id: `superflix-tv-${imdbId}`,
    title,
    description: "Assistir via Superflix",
    thumbnailUrl: "",
    coverUrl: "",
    genre: [],
    rating: 0,
    year: 0,
    ageRating: "14",
    type,
    seasons: undefined,
    embedUrl: buildSuperflixUrl("tvshows", imdbId),
  };
}

export async function getPopularSeries(limit = 20): Promise<Content[]> {
  const series = [
    { title: "The Boys", imdbId: "tt1190634" },
    { title: "Breaking Bad", imdbId: "tt0903747" },
  ];

  return series.slice(0, limit).map((s) =>
    mapSuperflixTvToContent(s.imdbId, s.title, "series")
  );
}

export async function getPopularAnimes(limit = 20): Promise<Content[]> {
  const animes = [
    { title: "Attack on Titan", imdbId: "tt2560140" },
    { title: "Jujutsu Kaisen", imdbId: "tt12343534" },
  ];

  return animes.slice(0, limit).map((a) =>
    mapSuperflixTvToContent(a.imdbId, a.title, "anime")
  );
}
