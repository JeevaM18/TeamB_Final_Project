import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, FileJson, Tag, MessageSquare, Sparkles } from 'lucide-react';

interface IntentDefinition {
  name: string;
  description: string;
  examples: string[];
  entities: string[];
}

const INTENT_SCHEMA: IntentDefinition[] = [
  {
    name: 'greeting',
    description: 'User initiates conversation with a greeting',
    examples: ['Hello', 'Hi there', 'Good morning', 'Hey'],
    entities: ['time_of_day'],
  },
  {
    name: 'farewell',
    description: 'User ends the conversation',
    examples: ['Goodbye', 'See you later', 'Thanks, bye', 'Have a nice day'],
    entities: [],
  },
  {
    name: 'help_request',
    description: 'User asks for assistance or support',
    examples: ['I need help', 'Can you assist me?', 'Having an issue', 'Support needed'],
    entities: ['issue_type', 'urgency'],
  },
  {
    name: 'order_status',
    description: 'User inquires about their order',
    examples: ['Where is my order?', 'Track my package', 'Order status', 'When will it arrive?'],
    entities: ['order_id', 'product_name'],
  },
  {
    name: 'product_inquiry',
    description: 'User asks about a product or service',
    examples: ['Tell me about this product', 'What are the features?', 'How much does it cost?'],
    entities: ['product_name', 'attribute'],
  },
  {
    name: 'complaint',
    description: 'User expresses dissatisfaction',
    examples: ['This is unacceptable', 'I want to file a complaint', 'Very disappointed'],
    entities: ['issue_type', 'product_name'],
  },
  {
    name: 'feedback',
    description: 'User provides feedback about experience',
    examples: ['Great service!', 'Could be better', 'I have some suggestions'],
    entities: ['sentiment', 'topic'],
  },
  {
    name: 'booking',
    description: 'User wants to make a reservation or appointment',
    examples: ['Book a table', 'Schedule a meeting', 'Reserve for tomorrow'],
    entities: ['date', 'time', 'party_size'],
  },
  {
    name: 'cancellation',
    description: 'User wants to cancel an order or booking',
    examples: ['Cancel my order', 'I need to cancel', 'Remove my reservation'],
    entities: ['order_id', 'booking_id'],
  },
  {
    name: 'payment',
    description: 'User has payment-related queries',
    examples: ['Payment failed', 'How do I pay?', 'Refund request', 'Payment methods'],
    entities: ['payment_method', 'amount'],
  },
];

const IntentSchemaTab: React.FC = () => {
  const [expandedIntents, setExpandedIntents] = useState<Set<string>>(new Set());

  const toggleIntent = (name: string) => {
    setExpandedIntents((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIntents(new Set(INTENT_SCHEMA.map((i) => i.name)));
  };

  const collapseAll = () => {
    setExpandedIntents(new Set());
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="glass rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <FileJson className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Intent Schema</h3>
            <p className="text-sm text-muted-foreground">
              {INTENT_SCHEMA.length} intents defined
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Intent List */}
      <div className="space-y-3">
        {INTENT_SCHEMA.map((intent, index) => {
          const isExpanded = expandedIntents.has(intent.name);

          return (
            <motion.div
              key={intent.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="glass rounded-xl overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => toggleIntent(intent.name)}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                    {intent.name}
                  </span>
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {intent.description}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {intent.examples.length} examples
                  </span>
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border/30"
                  >
                    <div className="p-4 space-y-4">
                      {/* Description */}
                      <p className="text-sm text-muted-foreground sm:hidden">
                        {intent.description}
                      </p>

                      {/* Examples */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-accent" />
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Examples
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {intent.examples.map((example, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-foreground border border-border/50"
                            >
                              "{example}"
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Entities */}
                      {intent.entities.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Entities
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {intent.entities.map((entity, i) => (
                              <span
                                key={i}
                                className="px-3 py-1.5 rounded-lg bg-accent/20 text-sm text-accent font-mono"
                              >
                                {entity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default IntentSchemaTab;
