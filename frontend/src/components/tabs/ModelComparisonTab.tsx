import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Play, Loader2, Trophy, Target, Crosshair, RotateCcw } from 'lucide-react';
import { compareModels, CompareModelsResponse, ModelMetrics } from '@/lib/api';

const ModelComparisonTab: React.FC = () => {
  const [numIntents, setNumIntents] = useState<number>(5);
  const [samplesPerIntent, setSamplesPerIntent] = useState<number>(10);
  const [data, setData] = useState<CompareModelsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await compareModels({
        num_intents: numIntents,
        samples_per_intent: samplesPerIntent,
      });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare models');
    } finally {
      setIsLoading(false);
    }
  };

  const MetricBar = ({ value, label, icon: Icon, color }: { value: number; label: string; icon: React.ElementType; color: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <span className="font-mono font-medium text-foreground">
          {(value * 100).toFixed(1)}%
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
        />
      </div>
    </div>
  );

  const ModelCard = ({ name, metrics, winner }: { name: string; metrics: ModelMetrics; winner: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-6 ${winner ? 'ring-2 ring-primary glow-primary' : ''}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${name === 'gemma'
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
            }`}>
            <span className="text-lg font-bold text-white uppercase">
              {name[0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground capitalize">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {name === 'gemma' ? 'Ollama Local' : 'Ollama Local'}
            </p>
          </div>
        </div>
        {winner && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
            <Trophy className="w-4 h-4" />
            Winner
          </div>
        )}
      </div>

      <div className="space-y-4">
        <MetricBar value={metrics.accuracy} label="Accuracy" icon={Trophy} color="text-primary" />
        <MetricBar value={metrics.precision} label="Precision" icon={Target} color="text-success" />
        <MetricBar value={metrics.recall} label="Recall" icon={Crosshair} color="text-accent" />
        <MetricBar value={metrics.f1} label="F1 Score" icon={RotateCcw} color="text-warning" />
      </div>

      {/* Overall Score */}
      <div className="mt-6 pt-4 border-t border-border/30 text-center">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Overall Score</span>
        <div className="text-3xl font-bold gradient-text mt-1">
          {((metrics.accuracy + metrics.precision + metrics.recall + metrics.f1) / 4 * 100).toFixed(1)}%
        </div>
      </div>
    </motion.div>
  );

  const getWinner = (): 'gemma' | 'qwen' | null => {
    if (!data) return null;
    const gemmaScore = (data.gemma.accuracy + data.gemma.precision + data.gemma.recall + data.gemma.f1) / 4;
    const qwenScore = (data.qwen.accuracy + data.qwen.precision + data.qwen.recall + data.qwen.f1) / 4;
    if (gemmaScore > qwenScore) return 'gemma';
    if (qwenScore > gemmaScore) return 'qwen';
    return null;
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto custom-scrollbar">
      {/* Controls */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary" />
          Model Comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Number of Intents
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={numIntents}
              onChange={(e) => setNumIntents(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Samples Per Intent
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={samplesPerIntent}
              onChange={(e) => setSamplesPerIntent(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="flex items-end">
            <motion.button
              onClick={handleCompare}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all glow-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Compare
                </>
              )}
            </motion.button>
          </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModelCard name="gemma" metrics={data.gemma} winner={getWinner() === 'gemma'} />
          <ModelCard name="qwen" metrics={data.qwen} winner={getWinner() === 'qwen'} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !data && !error && (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <GitCompare className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-foreground font-medium mb-2">Compare Models</h4>
          <p className="text-sm text-muted-foreground">
            Run a comparison to see how Gemma and Qwen perform side by side.
          </p>
        </div>
      )}
    </div>
  );
};

export default ModelComparisonTab;
