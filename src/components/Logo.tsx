import React from 'react';
import { Sparkles, Edit3 } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-24 h-24 text-4xl'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-10 h-10'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative flex-shrink-0 ${sizeClasses[size].split(' ')[0]} ${sizeClasses[size].split(' ')[1]} rounded-xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden group`}>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Edit3 className={`${iconSizes[size]} text-white relative z-10`} />
        <div className="absolute -top-1 -right-1">
          <Sparkles className={`${iconSizes[size]} text-white/40`} />
        </div>
      </div>
      {showText && (
        <span className={`font-bold tracking-tighter ${size === 'xl' ? 'text-4xl' : 'text-xl'} welcome-title`}>
          Cue.Ai
        </span>
      )}
    </div>
  );
};
