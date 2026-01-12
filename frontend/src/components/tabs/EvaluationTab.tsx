import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Play, Loader2, Target, Crosshair, RotateCcw, Hash } from 'lucide-react';
import { evaluate, EvaluateResponse } from '@/lib/api';

const EvaluationTab: React.FC = () => {
  const [samplesPerIntent, setSamplesPerIntent] = useState<number>(10);
  const [data, setData] = useState<EvaluateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await evaluate({ samples_per_intent: samplesPerIntent });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate');
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 0.8) return 'from-success/20 to-success/5 border-success/30 text-success';
    if (value >= 0.5) return 'from-warning/20 to-warning/5 border-warning/30 text-warning';
    return 'from-destructive/20 to-destructive/5 border-destructive/30 text-destructive';
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto custom-scrollbar">
      {/* Controls */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Evaluation Settings</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Samples Per Intent
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={samplesPerIntent}
              onChange={(e) => setSamplesPerIntent(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <motion.button
            onClick={handleEvaluate}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium flex items-center gap-2 disabled:opacity-50 transition-all glow-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Evaluation
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass rounded-xl p-4 border border-destructive/50 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {data && (
        <>
          {/* Overall Accuracy */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-6 text-center"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Overall Accuracy</h3>
            <div className="text-5xl font-bold gradient-text mb-2">
              {(data.overall_accuracy * 100).toFixed(1)}%
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mt-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.overall_accuracy * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
          </motion.div>

          {/* Classification Report */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl overflow-hidden"
          >
            <div className="p-4 border-b border-border/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Classification Report
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(data.classification_report).map(([intent, metrics], index) => (
                  <motion.div
                    key={intent}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-secondary/30 rounded-lg p-4 border border-border/50"
                  >
                    <h4 className="font-medium text-foreground mb-3 capitalize">
                      {intent.replace('_', ' ')}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Precision */}
                      <div className={`rounded-lg p-2 bg-gradient-to-br border ${getMetricColor(metrics.precision)}`}>
                        <div className="flex items-center gap-1 mb-1">
                          <Target className="w-3 h-3" />
                          <span className="text-xs">Precision</span>
                        </div>
                        <span className="font-mono font-bold">
                          {(metrics.precision * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      {/* Recall */}
                      <div className={`rounded-lg p-2 bg-gradient-to-br border ${getMetricColor(metrics.recall)}`}>
                        <div className="flex items-center gap-1 mb-1">
                          <Crosshair className="w-3 h-3" />
                          <span className="text-xs">Recall</span>
                        </div>
                        <span className="font-mono font-bold">
                          {(metrics.recall * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      {/* F1 */}
                      <div className={`rounded-lg p-2 bg-gradient-to-br border ${getMetricColor(metrics.f1)}`}>
                        <div className="flex items-center gap-1 mb-1">
                          <RotateCcw className="w-3 h-3" />
                          <span className="text-xs">F1</span>
                        </div>
                        <span className="font-mono font-bold">
                          {(metrics.f1 * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      {/* Support */}
                      <div className="rounded-lg p-2 bg-gradient-to-br from-secondary to-secondary/50 border border-border/50">
                        <div className="flex items-center gap-1 mb-1 text-muted-foreground">
                          <Hash className="w-3 h-3" />
                          <span className="text-xs">Support</span>
                        </div>
                        <span className="font-mono font-bold text-foreground">
                          {metrics.support}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !data && !error && (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-foreground font-medium mb-2">No Evaluation Data</h4>
          <p className="text-sm text-muted-foreground">
            Run an evaluation to see detailed performance metrics.
          </p>
        </div>
      )}
    </div>
  );
};

export default EvaluationTab;
