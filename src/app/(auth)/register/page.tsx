"use client";

import { register } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
                placeholder="******"
              />
            </div>

            <div>
              <label htmlFor="captcha" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmação (captcha)
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Para confirmar que você é humano, digite <span className="font-semibold">ANIMAX</span> abaixo.
              </p>
              <input
                id="captcha"
                name="captcha"
                type="text"
                required
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-white placeholder-gray-600 uppercase"
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
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-lg shadow-violet-900/50"
            >
              {loading ? "Criando conta..." : "Começar Aventura"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
              Entrar agora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
