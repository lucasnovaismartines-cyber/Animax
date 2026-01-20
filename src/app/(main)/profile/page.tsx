import { getCurrentUserServer } from "@/app/actions/auth";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUserServer();

  if (!user) {
    return (
      <div className="pt-24 px-4 md:px-12 pb-12 min-h-screen bg-[#0a0a0a] text-white">
        <h1 className="text-3xl font-bold mb-4">Perfil</h1>
        <p className="text-gray-400">Você precisa estar logado para ver o perfil.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-12 pb-12 min-h-screen bg-[#0a0a0a] text-white">
      <h1 className="text-3xl font-bold mb-8">Perfil</h1>

      <div className="max-w-xl space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
            <p className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/40">
              {user.plan === "premium" ? "Plano Pro (sem anúncios)" : "Plano Free (com anúncios)"}
            </p>
          </div>
        </div>

        <ProfileForm user={user} />
      </div>
    </div>
  );
}
