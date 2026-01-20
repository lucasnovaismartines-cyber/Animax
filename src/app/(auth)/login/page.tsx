"use client";

import { login } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Better to use the imported server action
    const { verifyEmail } = await import("@/app/actions/auth");
    const verifyResult = await verifyEmail(emailToVerify, verificationCode);

    if (verifyResult.error) {
        setError(verifyResult.error);
        setLoading(false);
    } else if (verifyResult.success) {
        // Redirect handled by action or we do it here if action doesn't redirect
        window.location.href = "/";
    }
  }

  async function handleResend() {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    const { resendVerificationCode } = await import("@/app/actions/auth");
    const result = await resendVerificationCode(emailToVerify);

    if (result.error) {
        setError(result.error);
    } else {
        setSuccessMessage("Novo código enviado! Verifique seu email.");
    }
    setLoading(false);
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const result = await login(formData);
    
    if (result?.error) {
      if (result.requireVerification && result.email) {
         setVerificationRequired(true);
         setEmailToVerify(result.email);
         setError(null); // Clear error to show verification screen clean
         
         // Auto resend code when entering this state? Maybe not to avoid spam, user can click resend
      } else {
         setError(result.error);
      }
      setLoading(false);
    }
  }

  if (verificationRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
        {/* Background Anime Style */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80"
            alt="Anime background"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-md px-4">
            <div className="bg-gray-900/90 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.2)] border border-violet-500/30 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Verifique seu Email</h2>
                    <p className="text-gray-400 text-sm">
                        Sua conta ainda não foi ativada. Digite o código enviado para <span className="text-violet-400">{emailToVerify}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                            Código de Verificação
                        </label>
                        <input
                            id="code"
                            type="text"
                            required
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-white placeholder-gray-600 text-center tracking-widest text-2xl font-mono"
                            placeholder="000000"
                            maxLength={6}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded text-sm text-center">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-2 rounded text-sm text-center">
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-3 px-4 rounded-lg hover:from-violet-500 hover:to-fuchsia-500 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/50"
                    >
                        {loading ? "Verificando..." : "Confirmar Código"}
                    </button>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="w-full text-sm text-gray-400 hover:text-white transition-colors underline"
                    >
                        Não recebeu? Reenviar código
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => setVerificationRequired(false)}
                        className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors mt-4"
                    >
                        Voltar para o Login
                    </button>
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
          src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80"
          alt="Anime background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-gray-900/90 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.2)] border border-cyan-500/30">
          <div className="text-center mb-8">
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 font-black text-5xl tracking-tighter mb-2 italic">
              ANIMAX
            </h1>
            <p className="text-gray-400">Bem-vindo de volta, viajante</p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-white placeholder-gray-600"
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
              <div className="flex justify-end mt-2">
                 <Link 
                   href="/forgot-password" 
                   className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                 >
                   Esqueci minha senha
                 </Link>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded text-sm text-center">
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
                  Entrando...
                </span>
              ) : (
                "ENTRAR"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-4">Ainda não faz parte do clã?</p>
            <Link 
              href="/register" 
              className="block w-full border border-gray-600 hover:border-violet-500 hover:text-violet-400 text-gray-300 font-medium py-3 rounded-lg transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
