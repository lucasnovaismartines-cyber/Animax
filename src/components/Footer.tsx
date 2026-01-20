import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black/95 text-gray-400 py-12 px-4 md:px-8 border-t border-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-2xl font-black text-white mb-4 italic tracking-tighter">
            <span className="text-violet-500">ANI</span>MAX
          </h2>
          <p className="text-sm leading-relaxed">
            Sua plataforma definitiva de entretenimento asiático e mundial. 
            Mergulhe em universos infinitos.
          </p>
        </div>
        
        <div>
          <h3 className="text-white font-bold mb-4">Navegação</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Início</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Séries</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Filmes</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Lançamentos</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">Suporte</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Central de Ajuda</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Termos de Uso</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacidade</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Contato</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">Conecte-se</h3>
          <div className="flex gap-4">
            <a href="#" className="hover:text-violet-500 transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-pink-500 transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-cyan-400 transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-red-500 transition-colors"><Youtube className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-xs">
        <p>&copy; 2024 Animax Inc. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
