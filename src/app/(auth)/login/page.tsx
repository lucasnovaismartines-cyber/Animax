"use client";

import { login } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-white placeholder-gray-600"
                placeholder="******"
              />
            </div>

            <div>
              <label htmlFor="captcha" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmação (captcha)
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Digite <span className="font-semibold">ANIMAX</span> para confirmar seu acesso.
              </p>
              <input
                id="captcha"
                name="captcha"
                type="text"
                required
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-white placeholder-gray-600 uppercase"
                placeholder="ANIMAX"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/50"
            >
              {loading ? "Entrando..." : "Entrar"}
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
