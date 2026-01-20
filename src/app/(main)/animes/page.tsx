import { TmdbContentCard } from "@/components/TmdbContentCard";
import { RecentEpisodesSection } from "@/components/RecentEpisodesSection";
import { getCurrentUserServer } from "@/app/actions/auth";
import { getPopularAnimesPage } from "@/lib/tmdb";
import Link from "next/link";
import type { Content } from "@/types";

export default async function AnimesPage({
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

  const animesRaw = await getPopularAnimesPage(currentPage);
  const animes = animesRaw.filter((item: Content) => {
    const ratingNumber = Number(item.ageRating);
    if (!Number.isFinite(ratingNumber)) return false;
    return ratingNumber <= maxAge;
  });

  const hasResults = animes.length > 0;
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = hasResults ? currentPage + 1 : null;

  return (
    <div className="pt-24 px-4 md:px-12 pb-16">
      <h1 className="text-3xl font-bold mb-8">Populares</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-16">
        {animes.map((anime) => (
          <TmdbContentCard key={anime.id} content={anime} />
        ))}
      </div>

      <RecentEpisodesSection />

      <div className="flex justify-center items-center gap-4 mt-10">
        {prevPage && (
          <Link
            href={`/animes?page=${prevPage}`}
            className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800 transition"
          >
            Página anterior
          </Link>
        )}
        {nextPage && (
          <Link
            href={`/animes?page=${nextPage}`}
            className="px-4 py-2 rounded-lg border border-cyan-600 text-cyan-300 hover:bg-cyan-600/20 transition"
          >
            Próxima página
          </Link>
        )}
      </div>
    </div>
  );
}
