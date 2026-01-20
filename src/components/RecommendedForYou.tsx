"use client";

import { Content } from "@/types";
import { ContentCard } from "./ContentCard";

interface RecommendedForYouProps {
  items: Content[];
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

function buildRecommended(items: Content[]): Content[] | null {
  if (typeof window === "undefined") return null;

  const likedIds = readIds("animax-liked");
  const listIds = readIds("animax-my-list");
  const watchedIds = readIds("animax-watched");

  const preferenceIds = new Set<string>([
    ...likedIds,
    ...listIds,
    ...watchedIds,
  ]);

  if (!preferenceIds.size) {
    return null;
  }

  const preferredItems = items.filter((item) => preferenceIds.has(item.id));
  if (!preferredItems.length) {
    return null;
  }

  const genreCount = new Map<string, number>();
  const typeCount = new Map<string, number>();

  for (const item of preferredItems) {
    typeCount.set(item.type, (typeCount.get(item.type) ?? 0) + 1);
    for (const g of item.genre) {
      genreCount.set(g, (genreCount.get(g) ?? 0) + 1);
    }
  }

  const favoriteGenres = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g);

  let primaryType: string | null = null;
  let primaryTypeCount = 0;
  for (const [t, count] of typeCount.entries()) {
    if (count > primaryTypeCount) {
      primaryType = t;
      primaryTypeCount = count;
    }
  }

  const scored: { item: Content; score: number }[] = [];

  for (const item of items) {
    if (preferenceIds.has(item.id)) {
      scored.push({ item, score: 3 });
      continue;
    }

    let score = 0;

    if (primaryType && item.type === primaryType) {
      score += 1;
    }

    if (favoriteGenres.length) {
      const shared = item.genre.some((g) => favoriteGenres.includes(g));
      if (shared) {
        score += 1;
      }
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const result: Content[] = [];

  for (const entry of scored) {
    if (!seen.has(entry.item.id)) {
      seen.add(entry.item.id);
      result.push(entry.item);
    }
    if (result.length >= 20) {
      break;
    }
  }

  if (!result.length) {
    return null;
  }

  return result;
}

export function RecommendedForYou({ items }: RecommendedForYouProps) {
  const recommended = buildRecommended(items);

  if (!recommended || !recommended.length) {
    return null;
  }

  return (
    <section className="py-8 space-y-4">
      <div className="px-4 md:px-12 flex items-center justify-between w-full">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-100">
          Recomendados para você
        </h2>
      </div>

      <div className="px-4 md:px-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {recommended.map((item) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
