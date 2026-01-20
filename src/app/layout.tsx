import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Animax - O melhor do Anime e Streaming",
  description: "Assista aos melhores animes, filmes e séries online em alta qualidade.",
  other: {
    "google-adsense-account": "ca-pub-3340570462575682",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const plan = cookieStore.get("user_plan")?.value;
  const isFree = !plan || plan === "basic";

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col`}>
        {children}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3340570462575682"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
