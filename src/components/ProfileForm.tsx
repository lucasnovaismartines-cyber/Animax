"use client";

import { updateProfile } from "@/app/actions/auth";
import type { User } from "@/lib/db";
import { useState } from "react";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProfile(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.success);
      }
    } catch (err) {
      setError("Ocorreu um erro ao atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-gray-900/60 border border-gray-800 rounded-xl p-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Nome de exibição
        </label>
        <input
          name="name"
          defaultValue={user.name}
          className="w-full px-4 py-2 rounded-lg bg-black/60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Foto de perfil (URL)
        </label>
        <input
          name="avatarUrl"
          defaultValue={user.avatarUrl ?? ""}
          placeholder="https://exemplo.com/minha-foto.jpg"
          className="w-full px-4 py-2 rounded-lg bg-black/60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Use um link HTTPS de uma imagem que você controla.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Assinatura
        </label>
        <div className="text-sm text-gray-300">
          <p>
            Plano atual:{" "}
            <span className="font-semibold">
              {user.plan === "premium" ? "Pro" : "Free"}
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Gerencie pagamentos e upgrade em{" "}
            <a
              href="/assinaturas"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              /assinaturas
            </a>
            .
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Classificação máxima da conta
        </label>
        <select
          name="maxAgeRating"
          defaultValue={String(user.maxAgeRating ?? 16)}
          className="w-full px-4 py-2 rounded-lg bg-black/60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="10">10 anos</option>
          <option value="12">12 anos</option>
          <option value="14">14 anos</option>
          <option value="16">16 anos</option>
          <option value="18">18 anos</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Por padrão novas contas começam em 16 anos. Ajuste conforme a idade de quem usa.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded text-sm text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded text-sm text-center">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-lg shadow-violet-900/50"
      >
        {loading ? "Salvando..." : "Salvar Alterações"}
      </button>
    </form>
  );
}
