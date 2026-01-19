import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  FlaskConical,
  BarChart3,
  FileJson,
  GitCompare,
  History as HistoryIcon
} from 'lucide-react';

export type TabType =
  | 'query'
  | 'batch'
  | 'evaluation'
  | 'schema'
  | 'comparison'
  | 'history';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'query', label: 'Single Query', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'batch', label: 'Batch Testing', icon: <FlaskConical className="w-4 h-4" /> },
  { id: 'evaluation', label: 'Evaluation', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'schema', label: 'Intent Schema', icon: <FileJson className="w-4 h-4" /> },
  { id: 'comparison', label: 'Performance', icon: <GitCompare className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <HistoryIcon className="w-4 h-4" /> },
];

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="glass-strong border-b border-border/30">
      <div className="px-6 py-4">

        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold gradient-text">
              Intent Analysis Dashboard
            </h2>
            <p className="text-xs text-muted-foreground">
              Analyze and evaluate natural language understanding
            </p>
          </div>

          <span className="px-2 py-1 rounded bg-primary/10 text-primary font-mono text-xs">
            v1.0.0
          </span>
        </div>

        {/* Tabs ONLY (View History removed) */}
        <nav className="flex gap-1 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
              }`}
            >
              {tab.icon}
              {tab.label}

              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/30"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </button>
          ))}
        </nav>

      </div>
    </header>
  );
};

export default Header;
