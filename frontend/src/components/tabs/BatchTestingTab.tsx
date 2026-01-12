import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { batchTest, BatchTestResult } from '@/lib/api';

const SAMPLE_INTENTS = [
  'greeting',
  'farewell',
  'help_request',
  'order_status',
  'product_inquiry',
  'complaint',
  'feedback',
  'booking',
  'cancellation',
  'payment',
];

const BatchTestingTab: React.FC = () => {
  const [selectedIntent, setSelectedIntent] = useState<string>('greeting');
  const [numSamples, setNumSamples] = useState<number>(5);
  const [results, setResults] = useState<BatchTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunTest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await batchTest({
        intent: selectedIntent,
        num_samples: numSamples,
      });
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run batch test');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.5) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto custom-scrollbar">
      {/* Controls */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Batch Test Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Intent Selection */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Intent
            </label>
            <select
              value={selectedIntent}
              onChange={(e) => setSelectedIntent(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              {SAMPLE_INTENTS.map((intent) => (
                <option key={intent} value={intent}>
                  {intent.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Number of Samples */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Samples
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={numSamples}
              onChange={(e) => setNumSamples(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Run Button */}
          <div className="flex items-end">
            <motion.button
              onClick={handleRunTest}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all glow-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Test
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass rounded-xl p-4 border border-destructive/50 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl overflow-hidden"
        >
          <div className="p-4 border-b border-border/30">
            <h3 className="font-semibold text-foreground">
              Results ({results.length} samples)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Text
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Predicted
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Match
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {results.map((result, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-foreground max-w-md truncate">
                      {result.text}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        {result.predicted_intent}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-sm ${getConfidenceColor(result.confidence)}`}>
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {result.predicted_intent === selectedIntent ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && !error && (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Play className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-foreground font-medium mb-2">No Results Yet</h4>
          <p className="text-sm text-muted-foreground">
            Configure your test parameters and click "Run Test" to see results.
          </p>
        </div>
      )}
    </div>
  );
};

export default BatchTestingTab;
