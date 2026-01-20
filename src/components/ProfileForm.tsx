"use client";

import { updateProfile } from "@/app/actions/auth";
import type { User } from "@/lib/db";
import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatarUrl ?? null);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para processar a imagem (resize + compression)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Converte para JPEG com qualidade 0.8
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setPreviewUrl(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Se tiver previewUrl (base64) e for diferente do original, adiciona ao formData
    if (previewUrl && previewUrl !== user.avatarUrl) {
      formData.set("avatarUrl", previewUrl);
    } else if (!previewUrl) {
      formData.set("avatarUrl", ""); // Remove avatar
    }

    if (verificationRequired) {
      formData.set("verificationCode", verificationCode);
    }

    try {
      const result = await updateProfile(formData);

      if (result?.error === "verification_required") {
        setVerificationRequired(true);
        setError(result.message || "Verificação necessária. Verifique seu email.");
      } else if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.success);
        setVerificationRequired(false);
        setVerificationCode("");
        router.refresh();
      }
    } catch (err) {
      setError("Ocorreu um erro ao atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-gray-900/60 border border-gray-800 rounded-xl p-6">
      
      {/* Seção de Foto de Perfil */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Foto de Perfil
        </label>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800 shadow-lg">
              {previewUrl ? (
                <Image 
                  src={previewUrl} 
                  alt="Preview" 
                  width={96} 
                  height={96} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <Camera className="w-8 h-8" />
                </div>
              )}
            </div>
            <div 
              onClick={triggerFileInput}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Upload className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={triggerFileInput}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700"
            >
              Escolher imagem
            </button>
            {previewUrl && (
              <button
                type="button"
                onClick={removeImage}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/20 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Remover foto
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 max-w-[200px]">
              JPG, PNG ou GIF. Max 5MB. Será redimensionada automaticamente.
            </p>
          </div>
        </div>
        <input type="hidden" name="avatarUrl" value={previewUrl || ""} />
      </div>

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
          key={user.maxAgeRating}
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
          Por padrão novas contas começam em 16 anos. Alterações requerem verificação por email.
        </p>
      </div>

      {verificationRequired && (
        <div className="bg-violet-500/10 border border-violet-500/30 p-4 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-medium text-violet-200">
                Código de Verificação
            </label>
            <p className="text-xs text-violet-300/70">
              Enviamos um código para seu email para confirmar a alteração da faixa etária.
            </p>
            <input 
                type="text" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-black/60 border border-violet-500/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-center tracking-widest text-xl font-mono"
                placeholder="000000"
                maxLength={6}
            />
        </div>
      )}

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
        {loading ? "Salvando..." : (verificationRequired ? "Confirmar Código" : "Salvar Alterações")}
      </button>
    </form>
  );
}
