import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Target, Gauge, Tags } from 'lucide-react';

interface ChatMessageProps {
  type: 'user' | 'bot';
  content: string;
  intent?: string;
  confidence?: number;
  entities?: Record<string, string>;
  showRaw?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  content,
  intent,
  confidence,
  entities,
  showRaw,
}) => {
  const isUser = type === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isUser
              ? 'bg-gradient-to-br from-accent to-primary'
              : 'bg-gradient-to-br from-primary to-accent'
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'glass rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <p className="text-sm">{content}</p>
          ) : (
            <div className="space-y-3">
              {showRaw && (
                <div className="text-xs font-mono bg-secondary/50 rounded px-2 py-1 text-muted-foreground">
                  Raw: {content}
                </div>
              )}

              {/* Intent */}
              {intent && (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Intent:</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-sm font-medium">
                    {intent}
                  </span>
                </div>
              )}

              {/* Confidence */}
              {confidence !== undefined && (
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-success" />
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          confidence >= 0.8
                            ? 'bg-success'
                            : confidence >= 0.5
                            ? 'bg-warning'
                            : 'bg-destructive'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-mono text-foreground">
                      {(confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Entities */}
              {entities && Object.keys(entities).length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tags className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground">Entities:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(entities).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-1 rounded-lg bg-accent/20 text-xs"
                      >
                        <span className="text-accent font-medium">{key}:</span>{' '}
                        <span className="text-foreground">{value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
