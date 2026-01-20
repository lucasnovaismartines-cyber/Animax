"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const stripePromise =
  typeof window === "undefined" || !publishableKey
    ? null
    : loadStripe(publishableKey);

function InnerForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/assinaturas",
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message ?? "Erro ao processar pagamento.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      const res = await fetch("/api/stripe/activate-pro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      });

      if (!res.ok) {
        setError("Pagamento aprovado, mas houve erro ao ativar o plano.");
        setSubmitting(false);
        return;
      }

      router.replace("/assinaturas");
    } else {
      setError("Pagamento não foi concluído.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-black/40 border border-cyan-900/40 rounded-lg p-3">
        <PaymentElement />
      </div>
      {error && (
        <p className="text-sm text-red-400 text-left">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-900/20"
      >
        {submitting ? "Processando..." : "Pagar R$ 10 para virar Pro"}
      </button>
      <p className="text-[10px] text-gray-500 mt-1">
        Pagamento processado com segurança pelo Stripe. Este ambiente é apenas
        para testes.
      </p>
    </form>
  );
}

export function ProInlineCheckout() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClientSecret() {
      try {
        const res = await fetch("/api/stripe/create-intent", {
          method: "POST",
        });
        if (!res.ok) {
          throw new Error("Falha ao iniciar pagamento.");
        }
        const data = (await res.json()) as { clientSecret?: string };
        if (!data.clientSecret) {
          throw new Error("Resposta inválida do servidor.");
        }
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
        setError("Não foi possível iniciar o pagamento agora.");
      }
    }

    loadClientSecret();
  }, []);

  if (!publishableKey) {
    return (
      <p className="text-xs text-red-400">
        Configure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no .env.local para
        habilitar o pagamento.
      </p>
    );
  }

  if (!stripePromise) {
    return null;
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!clientSecret) {
    return <p className="text-sm text-gray-400">Carregando pagamento seguro...</p>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#22d3ee",
          },
        },
      }}
    >
      <InnerForm />
    </Elements>
  );
}

