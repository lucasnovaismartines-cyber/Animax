
"use client";

/**
 * Developed by BLACK GOLD STUDIOS and Lucas Novais Martines
 */

import { Content } from "@/types";
import { getPlayerUrl } from "@/lib/playerflix";
import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import Image from "next/image";

interface VideoPlayerProps {
  content: Content;
  coverImage?: string;
  maxSeasons?: number;
  episodesBySeason?: Record<number, number>;
}

export function VideoPlayer({
  content,
  coverImage,
  maxSeasons,
  episodesBySeason,
}: VideoPlayerProps) {
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const maxEpisodesForSeason = episodesBySeason?.[season];

  // Determine the URL to play
  // Priority: 
  // 1. content.embedUrl (for manual content or explicit overrides)
  // 2. PlayerFlix generated URL (for TMDB content)
  // 3. content.videoUrl (fallback, e.g. Youtube trailer)
  
  let playerUrl = content.embedUrl;
  
  if (!playerUrl) {
    const generatedUrl = getPlayerUrl(
      content.id, 
      content.type === "movie" ? "movie" : "series", // 'anime' falls into series/tv logic for playerflix usually
      season, 
      episode
    );
    if (generatedUrl) {
      playerUrl = generatedUrl;
    }
  }

  // If still no URL, fallback to videoUrl (e.g. YouTube)
  if (!playerUrl && content.videoUrl) {
    playerUrl = content.videoUrl;
  }

  const handlePlay = () => {
    setIsPlaying(true);
    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("animax-watched");
        let ids: string[] = [];
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            ids = parsed.filter((item) => typeof item === "string");
          }
        }
        if (!ids.includes(content.id)) {
          ids.push(content.id);
          window.localStorage.setItem("animax-watched", JSON.stringify(ids));
        }
      }
    } catch {
    }
  };

  const isSeries = content.type === "series" || content.type === "anime";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-gray-800 relative shadow-2xl shadow-black/50">
        {!isPlaying ? (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer group" onClick={handlePlay}>
            {coverImage && (
              <Image
                src={coverImage}
                alt="Capa"
                fill
                className="object-cover opacity-60 group-hover:opacity-40 transition-opacity"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            
            <div className="z-10 flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
              <p className="text-white font-semibold text-lg drop-shadow-md">
                Assistir {isSeries ? `- T${season}:E${episode}` : ""}
              </p>
            </div>
          </div>
        ) : (
          <iframe
            src={playerUrl}
            title={content.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>

      {isSeries && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="font-medium text-white">Controles do Episódio:</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Temporada</span>
              <div className="relative">
                <select
                  value={season}
                  onChange={(e) => {
                    setSeason(Number(e.target.value));
                    setEpisode(1);
                  }}
                  className="appearance-none bg-black/40 border border-gray-700 text-white py-2 pl-4 pr-10 rounded-md focus:outline-none focus:border-red-600 transition-colors cursor-pointer min-w-[140px]"
                >
                  {Array.from({ length: maxSeasons || 1 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s} className="bg-gray-900 text-white">
                      Temporada {s}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Episódio</span>
              <div className="relative">
                <select
                  value={episode}
                  onChange={(e) => setEpisode(Number(e.target.value))}
                  className="appearance-none bg-black/40 border border-gray-700 text-white py-2 pl-4 pr-10 rounded-md focus:outline-none focus:border-red-600 transition-colors cursor-pointer min-w-[140px]"
                >
                  {Array.from({ length: maxEpisodesForSeason || 1 }, (_, i) => i + 1).map((e) => (
                    <option key={e} value={e} className="bg-gray-900 text-white">
                      Episódio {e}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
