import { TmdbContentCard } from "@/components/TmdbContentCard";
import { searchMovies, searchSeries } from "@/lib/tmdb";
import type { Content } from "@/types";
import { getCurrentUserServer } from "@/app/actions/auth";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  let movies: Content[] = [];
  let series: Content[] = [];

  if (query) {
    const user = await getCurrentUserServer();
    const maxAge = user?.maxAgeRating ?? 16;
    const [moviesRaw, seriesRaw] = await Promise.all([
      searchMovies(query, 12),
      searchSeries(query, 12),
    ]);
    const filterByAge = (items: Content[]) =>
      items.filter((item) => {
        const ratingNumber = Number(item.ageRating);
        if (!Number.isFinite(ratingNumber)) return false;
        return ratingNumber <= maxAge;
      });
    movies = filterByAge(moviesRaw);
    series = filterByAge(seriesRaw);
  }

  return (
    <div className="pt-24 px-4 md:px-12 pb-12 min-h-screen bg-[#0a0a0a]">
      <h1 className="text-3xl font-bold mb-6">Buscar</h1>

      <form className="mb-8 max-w-xl">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Buscar por filmes ou séries..."
          className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </form>

      {!query && (
        <p className="text-gray-400">
          Digite o nome de um filme ou série para buscar.
        </p>
      )}

      {query && movies.length === 0 && series.length === 0 && (
        <p className="text-gray-400">
          Nenhum resultado encontrado para &quot;{query}&quot;.
        </p>
      )}

      {movies.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Filmes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((item) => (
              <TmdbContentCard key={item.id} content={item} />
            ))}
          </div>
        </section>
      )}

      {series.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Séries</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {series.map((item) => (
              <TmdbContentCard key={item.id} content={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
