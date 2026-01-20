import { TmdbContentCard } from "@/components/TmdbContentCard";
import { getCurrentUserServer } from "@/app/actions/auth";
import { getPopularMoviesPage } from "@/lib/tmdb";
import Link from "next/link";
import type { Content } from "@/types";

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUserServer();
  const maxAge = user?.maxAgeRating ?? 16;

  const sp = await searchParams;
  const rawPage = sp?.page;
  const parsedPage = Array.isArray(rawPage)
    ? Number(rawPage[0])
    : Number(rawPage ?? "1");
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const moviesRaw = await getPopularMoviesPage(currentPage);
  const movies = moviesRaw.filter((item: Content) => {
    const ratingNumber = Number(item.ageRating);
    if (!Number.isFinite(ratingNumber)) return false;
    return ratingNumber <= maxAge;
  });

  const hasResults = movies.length > 0;
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = hasResults ? currentPage + 1 : null;

  return (
    <div className="pt-24 px-4 md:px-12 pb-16">
      <h1 className="text-3xl font-bold mb-8">Filmes</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <TmdbContentCard key={movie.id} content={movie} />
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mt-10">
        {prevPage && (
          <Link
            href={`/movies?page=${prevPage}`}
            className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800 transition"
          >
            Página anterior
          </Link>
        )}
        {nextPage && (
          <Link
            href={`/movies?page=${nextPage}`}
            className="px-4 py-2 rounded-lg border border-cyan-600 text-cyan-300 hover:bg-cyan-600/20 transition"
          >
            Próxima página
          </Link>
        )}
      </div>
    </div>
  );
}
