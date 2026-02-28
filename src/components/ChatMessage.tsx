import React from 'react';
import { Sparkles, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { TaskChecklist } from './TaskChecklist';
import { RadioOptions } from './RadioOptions';
import { CodeBlock } from './CodeBlock';

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

interface ChatMessageProps {
  message: Message;
  onToggleTask?: (messageId: string, taskId: string) => void;
  onToggleAllTasks?: (messageId: string) => void;
  onSubmitTasks?: (messageId: string) => void;
  onSelectRadio?: (messageId: string, optionId: string) => void;
  onSubmitRadio?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onToggleTask, 
  onToggleAllTasks, 
  onSubmitTasks,
  onSelectRadio,
  onSubmitRadio
}) => {
  const isAI = message.role === 'model';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} group`}
    >
      <div className={`max-w-[85%] flex gap-4 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-1 transition-all duration-300 group-hover:scale-110 ${
          isAI ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' : 'bg-white/5 text-slate-400 border border-white/10'
        }`}>
          {isAI ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
        
        <div className={`space-y-4 flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
          <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-300 ${
            isAI 
              ? 'bg-white/[0.03] text-slate-200 border border-white/[0.05] hover:border-white/10' 
              : 'bg-primary text-white shadow-lg shadow-primary/10'
          }`}>
            <div className="markdown-body">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline ? (
                      <CodeBlock 
                        code={String(children).replace(/\n$/, '')}
                        language={match ? match[1] : undefined}
                      />
                    ) : (
                      <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary font-mono text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                  li: ({ children }) => <li className="text-slate-300">{children}</li>,
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-white tracking-tight">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-white tracking-tight">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-white tracking-tight">{children}</h3>,
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          </div>

          {isAI && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors" title="Copy response">
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-400 transition-colors">
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isAI && message.tasks && onToggleTask && onToggleAllTasks && onSubmitTasks && (
            <div className="w-full">
              <TaskChecklist 
                title="Design Sprint Progress"
                tasks={message.tasks}
                onToggle={(taskId) => onToggleTask(message.id, taskId)}
                onToggleAll={() => onToggleAllTasks(message.id)}
                onSubmit={() => onSubmitTasks(message.id)}
              />
            </div>
          )}

          {isAI && message.radioOptions && onSelectRadio && onSubmitRadio && (
            <div className="w-full">
              <RadioOptions
                title={message.radioOptions.title}
                options={message.radioOptions.options}
                selectedId={message.radioOptions.selectedId}
                onSelect={(optionId) => onSelectRadio(message.id, optionId)}
                onSubmit={() => onSubmitRadio(message.id)}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
