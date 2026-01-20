"use client";

import { useState } from "react";
import { Play, Plus, ThumbsUp } from "lucide-react";

interface WatchActionsProps {
  contentId: string;
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

export function WatchActions({ contentId }: WatchActionsProps) {
  const [inList, setInList] = useState(() => {
    const listIds = readIds("animax-my-list");
    return listIds.includes(contentId);
  });
  const [liked, setLiked] = useState(() => {
    const likeIds = readIds("animax-liked");
    return likeIds.includes(contentId);
  });

  const handleToggleList = () => {
    const current = readIds("animax-my-list");
    const exists = current.includes(contentId);
    const next = exists ? current.filter((id) => id !== contentId) : [...current, contentId];
    writeIds("animax-my-list", next);
    setInList(!exists);
  };

  const handleToggleLike = () => {
    const current = readIds("animax-liked");
    const exists = current.includes(contentId);
    const next = exists ? current.filter((id) => id !== contentId) : [...current, contentId];
    writeIds("animax-liked", next);
    setLiked(!exists);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 pt-4">
      <a href="#player">
        <button className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-md font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20">
          <Play className="w-5 h-5 fill-white" />
          Assistir Agora
        </button>
      </a>
      <button
        className={`flex items-center gap-2 px-6 py-3 rounded-md font-semibold border border-gray-700 transition-colors ${
          inList ? "bg-white text-black" : "bg-gray-800 text-white hover:bg-gray-700"
        }`}
        onClick={handleToggleList}
      >
        <Plus className="w-5 h-5" />
        {inList ? "Na Minha Lista" : "Minha Lista"}
      </button>
      <button
        className={`flex items-center gap-2 px-6 py-3 rounded-md font-semibold border border-gray-700 transition-colors ${
          liked ? "bg-green-500 text-white" : "bg-gray-800 text-white hover:bg-gray-700"
        }`}
        onClick={handleToggleLike}
      >
        <ThumbsUp className="w-5 h-5" />
        {liked ? "Curtido" : "Curtir"}
      </button>
    </div>
  );
}
