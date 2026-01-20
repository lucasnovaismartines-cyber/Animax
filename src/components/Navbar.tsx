"use client";

import Link from 'next/link';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/90 to-transparent px-4 py-4 md:px-8 transition-colors duration-300 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-400 font-black text-3xl tracking-tighter italic">
            ANIMAX
          </Link>
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <li><Link href="/" className="hover:text-cyan-400 transition-colors">Início</Link></li>
            <li><Link href="/animes" className="hover:text-violet-400 transition-colors">Animes</Link></li>
            <li><Link href="/movies" className="hover:text-cyan-400 transition-colors">Filmes</Link></li>
            <li><Link href="/series" className="hover:text-violet-400 transition-colors">Séries</Link></li>
            <li><Link href="/community" className="hover:text-white transition-colors">Comunidade</Link></li>
          </ul>
        </div>

        <div className="flex items-center gap-6 text-gray-400">
          <Link href="/search" className="hover:text-cyan-400 transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          <button className="hover:text-violet-400 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          
          <div className="h-6 w-px bg-gray-800"></div>

          <div className="flex items-center gap-4">
            <Link href="/profile">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-900/30 ring-2 ring-black cursor-pointer">
                <User className="w-4 h-4" />
              </div>
            </Link>

            <form action={logout}>
              <button className="text-xs hover:text-red-400 transition-colors flex items-center gap-1">
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
