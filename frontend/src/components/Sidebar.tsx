import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Eye, EyeOff, Settings, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  modelType: 'gemma' | 'qwen';
  setModelType: (type: 'gemma' | 'qwen') => void;
  ollamaModelName: string;
  setOllamaModelName: (name: string) => void;
  showRawPrompt: boolean;
  setShowRawPrompt: (show: boolean) => void;
  apiStatus: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  modelType,
  setModelType,
  ollamaModelName,
  setOllamaModelName,
  showRawPrompt,
  setShowRawPrompt,
  apiStatus,
}) => {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-80 glass border-r border-border/40 h-full flex flex-col"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">BotTrainer</h1>
            <p className="text-xs text-muted-foreground font-medium">Intent Analysis</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-8">
          {/* Model Selection */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-2">
              <Settings className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Model Selection
              </h2>
            </div>

            <div className="space-y-2">
              {(['gemma', 'qwen'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setModelType(type)}
                  className={cn(
                    "w-full p-3 rounded-xl flex items-center justify-between transition-all duration-200 border group",
                    modelType === type
                      ? "bg-primary/10 border-primary/50 shadow-inner"
                      : "bg-secondary/30 border-transparent hover:bg-secondary/50 hover:border-border/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                      modelType === type
                        ? "bg-primary text-white"
                        : "bg-background/50 text-muted-foreground group-hover:bg-background/80"
                    )}>
                      {type === 'gemma' ? <Cpu className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div className="text-left">
                      <span className={cn(
                        "block text-sm font-semibold capitalize",
                        modelType === type ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {type}
                      </span>
                      {type === 'qwen' && (
                        <span className="text-[10px] text-muted-foreground/70">Ollama Local</span>
                      )}
                    </div>
                  </div>
                  {modelType === type && (
                    <motion.div
                      layoutId="modelIndicator"
                      className="w-2 h-2 rounded-full bg-primary shadow-glow"
                    />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Ollama Model Name */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-2">
              <Cpu className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Ollama Model Name
              </h2>
            </div>

            <input
              type="text"
              value={ollamaModelName}
              onChange={(e) => setOllamaModelName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
              placeholder="e.g. gemma:2b"
            />
            <p className="text-[10px] text-muted-foreground mt-2 px-2">
              Target model to run via Ollama (e.g. gemma3, qwen2.5:3b)
            </p>
          </section>

          {/* Show Raw Prompt Toggle */}
          <section>
            <button
              onClick={() => setShowRawPrompt(!showRawPrompt)}
              className={cn(
                "w-full px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 border",
                showRawPrompt
                  ? "bg-accent/10 border-accent/50"
                  : "bg-secondary/30 border-transparent hover:bg-secondary/50"
              )}
            >
              <div className="flex items-center gap-3">
                {showRawPrompt ? <Eye className="w-4 h-4 text-accent" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                <span className={cn(
                  "text-sm font-medium",
                  showRawPrompt ? "text-accent" : "text-muted-foreground"
                )}>Raw Prompt</span>
              </div>

              <div className={cn(
                "w-10 h-5 rounded-full relative transition-colors duration-300",
                showRawPrompt ? "bg-accent" : "bg-muted"
              )}>
                <motion.div
                  layout
                  className={cn(
                    "absolute top-1 left-1 w-3 h-3 rounded-full bg-white shadow-sm",
                    showRawPrompt && "translate-x-5"
                  )}
                />
              </div>
            </button>
          </section>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/40">
        <div className="px-3 py-2 rounded-lg bg-secondary/30 flex items-center justify-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            apiStatus ? "bg-emerald-500 shadow-glow-emerald" : "bg-rose-500 shadow-glow-rose"
          )} />
          <span className="text-xs font-semibold text-muted-foreground">
            {apiStatus ? "API Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
