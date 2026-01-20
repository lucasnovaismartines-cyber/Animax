"use client";

import { useState } from "react";
import { Content } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ContentCard } from "./ContentCard";

interface ContentSectionProps {
  title: string;
  items: Content[];
}

export function ContentSection({ title, items }: ContentSectionProps) {
  const [page, setPage] = useState(0);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = page * pageSize;
  const end = start + pageSize;

  const getCategoryLink = (title: string) => {
    if (title.toLowerCase().includes("filme")) return "/movies";
    if (title.toLowerCase().includes("série")) return "/series";
    if (title.toLowerCase().includes("anime")) return "/animes";
    return "/";
  };

  const visibleItems = items.slice(start, end);
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <section className="py-8 space-y-4">
      <Link href={getCategoryLink(title)}>
        <div className="px-4 md:px-12 flex items-center justify-between group cursor-pointer inline-flex w-full">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-100 group-hover:text-white transition-colors">
            {title}
          </h2>
          <div className="flex items-center text-sm text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ver tudo <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Link>

      <div className="px-4 md:px-12 pb-8">
        <div className="flex items-center justify-end gap-2 mb-4 text-gray-400">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!canPrev}
            className={`p-2 rounded-full border border-gray-700 hover:border-white hover:text-white transition-colors ${
              !canPrev ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={!canNext}
            className={`p-2 rounded-full border border-gray-700 hover:border-white hover:text-white transition-colors ${
              !canNext ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {visibleItems.map((item) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
