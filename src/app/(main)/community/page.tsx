import { communityPosts } from "@/lib/community";
import Link from "next/link";

export default function CommunityPage() {
  const posts = communityPosts;

  return (
    <div className="pt-24 px-4 md:px-12 pb-12 min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Comunidade Animax
          </h1>
          <p className="text-gray-400">
            Novidades e atualizações do mundo dos filmes, séries e animes.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-gray-900/70 border border-gray-800 rounded-xl p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="uppercase tracking-wide">
                    {post.category.toUpperCase()}
                  </span>
                  <span>{new Date(post.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p className="text-gray-300 text-sm">{post.summary}</p>
              </div>
              <div className="mt-4">
                <p className="text-gray-400 text-sm line-clamp-3">
                  {post.content}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-sm text-gray-500">
          <p>
            Em breve você poderá comentar e interagir com outros fãs diretamente
            nesta área da comunidade.
          </p>
        </div>
      </div>
    </div>
  );
}

