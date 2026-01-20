"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, Loader2 } from "lucide-react";
import { getMessages, sendMessage, ChatMessage } from "@/app/actions/community";
import Image from "next/image";

interface CommunityChatProps {
  initialMessages: ChatMessage[];
  currentUserId?: string;
}

export function CommunityChat({ initialMessages, currentUserId }: CommunityChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling para novas mensagens a cada 3 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedMessages = await getMessages();
      if (updatedMessages.length > messages.length || updatedMessages[updatedMessages.length - 1]?.id !== messages[messages.length - 1]?.id) {
        setMessages(updatedMessages);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const tempContent = newMessage;
    setNewMessage(""); // Limpa input imediatamente para UX fluida

    const result = await sendMessage(tempContent);
    
    if (result.error) {
      alert(result.error);
      setNewMessage(tempContent); // Devolve o texto em caso de erro
    } else {
      // Atualiza lista imediatamente
      const updated = await getMessages();
      setMessages(updated);
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#121212] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
      {/* Header do Chat */}
      <div className="p-4 bg-gray-900/90 backdrop-blur border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Chat da Comunidade
          </h2>
          <p className="text-xs text-gray-400">Discuta sobre animes, filmes e novidades em tempo real.</p>
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {messages.length} mensagens
        </div>
      </div>

      {/* Área de Mensagens */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('/chat-bg-pattern.png')] bg-repeat bg-opacity-5"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
            <UserIcon className="w-12 h-12 mb-2" />
            <p>Seja o primeiro a comentar!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = currentUserId === msg.user.id;
          const isPremium = msg.user.plan === "premium";

          return (
            <div 
              key={msg.id} 
              className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                <div className={`w-8 h-8 rounded-full overflow-hidden border ${isPremium ? "border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]" : "border-gray-700"}`}>
                  {msg.user.avatarUrl ? (
                    <Image 
                      src={msg.user.avatarUrl} 
                      alt={msg.user.name} 
                      width={32} 
                      height={32} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {isPremium && (
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-[8px] font-bold px-1 rounded-full text-black border border-black">
                    PRO
                  </span>
                )}
              </div>

              {/* Balão de Mensagem */}
              <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${isMe ? "text-cyan-400" : "text-gray-300"}`}>
                    {msg.user.name}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div 
                  className={`px-4 py-2 rounded-2xl text-sm leading-relaxed break-words shadow-md
                    ${isMe 
                      ? "bg-cyan-600/20 text-cyan-100 rounded-tr-none border border-cyan-500/30" 
                      : "bg-gray-800/60 text-gray-200 rounded-tl-none border border-gray-700/50"
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={currentUserId ? "Digite sua mensagem..." : "Faça login para participar..."}
            disabled={!currentUserId || sending}
            className="flex-1 bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!currentUserId || !newMessage.trim() || sending}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-900/20 group"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            )}
          </button>
        </form>
        {!currentUserId && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
            <a href="/login" className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-transform hover:scale-105">
              Entrar para conversar
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
