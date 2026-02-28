import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, placeholder = "Describe your vision..." }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <footer className="p-6 md:p-10 relative z-20">
      <div className="max-w-3xl mx-auto relative group">
        <div className="relative flex items-end bg-white/[0.03] border border-white/10 rounded-3xl focus-within:border-primary/40 focus-within:bg-white/[0.05] transition-all duration-500 shadow-2xl backdrop-blur-md">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 py-4 px-6 resize-none min-h-[56px] max-h-[200px] text-sm leading-relaxed scrollbar-none"
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
          />
          <div className="flex items-center pr-4 pb-3">
            <button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                message.trim() && !disabled
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
