import { HeroCarousel } from "@/components/HeroCarousel";
import { ContentSection } from "@/components/ContentSection";
import { getMovies, getSeries, getAnimes } from "@/lib/data";
import { RecommendedForYou } from "@/components/RecommendedForYou";
import { RecentEpisodesSection } from "@/components/RecentEpisodesSection";
import { getCurrentUserServer } from "@/app/actions/auth";
import type { Content } from "@/types";

export default async function Home() {
  const user = await getCurrentUserServer();
  const maxAge = user?.maxAgeRating ?? 16;

  const [moviesRaw, seriesRaw, animesRaw] = await Promise.all([
    getMovies(),
    getSeries(),
    getAnimes(),
  ]);

  const filterByAge = (items: Content[]) =>
    items.filter((item) => {
      const ratingNumber = Number(item.ageRating);
      if (!Number.isFinite(ratingNumber)) return false;
      return ratingNumber <= maxAge;
    });

  const movies = filterByAge(moviesRaw);
  const series = filterByAge(seriesRaw);
  const animes = filterByAge(animesRaw);

  const allItems = [...movies, ...series, ...animes];

  const recentItems = allItems
    .filter((item) => item.year >= 2020)
    .sort((a, b) => b.year - a.year)
    .slice(0, 15);

  // Prepare Hero Carousel Items (Top 3 from each category mixed)
  const heroItems = [
    ...movies.slice(0, 3),
    ...series.slice(0, 3),
    ...animes.slice(0, 3),
  ].sort((a, b) => b.rating - a.rating); // Sort by rating to show best first

  return (
    <div className="pb-8">
      <HeroCarousel items={heroItems} />
      
      <div className="-mt-32 relative z-10 space-y-4">
        <RecommendedForYou items={allItems} />
        <ContentSection title="Recém-lançados" items={recentItems} />
        <ContentSection title="Filmes em Alta" items={movies} />
        <ContentSection title="Séries Populares" items={series} />
        <ContentSection title="Animes Favoritos" items={animes} />
        <ContentSection title="Continuar Assistindo" items={[...movies, ...animes].slice(0, 12)} />
        <RecentEpisodesSection />
      </div>
    </div>
  );
}
