import { getRecentAnimeEpisodes } from "@/lib/tmdb";
import { EpisodeCard } from "./EpisodeCard";

export async function RecentEpisodesSection() {
  const episodes = await getRecentAnimeEpisodes(10);

  if (episodes.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <div className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
        Recém Adicionados
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {episodes.map((ep) => (
          <EpisodeCard key={ep.id} episode={ep} />
        ))}
      </div>
    </section>
  );
}
