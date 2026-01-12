import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Eye, EyeOff, Settings } from 'lucide-react';

interface SidebarProps {
  modelType: 'gemma' | 'gemini';
  setModelType: (type: 'gemma' | 'gemini') => void;
  ollamaModelName: string;
  setOllamaModelName: (name: string) => void;
  showRawPrompt: boolean;
  setShowRawPrompt: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  modelType,
  setModelType,
  ollamaModelName,
  setOllamaModelName,
  showRawPrompt,
  setShowRawPrompt,
}) => {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-72 glass-strong h-full flex flex-col"
    >
      {/* Logo Section */}
      <div className="p-8 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">BotTrainer</h1>
            <p className="text-sm text-muted-foreground">Intent Analysis</p>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="p-6 space-y-6 flex-1">
        <div>
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4" />
            Model Selection
          </label>

          <div className="space-y-3">
            {(['gemma', 'gemini'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setModelType(type)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all duration-200 ${modelType === type
                  ? 'bg-primary/20 border border-primary/50 text-primary'
                  : 'bg-secondary/30 border border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }`}
              >
                <Cpu className="w-5 h-5" />
                <span className="text-base font-medium capitalize">{type}</span>
                {modelType === type && (
                  <motion.div
                    layoutId="modelIndicator"
                    className="ml-auto w-2.5 h-2.5 rounded-full bg-primary"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Ollama Model Name */}
        {modelType === 'gemma' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Ollama Model Name
            </label>
            <input
              type="text"
              value={ollamaModelName}
              onChange={(e) => setOllamaModelName(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-input border border-border text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
              placeholder="gemma3"
            />
          </motion.div>
        )}

        {/* Show Raw Prompt Toggle */}
        <div className="pt-6 border-t border-border/30">
          <button
            onClick={() => setShowRawPrompt(!showRawPrompt)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 ${showRawPrompt
              ? 'bg-accent/20 border border-accent/50 text-accent'
              : 'bg-secondary/30 border border-transparent text-muted-foreground hover:bg-secondary/50'
              }`}
          >
            <span className="flex items-center gap-3">
              {showRawPrompt ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              <span className="text-base font-medium">Raw Prompt</span>
            </span>
            <div
              className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center ${showRawPrompt ? 'bg-accent' : 'bg-muted'
                }`}
            >
              <motion.div
                layout
                className={`w-5 h-5 rounded-full bg-white shadow-sm mx-0.5 ${showRawPrompt ? 'ml-auto mr-0.5' : ''
                  }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border/30">
        <div className="text-sm text-muted-foreground text-center font-medium">
          <span className="text-primary">●</span> API Connected
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
