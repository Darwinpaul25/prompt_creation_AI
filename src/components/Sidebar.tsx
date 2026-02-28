import React from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Logo } from './Logo';

export interface ChatHistoryItem {
  id: string;
  title: string;
}

interface SidebarProps {
  chats: ChatHistoryItem[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  chats, 
  activeChatId, 
  onSelectChat, 
  onNewChat,
  onDeleteChat,
  isCollapsed
}) => {
  return (
    <aside className={`${isCollapsed ? 'w-0 overflow-hidden border-none' : 'w-72 border-r'} h-full flex-shrink-0 bg-[#0a0a0a] border-white/5 hidden md:flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] sidebar-theme`}>
      <div className="p-6 flex flex-col gap-6">
        <div className="px-2">
          <Logo showText />
        </div>
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border rounded-2xl transition-all duration-300 text-sm font-semibold active:scale-[0.98] whitespace-nowrap group sidebar-new-chat-btn"
        >
          <Plus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-none">
        <div className="px-3 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] whitespace-nowrap sidebar-label">
          Blueprint History
        </div>
        <div className="space-y-1">
          {chats.map((chat) => (
            <div key={chat.id} className="group relative">
              <button
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-sm pr-10 ${
                  activeChatId === chat.id 
                    ? 'shadow-sm border sidebar-active-item' 
                    : 'text-slate-500 hover:bg-white/[0.02] hover:text-slate-300 border border-transparent'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeChatId === chat.id ? 'bg-primary scale-100' : 'bg-slate-700 scale-50 group-hover:scale-75'}`} />
                <span className="truncate font-medium tracking-tight">{chat.title}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
