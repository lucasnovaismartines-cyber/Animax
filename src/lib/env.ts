import 'server-only';
import { z } from "zod";

const envSchema = z.object({
  // Server-side variables (não prefixadas com NEXT_PUBLIC_)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  TMDB_API_KEY: z.string().min(1, "TMDB_API_KEY is required"),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_PRICE_PREMIUM_ID: z.string().min(1, "STRIPE_PRICE_PREMIUM_ID is required"),
  
  // Public variables (acessíveis no cliente)
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required"),
});

// Validação ocorre apenas no servidor ou build time
const _env = envSchema.safeParse(process.env);

// FALLBACK PARA BUILD: Se a validação falhar, usa valores vazios para não quebrar o deploy
// Isso permite que o site suba, mas vai dar erro 500 se as chaves não forem configuradas no painel da Vercel
let envData = _env.data;

if (!_env.success) {
  console.warn("⚠️  Aviso: Variáveis de ambiente faltando. O build vai continuar, mas o app pode falhar em execução.");
  console.warn("❌  Detalhes:", _env.error.format());
  
  // Cria um objeto com valores "falsos" apenas para passar no type check do build
  envData = {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    TMDB_API_KEY: process.env.TMDB_API_KEY || "missing_tmdb_key",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "missing_stripe_secret",
    STRIPE_PRICE_PREMIUM_ID: process.env.STRIPE_PRICE_PREMIUM_ID || "missing_price_id",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://animax.click",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "missing_stripe_public",
  };
}

export const env = envData!;
