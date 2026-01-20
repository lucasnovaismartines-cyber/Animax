"use server";

import { getRecentAnimeEpisodes, getNewArrivals } from "@/lib/tmdb";
import { Content, Episode } from "@/types";

export interface NotificationsData {
  recentEpisodes: Episode[];
  newArrivals: Content[];
}

export async function getNotifications(): Promise<NotificationsData> {
  try {
    const [recentEpisodes, newArrivals] = await Promise.all([
      getRecentAnimeEpisodes(5),
      getNewArrivals(5),
    ]);

    return {
      recentEpisodes,
      newArrivals,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      recentEpisodes: [],
      newArrivals: [],
    };
  }
}
