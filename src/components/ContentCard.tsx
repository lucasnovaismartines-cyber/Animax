"use client";

/**
 * Developed by BLACK GOLD STUDIOS and Lucas Novais Martines
 */

import { Content } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Play, Plus, ThumbsUp } from "lucide-react";
import { useState } from "react";

interface ContentCardProps {
  content: Content;
}

function readIds(key: string) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string");
    }
    return [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
  }
}

export function ContentCard({ content }: ContentCardProps) {
  const [inList, setInList] = useState(() => {
    const listIds = readIds("animax-my-list");
    return listIds.includes(content.id);
  });
  const [liked, setLiked] = useState(() => {
    const likeIds = readIds("animax-liked");
    return likeIds.includes(content.id);
  });

  const handleToggleList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const current = readIds("animax-my-list");
    const exists = current.includes(content.id);
    const next = exists ? current.filter((id) => id !== content.id) : [...current, content.id];
    writeIds("animax-my-list", next);
    setInList(!exists);
  };

  const handleToggleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const current = readIds("animax-liked");
    const exists = current.includes(content.id);
    const next = exists ? current.filter((id) => id !== content.id) : [...current, content.id];
    writeIds("animax-liked", next);
    setLiked(!exists);
  };

  return (
    <Link href={`/watch/${content.id}`}>
      <div className="group relative w-[200px] md:w-[240px] flex-none cursor-pointer transition-transform duration-300 hover:z-10 hover:scale-105">
        <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-900">
          {content.thumbnailUrl ? (
            <Image
              src={content.thumbnailUrl}
              alt={content.title}
              fill
              className="object-cover transition-all duration-300 group-hover:brightness-75"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4 text-center text-gray-500 text-sm group-hover:brightness-75 transition-all duration-300">
              <span className="line-clamp-3">{content.title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="flex gap-3 mb-3">
              <button className="bg-white rounded-full p-2 hover:bg-white/90 transition">
                <Play className="w-4 h-4 text-black fill-black" />
              </button>
              <button
                className={`border-2 rounded-full p-2 transition ${
                  inList
                    ? "border-white text-white bg-white/10"
                    : "border-gray-400 hover:border-white hover:text-white text-gray-300"
                }`}
                onClick={handleToggleList}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                className={`border-2 rounded-full p-2 transition ${
                  liked
                    ? "border-green-500 text-green-400 bg-green-500/10"
                    : "border-gray-400 hover:border-white hover:text-white text-gray-300"
                }`}
                onClick={handleToggleLike}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">{content.title}</h4>
              <div className="flex items-center gap-2 text-[10px] text-gray-300">
                <span className="text-green-400 font-semibold">{content.rating}</span>
                <span>{content.year}</span>
                <span className="border border-gray-500 px-1 rounded bg-black/70">
                  {content.ageRating}
                </span>
                <span className="border border-gray-500 px-1 rounded">{content.type}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {content.genre.slice(0, 2).map((g) => (
                  <span key={g} className="text-[10px] text-gray-400">
                    • {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
