"use client";

import { register, verifyEmail, resendVerificationCode } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    if (!formData.get("plan")) {
      formData.set("plan", "basic");
    }

    const result = await register(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result?.success && result.requireVerification) {
      setEmail(result.email as string);
      setStep('verification');
      setLoading(false);
    } else if (result?.success) {
      // Caso não precise de verificação (não deve acontecer com a lógica atual)
      router.push('/assinaturas');
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const result = await verifyEmail(email, verificationCode);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/assinaturas');
    }
  }

  async function handleResend() {
    setError(null);
    const result = await resendVerificationCode(email);
    if (result?.error) {
      setError(result.error);
    } else {
      alert("Código reenviado para seu email!");
    }
  }

  if (step === 'verification') {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1541562232579-512a21360020?w=1600&auto=format&fit=crop&q=80"
            alt="Anime background"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-md px-4">
          <div className="bg-gray-900/90 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.3)] border border-violet-500/30">
            <div className="text-center mb-8">
              <h1 className="text-violet-400 font-black text-3xl tracking-tighter mb-2 italic">
                VERIFICAR EMAIL
              </h1>
              <p className="text-gray-400">Enviamos um código para {email}</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">
                  Código de Verificação
                </label>
                <input
                  id="code"
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-white placeholder-gray-600 text-center tracking-widest text-2xl"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verificando..." : "Confirmar"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-sm text-violet-400 hover:text-violet-300 underline"
                >
                  Reenviar código
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Background Anime Style */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1541562232579-512a21360020?w=1600&auto=format&fit=crop&q=80"
          alt="Anime background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-gray-900/90 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.3)] border border-violet-500/30">
          <div className="text-center mb-8">
            <h1 className="text-violet-400 font-black text-4xl tracking-tighter mb-2 italic">
              ANIMAX
            </h1>
            <p className="text-gray-400">Crie sua conta e comece sua jornada</p>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Nome de Usuário
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-white placeholder-gray-600"
                placeholder="Nome de usuario"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-white placeholder-gray-600"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-white placeholder-gray-600"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold py-4 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-violet-900/50 mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Criando conta...
                </span>
              ) : (
                "CRIAR CONTA GRATUITA"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 hover:underline">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
