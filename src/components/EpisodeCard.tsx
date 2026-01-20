"use client";

import { Episode } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

export function EpisodeCard({ episode }: { episode: Episode }) {
  const href = `/watch/${episode.seriesId}?s=${episode.seasonNumber}&e=${episode.episodeNumber}`;

  return (
    <Link
      href={href}
      className="group relative block w-full aspect-video rounded-lg overflow-hidden bg-gray-900 border border-gray-800 hover:border-cyan-500/50 transition-all"
    >
      {/* Image */}
      {episode.thumbnailUrl ? (
        <Image
          src={episode.thumbnailUrl}
          alt={episode.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
          Sem Imagem
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-cyan-400 bg-black/60 px-2 py-0.5 rounded backdrop-blur-md border border-cyan-500/20">
            S{episode.seasonNumber} E{episode.episodeNumber}
          </span>
          <span className="text-[10px] text-gray-400">
             {new Date(episode.airDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
        <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
          {episode.seriesTitle}
        </h4>
        <p className="text-xs text-gray-300 line-clamp-1">{episode.title}</p>
      </div>

      {/* Play Icon Centered */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
        <div className="bg-cyan-600/90 p-3 rounded-full backdrop-blur-sm transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-cyan-600/20">
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
      </div>
    </Link>
  );
}
