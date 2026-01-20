"use client";

import { Content } from "@/types";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  items: Content[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [items.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [items.length, isTransitioning]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  if (!items.length) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="relative h-[85vh] w-full overflow-hidden group">
      {/* Background Images */}
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={item.coverUrl || item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover brightness-[0.6]"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content Info */}
      <div className="relative z-20 h-full flex items-center px-4 md:px-12 pt-20">
        <div className="max-w-2xl space-y-6">
          <div className="transition-all duration-500 transform translate-y-0 opacity-100">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg">
              {currentItem.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm md:text-base text-gray-300 mt-4">
              <span className="text-green-400 font-semibold">{currentItem.rating} Match</span>
              <span>{currentItem.year}</span>
              <span className="border border-gray-600 px-2 py-0.5 rounded text-xs uppercase">
                {currentItem.type === 'movie' ? 'Filme' : currentItem.type === 'series' ? 'Série' : 'Anime'}
              </span>
              {currentItem.duration && <span>{currentItem.duration}m</span>}
              {currentItem.seasons && <span>{currentItem.seasons} Temporadas</span>}
            </div>

            <p className="text-gray-300 text-lg line-clamp-3 md:line-clamp-none mt-4 drop-shadow-md">
              {currentItem.description}
            </p>

            <div className="flex items-center gap-4 pt-6">
              <Link href={`/watch/${currentItem.id}`}>
                <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded font-semibold hover:bg-white/90 transition-colors">
                  <Play className="w-5 h-5 fill-black" />
                  Assistir
                </button>
              </Link>
              <Link href={`/watch/${currentItem.id}`}>
                <button className="flex items-center gap-2 bg-gray-500/30 text-white px-6 py-3 rounded font-semibold hover:bg-gray-500/40 transition-colors backdrop-blur-sm">
                  <Info className="w-5 h-5" />
                  Mais Informações
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Dots Indicators */}
      <div className="absolute bottom-8 right-12 z-30 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "bg-white w-6" 
                : "bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
}
