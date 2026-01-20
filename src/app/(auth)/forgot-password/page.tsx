"use client";

import { requestPasswordReset, resetPassword } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await requestPasswordReset(email);

    if (result?.success) {
      setSuccess(result.message);
      setStep('reset');
    } else {
        // Safe to ignore error details for security, but we show success anyway or generic error
        // Current implementation of requestPasswordReset always returns success or throws
        // If it returns success:
        setSuccess("Se o email existir, um código foi enviado.");
        setStep('reset');
    }
    setLoading(false);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await resetPassword(email, code, newPassword);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess("Senha alterada com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
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
        <div className="bg-gray-900/90 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.3)] border border-violet-500/30 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <h1 className="text-violet-400 font-black text-4xl tracking-tighter mb-2 italic">
              ANIMAX
            </h1>
            <p className="text-gray-400">Recuperação de Senha</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-200 text-sm text-center animate-in slide-in-from-top-2">
              {success}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email da conta
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-white placeholder-gray-600"
                  placeholder="seu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold py-4 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-violet-900/50 mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "ENVIAR CÓDIGO"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
               <div className="text-center mb-4">
                  <p className="text-sm text-gray-400">
                    Enviamos um código para <span className="text-violet-400">{email}</span>
                  </p>
               </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">
                  Código de Verificação
                </label>
                <input
                  id="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-white placeholder-gray-600 text-center tracking-widest text-xl font-mono"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Nova Senha
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-white placeholder-gray-600"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold py-4 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-violet-900/50 mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Alterando...
                  </span>
                ) : (
                  "ALTERAR SENHA"
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Lembrou sua senha?{" "}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Fazer Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}