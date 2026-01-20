/**
 * Developed by BLACK GOLD STUDIOS and Lucas Novais Martines
 */
import { getContentById } from "@/lib/data";
import { getTmdbImages, getTvSeasonsInfo } from "@/lib/tmdb";
import { ArrowLeft, Calendar, Clock, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { WatchActions } from "@/components/WatchActions";
import { getCurrentUserServer } from "@/app/actions/auth";

interface WatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const content = await getContentById(id);

  if (!content) {
    notFound();
  }

  const user = await getCurrentUserServer();
  const maxAge = user?.maxAgeRating ?? 16;
  const contentAge = Number(content.ageRating);
  const blocked =
    Number.isFinite(contentAge) && contentAge > maxAge;

  const mediaType = content.type === "movie" ? "movie" : "tv";
  const images = await getTmdbImages(content.title, content.year, mediaType);
  const coverImage = images?.backdropUrl ?? content.coverUrl ?? content.thumbnailUrl;

  let maxSeasons: number | undefined;
  let episodesBySeason: Record<number, number> | undefined;

  if (content.type === "series" || content.type === "anime") {
    if (content.id.startsWith("tmdb-tv-")) {
      const tmdbIdString = content.id.replace("tmdb-tv-", "");
      const tmdbId = Number(tmdbIdString);

      if (!Number.isNaN(tmdbId) && tmdbId > 0) {
        const seasonsInfo = await getTvSeasonsInfo(tmdbId);

        if (seasonsInfo) {
          maxSeasons = seasonsInfo.numberOfSeasons;
          episodesBySeason = seasonsInfo.episodesBySeason;
        }
      }
    }
  }

  if (blocked) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pb-12 pt-24 px-4 md:px-12 text-white">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para a tela inicial
        </Link>
        <h1 className="text-3xl font-bold mb-4">Conteúdo bloqueado</h1>
        <p className="text-gray-300 max-w-xl">
          Este título é classificado para uma faixa etária acima da configuração da sua conta.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-12">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] w-full">
        <div className="absolute inset-0">
          <Image
            src={coverImage}
            alt={content.title}
            fill
            className="object-cover brightness-[0.4]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        <div className="absolute top-24 left-4 md:left-12 z-20">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full px-4 md:px-12 pb-12">
          <div className="max-w-4xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              {content.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-gray-300">
              <div className="flex items-center gap-2 text-green-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold">{content.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{content.year}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-semibold border border-gray-600 px-2 py-1 rounded bg-black/60">
                  {content.ageRating}
                </span>
              </div>
              <div className="flex items-center gap-2 border border-gray-600 px-3 py-1 rounded text-xs uppercase bg-black/40">
                {content.type}
              </div>
              {content.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{content.duration}</span>
                </div>
              )}
              {content.seasons && <span>{content.seasons} Temporadas</span>}
            </div>

            <p className="text-lg text-gray-200 leading-relaxed max-w-2xl">
              {content.description}
            </p>

            <WatchActions contentId={content.id} />
            
            <div className="flex gap-2 pt-4">
              {content.genre.map((g) => (
                <span key={g} className="text-sm text-gray-400 border border-gray-800 px-3 py-1 rounded-full bg-gray-900/50">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Player / Trailer Section */}
      <div id="player" className="px-4 md:px-12 mt-12">
        <h2 className="text-2xl font-bold mb-6">Assistir</h2>
        <VideoPlayer
          content={content}
          coverImage={coverImage}
          maxSeasons={maxSeasons}
          episodesBySeason={episodesBySeason}
        />
      </div>
    </div>
  );
}
