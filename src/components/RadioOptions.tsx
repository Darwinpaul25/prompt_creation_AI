import React from 'react';
import { Circle, CheckCircle2, Palette, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface RadioOption {
  id: string;
  label: string;
}

interface RadioOptionsProps {
  title: string;
  options: RadioOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSubmit: () => void;
}

export const RadioOptions: React.FC<RadioOptionsProps> = ({ 
  title, 
  options, 
  selectedId, 
  onSelect, 
  onSubmit 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 my-6 space-y-6 shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Palette className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Step 2: Aesthetic Selection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group text-left ${
              selectedId === option.id 
                ? 'bg-primary/5 border-primary/20 text-slate-200' 
                : 'bg-white/[0.01] border-white/5 text-slate-500 hover:border-white/10 hover:bg-white/[0.02]'
            }`}
          >
            <span className={`text-sm font-medium transition-colors ${selectedId === option.id ? 'text-slate-200' : 'group-hover:text-slate-300'}`}>
              {option.label}
            </span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              selectedId === option.id ? 'bg-primary border-primary' : 'border-white/10 group-hover:border-white/20'
            }`}>
              {selectedId === option.id && <Check className="w-3 h-3 text-white" />}
            </div>
          </button>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={onSubmit}
          disabled={!selectedId}
          className={`w-full py-4 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-[0.98] ${
            selectedId 
              ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20' 
              : 'bg-white/5 text-slate-600 cursor-not-allowed'
          }`}
        >
          Confirm Aesthetic Blueprint
        </button>
      </div>
    </motion.div>
  );
};
