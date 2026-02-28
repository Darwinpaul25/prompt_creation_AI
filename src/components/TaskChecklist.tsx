import React from 'react';
import { CheckCircle2, Circle, ListTodo, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskChecklistProps {
  title: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onSubmit: () => void;
}

export const TaskChecklist: React.FC<TaskChecklistProps> = ({ title, tasks, onToggle, onToggleAll, onSubmit }) => {
  const allCompleted = tasks.length > 0 && tasks.every(t => t.completed);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 my-6 space-y-6 shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Step 1: Information Gathering</p>
          </div>
        </div>
        <button 
          onClick={onToggleAll}
          className="text-[10px] font-bold text-slate-500 hover:text-primary uppercase tracking-widest transition-colors"
        >
          {allCompleted ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onToggle(task.id)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 group text-left ${
              task.completed 
                ? 'bg-primary/5 border-primary/20 text-slate-200' 
                : 'bg-white/[0.01] border-white/5 text-slate-500 hover:border-white/10 hover:bg-white/[0.02]'
            }`}
          >
            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
              task.completed ? 'bg-primary border-primary' : 'border-white/10 group-hover:border-white/20'
            }`}>
              {task.completed && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-sm font-medium transition-all ${
              task.completed 
                ? 'line-through opacity-50' 
                : 'group-hover:text-slate-300'
            }`}>
              {task.text}
            </span>
          </button>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={onSubmit}
          className="w-full py-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        >
          Confirm Blueprint Details
        </button>
      </div>
    </motion.div>
  );
};
