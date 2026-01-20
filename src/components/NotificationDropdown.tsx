"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Info, Zap, Layout, Wrench } from "lucide-react";
import { changelogData } from "@/lib/changelog";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for updates
    const latestVersion = changelogData[0]?.id;
    const lastSeenVersion = localStorage.getItem('animax_last_seen_version');
    
    if (latestVersion && latestVersion !== lastSeenVersion) {
      setHasUnread(true);
    }

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (newState) {
      setHasUnread(false);
      const latestVersion = changelogData[0]?.id;
      if (latestVersion) {
        localStorage.setItem('animax_last_seen_version', latestVersion);
      }
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'feature': return <Zap className="w-3 h-3 text-yellow-400" />;
      case 'fix': return <Wrench className="w-3 h-3 text-red-400" />;
      case 'improvement': return <Layout className="w-3 h-3 text-blue-400" />;
      default: return <Info className="w-3 h-3 text-gray-400" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'fix': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'improvement': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getLabelForType = (type: string) => {
    switch (type) {
      case 'feature': return 'Novidade';
      case 'fix': return 'Correção';
      case 'improvement': return 'Melhoria';
      default: return 'Info';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="group hover:text-violet-400 transition-colors relative flex items-center justify-center p-1 active:scale-95 cursor-pointer z-50"
        aria-label="Notificações do Sistema"
      >
        <Bell className="w-5 h-5 group-hover:animate-swing" />
        {hasUnread && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#121212] border border-gray-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 ring-1 ring-white/10">
          <div className="p-4 border-b border-gray-800 bg-[#121212]/95 backdrop-blur-sm sticky top-0 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-sm">Atualizações do Sistema</h3>
              <p className="text-[10px] text-gray-400">Versão Atual: {changelogData[0]?.version}</p>
            </div>
            {hasUnread && (
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-medium">
                Novo
              </span>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar p-2 space-y-2">
            {changelogData.map((item) => (
              <div 
                key={item.id}
                className="p-3 rounded-lg bg-gray-800/30 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1.5 font-medium ${getColorForType(item.type)}`}>
                    {getIconForType(item.type)}
                    {getLabelForType(item.type)}
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <h4 className="text-sm font-bold text-gray-200 mb-1">
                  {item.title}
                </h4>
                
                <p className="text-xs text-gray-400 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-2 pt-2 border-t border-gray-800/50 flex items-center gap-2">
                  <span className="text-[9px] text-gray-600 font-mono">v{item.version}</span>
                </div>
              </div>
            ))}

            <div className="p-4 text-center">
              <p className="text-[10px] text-gray-600">
                Isso é tudo por enquanto! 🚀
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
