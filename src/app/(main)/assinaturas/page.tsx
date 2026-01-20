import { cookies } from "next/headers";
import { findUserByEmail, updateUserByEmail } from "@/lib/db";
import { redirect } from "next/navigation";

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR");
}

function calculateRemainingDays(endDateString: string | null | undefined) {
  if (!endDateString) return null;
  const end = new Date(endDateString);
  if (Number.isNaN(end.getTime())) return null;
  const diffMs = end.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays < 0 ? 0 : diffDays;
}

export default async function AssinaturasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const email = cookieStore.get("user_email")?.value;
  const sp = await searchParams;
  const showSuccess = sp?.success === "true";
  const errorCode = sp?.error as string | undefined;
  const canceled = sp?.canceled === "true";

  if (!email) {
    redirect("/login");
  }

  const user = await findUserByEmail(email);

  if (!user) {
    redirect("/login");
  }

  let effectiveUser = user;

  if (user.plan === "premium" && user.subscriptionEndsAt) {
    const end = new Date(user.subscriptionEndsAt);
    if (!Number.isNaN(end.getTime()) && end < new Date()) {
      const updated =
        (await updateUserByEmail(user.email, {
          plan: "basic",
          lastSubscriptionStatus: "expired",
        })) ?? user;
      effectiveUser = updated;
    }
  }

  const lastPaymentFormatted = formatDate(effectiveUser.lastPaymentAt);
  const subscriptionEndFormatted = formatDate(effectiveUser.subscriptionEndsAt);
  const remainingDays = calculateRemainingDays(effectiveUser.subscriptionEndsAt);

  let statusMessage: { type: "warning" | "error" | "info"; text: string } | null =
    null;

  if (showSuccess) {
    statusMessage = {
      type: "info",
      text: "Assinatura confirmada! Obrigado por assinar o plano Pro.",
    };
  } else if (errorCode === "payment_failed") {
    statusMessage = {
      type: "error",
      text: "Tentativa de pagamento negada. Verifique seu cartão ou Pix e tente novamente.",
    };
  } else if (canceled) {
    statusMessage = {
      type: "warning",
      text: "Pagamento não concluído. Sua assinatura permanece no plano atual.",
    };
  } else if (effectiveUser.lastSubscriptionStatus === "expired") {
    statusMessage = {
      type: "warning",
      text: "Pagamento do mês anterior não foi efetuado. Sua conta voltou para o plano Free.",
    };
  } else if (
    effectiveUser.plan === "premium" &&
    typeof remainingDays === "number" &&
    remainingDays <= 3
  ) {
    statusMessage = {
      type: "warning",
      text: `Sua assinatura vence em ${remainingDays} dia${
        remainingDays === 1 ? "" : "s"
      }. Pague antes do vencimento para não voltar para o plano Free.`,
    };
  }
  const currentUser = effectiveUser;

  return (
    <div className="pt-24 px-4 md:px-12 pb-12 min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Gerenciar assinatura</h1>
        <p className="text-gray-400 mb-6 text-lg">
          Veja seu plano atual e faça upgrade para o Pro.
        </p>

        {statusMessage && (
          <div
            className={`mb-8 p-4 rounded-xl border ${
              statusMessage.type === "error"
                ? "bg-red-900/40 border-red-500/60 text-red-100"
                : statusMessage.type === "warning"
                ? "bg-yellow-900/40 border-yellow-500/60 text-yellow-100"
                : "bg-green-900/40 border-green-500/60 text-green-100"
            }`}
          >
            <p className="font-semibold">{statusMessage.text}</p>
          </div>
        )}

        <div className="mb-10 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-left">
          <p className="text-sm text-gray-300">
            Plano atual:{" "}
            <span className="font-semibold">
              {currentUser.plan === "premium" ? "Pro" : "Free"}
            </span>
          </p>
          {currentUser.plan === "premium" && (
            <div className="mt-2 text-sm text-gray-300">
              {lastPaymentFormatted && (
                <p>
                  Último pagamento em{" "}
                  <span className="font-semibold">
                    {lastPaymentFormatted}
                  </span>
                  .
                </p>
              )}
              {subscriptionEndFormatted && (
                <p className="mt-1">
                  Sua assinatura atual vai até{" "}
                  <span className="font-semibold">
                    {subscriptionEndFormatted}
                  </span>
                  {typeof remainingDays === "number" && (
                    <>
                      {" "}
                      ({remainingDays} dia
                      {remainingDays === 1 ? "" : "s"} restante
                      {remainingDays === 1 ? "" : "s"}).
                    </>
                  )}
                </p>
              )}
              {!lastPaymentFormatted && !subscriptionEndFormatted && (
                <p className="mt-1 text-gray-400">
                  Sua assinatura Pro está ativa. Em produção, os detalhes
                  viriam diretamente do Stripe.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 flex flex-col hover:border-gray-700 transition duration-300 relative">
            {user.plan === "basic" && (
              <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                SEU PLANO
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2">Free</h2>
            <div className="text-3xl font-bold mb-6">
              R$ 0
              <span className="text-sm font-normal text-gray-400">/mês</span>
            </div>
            <ul className="text-left space-y-4 mb-8 flex-1 text-gray-300">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Acesso limitado ao catálogo
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Qualidade SD (480p)
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Com anúncios
              </li>
            </ul>
            <button className="w-full bg-gray-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50" disabled>
              {user.plan === "basic" ? "Plano atual" : "Plano Free"}
            </button>
          </div>

          <div className="bg-gray-900/60 border border-cyan-500/50 rounded-2xl p-8 flex flex-col relative overflow-hidden group hover:border-cyan-500 transition duration-300">
            {user.plan === "premium" ? (
              <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                PRO ATIVO
              </div>
            ) : (
              <div className="absolute top-0 right-0 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                PRO RECOMENDADO
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2 text-cyan-400">Pro</h2>
            <div className="text-3xl font-bold mb-6">
              R$ 10
              <span className="text-sm font-normal text-gray-400">/mês</span>
            </div>
            <ul className="text-left space-y-4 mb-8 flex-1 text-gray-300">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-cyan-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Com anúncios
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-cyan-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Qualidade 4K e prioridade no player
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-cyan-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Acesso completo ao catálogo
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-cyan-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Novos recursos primeiro
              </li>
            </ul>

            {user.plan === "premium" ? (
              <button className="w-full bg-gray-700 text-white font-bold py-3 rounded-xl transition cursor-default" disabled>
                Você já é Pro
              </button>
            ) : (
              <form action="/api/stripe/checkout" method="POST">
                <button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-900/20"
                >
                  Assinar Agora
                </button>
                <p className="text-[10px] text-gray-500 mt-2 text-center">
                  Pagamento seguro via Stripe
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
