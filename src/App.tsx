import { useState, useRef, useEffect } from 'react';
import { Sidebar, ChatHistoryItem } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Edit3, Menu, Plus, Sun, Moon } from 'lucide-react';
import { sendMessage, generateTitle } from './services/gemini';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  tasks?: { id: string; text: string; completed: boolean }[];
  radioOptions?: {
    title: string;
    options: { id: string; label: string }[];
    selectedId: string | null;
  };
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

const STORAGE_KEY = 'cue_ai_chats';
const ACTIVE_CHAT_KEY = 'cue_ai_active_chat_id';

export default function App() {
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    if (parsed.length === 0) {
      return [{ id: 'initial', title: 'New Conversation', messages: [] }];
    }
    return parsed;
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const savedId = localStorage.getItem(ACTIVE_CHAT_KEY);
    if (savedId) return savedId;
    
    const savedChats = localStorage.getItem(STORAGE_KEY);
    const parsed = savedChats ? JSON.parse(savedChats) : [];
    return parsed.length > 0 ? parsed[0].id : 'initial';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('cue_ai_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId) || null;
  const messages = activeChat?.messages || [];

  useEffect(() => {
    localStorage.setItem('cue_ai_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
    }
  }, [activeChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!activeChatId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
    };

    // Update messages locally
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage]
        };
      }
      return chat;
    }));

    setIsLoading(true);
    setError(null);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Generate title if it's the first message
      if (messages.length === 0) {
        generateTitle(text).then(title => {
          setChats(prev => prev.map(chat => 
            chat.id === activeChatId ? { ...chat, title } : chat
          ));
        });
      }

      const responseText = await sendMessage(history, text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I'm sorry, I couldn't process that.",
      };

      setChats(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: [...chat.messages, aiMessage]
          };
        }
        return chat;
      }));
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.message || "I'm sorry, I couldn't process that. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeChatId === id) {
        setActiveChatId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const toggleTask = (messageId: string, taskId: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId && msg.tasks) {
              return {
                ...msg,
                tasks: msg.tasks.map(task => 
                  task.id === taskId ? { ...task, completed: !task.completed } : task
                )
              };
            }
            return msg;
          })
        };
      }
      return chat;
    }));
  };

  const toggleAllTasks = (messageId: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId && msg.tasks) {
              const allCompleted = msg.tasks.every(t => t.completed);
              return {
                ...msg,
                tasks: msg.tasks.map(task => ({ ...task, completed: !allCompleted }))
              };
            }
            return msg;
          })
        };
      }
      return chat;
    }));
  };

  const handleSubmitTasks = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.tasks) {
      const completedTasks = message.tasks.filter(t => t.completed).map(t => t.text);
      const pendingTasks = message.tasks.filter(t => !t.completed).map(t => t.text);
      
      let text = "I've updated the task list. ";
      if (completedTasks.length > 0) {
        text += `Completed: ${completedTasks.join(', ')}. `;
      }
      if (pendingTasks.length > 0) {
        text += `Still pending: ${pendingTasks.join(', ')}.`;
      }
      
      handleSend(text);
    }
  };

  const handleSelectRadio = (messageId: string, optionId: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId && msg.radioOptions) {
              return {
                ...msg,
                radioOptions: {
                  ...msg.radioOptions,
                  selectedId: optionId
                }
              };
            }
            return msg;
          })
        };
      }
      return chat;
    }));
  };

  const handleSubmitRadio = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.radioOptions && message.radioOptions.selectedId) {
      const selectedOption = message.radioOptions.options.find(o => o.id === message.radioOptions?.selectedId);
      if (selectedOption) {
        handleSend(`I've selected the ${selectedOption.label} aesthetic.`);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-slate-100 font-sans selection:bg-primary/30">
      <div className="atmosphere" />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 ${isSidebarCollapsed ? 'w-0' : 'w-72'} transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl md:shadow-none`}>
        <Sidebar 
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            setActiveChatId(id);
            setIsSidebarOpen(false);
          }}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          isCollapsed={isSidebarCollapsed}
        />
      </div>
      
      <main className="flex-1 flex flex-col relative h-full z-10">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a]/40 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-2 hover:bg-white/5 rounded-xl transition-all group"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className={`w-5 h-5 transition-colors ${isSidebarCollapsed ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'}`} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Cue.Ai" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-lg">C</span>';
                  }}
                />
              </div>
              <h2 className="font-bold text-xl tracking-tighter text-white">Cue.Ai</h2>
            </div>
            <div className="w-px h-4 bg-white/10 mx-2 hidden md:block" />
            <h2 className="font-medium text-sm truncate max-w-[200px] md:max-w-md text-slate-500">
              {activeChat?.title || 'New Conversation'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border backdrop-blur-xl transition-all active:scale-95 group header-btn"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform" />
              )}
            </button>
            <button 
              onClick={handleNewChat}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95 header-btn-primary text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
            <button 
              onClick={handleNewChat}
              className="md:hidden p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <Plus className="w-5 h-5 text-slate-400" />
            </button>
            <button className="p-2.5 hover:bg-white/5 rounded-xl transition-all group">
              <Edit3 className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
            </button>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
            {messages.length === 0 && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 pt-24">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-2xl shadow-primary/20">
                    <Edit3 className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="space-y-3 max-w-lg">
                  <h1 className="text-4xl font-bold tracking-tight welcome-title">Cue.Ai Chat</h1>
                  <p className="text-lg leading-relaxed welcome-text">
                    I am Cue.Ai. I don't just answer; I craft. Tell me your vision, and together we'll engineer the perfect response.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl pt-8">
                  {[
                    "Create a viral marketing campaign",
                    "Design a futuristic UI component",
                    "Write a deep philosophical essay",
                    "Build a scalable backend system"
                  ].map((suggestion) => (
                    <button 
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      className="p-4 rounded-2xl border transition-all text-left group suggestion-card"
                    >
                      <p className="text-sm font-medium transition-colors suggestion-card-title">{suggestion}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Click to start chatting</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onToggleTask={toggleTask}
                onToggleAllTasks={toggleAllTasks}
                onSubmitTasks={handleSubmitTasks}
                onSelectRadio={handleSelectRadio}
                onSubmitRadio={handleSubmitRadio}
              />
            ))}
            {isLoading && (
              <div className="flex items-start gap-4 animate-pulse">
                <div className="w-8 h-8 rounded bg-primary/20 flex-shrink-0 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary/40" />
                </div>
                <div className="flex-1 pt-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            )}
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput 
          onSend={handleSend} 
          disabled={isLoading || !activeChatId} 
          placeholder={messages.length === 0 ? "Describe your vision..." : ""}
        />
      </main>
    </div>
  );
}
