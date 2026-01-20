import { TmdbContentCard } from "@/components/TmdbContentCard";
import { 
  searchMovies, 
  searchSeries, 
  getMoviesByGenre, 
  getSeriesByGenre, 
  getPopularAnimesPage 
} from "@/lib/tmdb";
import type { Content } from "@/types";
import { getCurrentUserServer } from "@/app/actions/auth";
import { SearchInput } from "@/components/SearchInput";
import Link from "next/link";
import { X } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
  }>;
}

const CATEGORIES = [
  { name: "Ação", color: "from-red-600 to-orange-600", movie: 28, tv: 10759 },
  { name: "Aventura", color: "from-blue-600 to-cyan-600", movie: 12, tv: 10759 },
  { name: "Comédia", color: "from-yellow-500 to-orange-500", movie: 35, tv: 35 },
  { name: "Drama", color: "from-purple-600 to-pink-600", movie: 18, tv: 18 },
  { name: "Ficção Científica", color: "from-indigo-600 to-blue-600", movie: 878, tv: 10765 },
  { name: "Terror", color: "from-gray-800 to-black", movie: 27, tv: 9648 },
  { name: "Romance", color: "from-pink-500 to-rose-500", movie: 10749, tv: 10766 },
  { name: "Animação", color: "from-green-500 to-emerald-600", movie: 16, tv: 16 },
  { name: "Fantasia", color: "from-violet-600 to-fuchsia-600", movie: 14, tv: 10765 },
  { name: "Documentário", color: "from-slate-600 to-zinc-600", movie: 99, tv: 99 },
  { name: "Mistério", color: "from-stone-600 to-neutral-600", movie: 9648, tv: 9648 },
  { name: "Anime", color: "from-sky-500 to-indigo-500", special: "anime" },
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, genre } = await searchParams;
  const query = (q || "").trim();
  const genreName = (genre || "").trim();

  let movies: Content[] = [];
  let series: Content[] = [];
  let isGenreFilter = false;

  const user = await getCurrentUserServer();
  const maxAge = user?.maxAgeRating ?? 16;
  const filterByAge = (items: Content[]) =>
    items.filter((item) => {
      const ratingNumber = Number(item.ageRating);
      if (!Number.isFinite(ratingNumber)) return false;
      return ratingNumber <= maxAge;
    });

  if (query) {
    const [moviesRaw, seriesRaw] = await Promise.all([
      searchMovies(query, 12),
      searchSeries(query, 12),
    ]);
    movies = filterByAge(moviesRaw);
    series = filterByAge(seriesRaw);
  } else if (genreName) {
    const category = CATEGORIES.find((c) => c.name === genreName);
    if (category) {
      isGenreFilter = true;
      if (category.special === "anime") {
        const animesRaw = await getPopularAnimesPage(1);
        series = filterByAge(animesRaw);
      } else {
        const [m, s] = await Promise.all([
          category.movie ? getMoviesByGenre(category.movie, 1, 12) : Promise.resolve([]),
          category.tv ? getSeriesByGenre(category.tv, 1, 12) : Promise.resolve([])
        ]);
        movies = filterByAge(m);
        series = filterByAge(s);
      }
    }
  }

  return (
    <div className="pt-24 px-4 md:px-12 pb-12 min-h-screen bg-[#0a0a0a]">
      <h1 className="text-3xl font-bold mb-6">Buscar</h1>

      <SearchInput />

      {!query && !genreName && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-semibold mb-6 text-gray-300">Navegar por Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                href={`/search?genre=${encodeURIComponent(category.name)}`}
                className={`relative overflow-hidden h-32 rounded-xl bg-gradient-to-br ${category.color} p-4 transition-all hover:scale-105 hover:shadow-lg group`}
              >
                <span className="font-bold text-lg text-white drop-shadow-md relative z-10">
                  {category.name}
                </span>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {isGenreFilter && (
        <div className="flex items-center gap-4 mb-8">
           <h2 className="text-2xl font-bold text-white">Categoria: <span className="text-cyan-400">{genreName}</span></h2>
           <Link href="/search" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors" title="Limpar filtro">
             <X className="w-5 h-5 text-white" />
           </Link>
        </div>
      )}

      {query && movies.length === 0 && series.length === 0 && (
        <p className="text-gray-400 mt-8 text-center text-lg">
          Nenhum resultado encontrado para &quot;{query}&quot;.
        </p>
      )}

      {movies.length > 0 && (
        <section className="mb-10 animate-in fade-in duration-500">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Filmes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((item) => (
              <TmdbContentCard key={item.id} content={item} />
            ))}
          </div>
        </section>
      )}

      {series.length > 0 && (
        <section className="animate-in fade-in duration-500 delay-100">
          <h2 className="text-2xl font-semibold mb-4 text-violet-400">Séries</h2>
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
