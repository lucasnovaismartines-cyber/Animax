import { verifyAuth } from "@/lib/auth";
import { getMessages } from "@/app/actions/community";
import { CommunityChat } from "@/components/CommunityChat";

export default async function CommunityPage() {
  const session = await verifyAuth();
  const initialMessages = await getMessages();

  return (
    <div className="pt-24 px-4 md:px-8 pb-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 mb-2">
          COMUNIDADE
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Conecte-se com outros fãs, discuta teorias, recomende obras e fique por dentro das últimas notícias.
        </p>
      </div>

      <CommunityChat 
        initialMessages={initialMessages} 
        currentUserId={session?.userId} 
      />
    </div>
  );
}
