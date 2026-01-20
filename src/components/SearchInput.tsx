"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function SearchInput() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    replace(`/search?${params.toString()}`);
  }, 300);

  return (
    <div className="relative mb-8 max-w-xl w-full group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />
      </div>
      <input
        type="text"
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar por filmes, séries e animes..."
        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/80 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-lg backdrop-blur-sm"
        autoFocus
      />
    </div>
  );
}
