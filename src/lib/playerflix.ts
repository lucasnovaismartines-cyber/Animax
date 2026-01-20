
/**
 * Developed by BLACK GOLD STUDIOS and Lucas Novais Martines
 */
export const PLAYERFLIX_BASE_URL = "https://superflixapi.asia";

export function getPlayerUrl(contentId: string, type: "movie" | "series" | "anime", season = 1, episode = 1) {
  // Extract TMDB ID from content ID (e.g., "tmdb-movie-12345" -> "12345")
  const parts = contentId.split("-");
  const tmdbId = parts[parts.length - 1];

  // Check if it's a valid TMDB ID (numeric)
  if (!/^\d+$/.test(tmdbId)) {
    return null; 
  }

  if (type === "movie") {
    return `${PLAYERFLIX_BASE_URL}/filme/${tmdbId}`;
  } else {
    // For series and animes
    return `${PLAYERFLIX_BASE_URL}/serie/${tmdbId}/${season}/${episode}`;
  }
}
