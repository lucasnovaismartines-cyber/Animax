export type CommunityCategory = "filmes" | "series" | "animes" | "geral";

export interface CommunityPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: CommunityCategory;
  createdAt: string;
}

export const communityPosts: CommunityPost[] = [
  {
    id: "p-1",
    title: "Novos lançamentos de filmes para este mês",
    summary: "Confira os principais filmes em destaque chegando aos cinemas e streaming.",
    content:
      "Este mês traz uma leva de grandes estreias no mundo dos filmes, incluindo continuações aguardadas e produções originais. Fique de olho nas novidades e acompanhe as avaliações da comunidade.",
    category: "filmes",
    createdAt: "2025-01-01",
  },
  {
    id: "p-2",
    title: "Atualizações nas suas séries favoritas",
    summary: "Renovações, novas temporadas e rumores sobre séries populares.",
    content:
      "Algumas das séries mais queridas do público receberam notícias importantes: renovações confirmadas, temporadas finais anunciadas e spin-offs em desenvolvimento.",
    category: "series",
    createdAt: "2025-01-05",
  },
  {
    id: "p-3",
    title: "Agenda de estreias de animes",
    summary: "Veja quais animes chegam nas próximas semanas.",
    content:
      "A temporada de animes está cheia de continuações esperadas e novas produções originais. Organize sua lista para não perder nenhum episódio.",
    category: "animes",
    createdAt: "2025-01-10",
  },
];

