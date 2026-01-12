import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import ChatMessage from '../ChatMessage';
import TypingIndicator from '../TypingIndicator';
import { analyze, AnalyzeResponse } from '@/lib/api';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  intent?: string;
  confidence?: number;
  entities?: Record<string, string>;
}

interface SingleQueryTabProps {
  modelType: 'gemma' | 'gemini';
  modelName: string;
  showRawPrompt: boolean;
}

const SingleQueryTab: React.FC<SingleQueryTabProps> = ({
  modelType,
  modelName,
  showRawPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response: AnalyzeResponse = await analyze({
        message: input.trim(),
        model_type: modelType,
        model_name: modelName,
        api_key: '', // Handled by backend
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: input.trim(),
        intent: response.intent,
        confidence: response.confidence,
        entities: response.entities,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Error analyzing message',
        intent: 'error',
        confidence: 0,
        entities: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Start Analyzing
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Enter a message to analyze its intent, confidence score, and extract entities.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                type={message.type}
                content={message.content}
                intent={message.intent}
                confidence={message.confidence}
                entities={message.entities}
                showRaw={showRawPrompt}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="glass rounded-2xl rounded-tl-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/30">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your message to analyze..."
            className="flex-1 px-5 py-4 text-lg rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            disabled={isLoading || !input.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 text-lg rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-primary"
          >
            <Send className="w-6 h-6" />
            Analyze
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default SingleQueryTab;
