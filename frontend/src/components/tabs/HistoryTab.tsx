import React, { useEffect, useState } from "react";
import { getHistory, clearHistory } from "@/lib/api";


interface HistoryItem {
  timestamp: string;
  input: string;
  model: string;
  intent: string;
  confidence: number;
}

const HistoryTab: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = async () => {
    await clearHistory();
    await loadHistory();
  };

  return (
    <div className="p-6 text-white h-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Query History</h3>
        <button
          onClick={handleClear}
          className="px-3 py-1 rounded bg-red-500/20 border border-red-500/40 hover:bg-red-500/30"
        >
          Clear History
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : history.length === 0 ? (
        <div className="text-muted-foreground">No history yet</div>
      ) : (
        <div className="space-y-3">
          {history.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-border/30 bg-secondary/20"
            >
              <div className="text-xs text-muted-foreground mb-1">
                {new Date(item.timestamp).toLocaleString()}
              </div>
              <div className="font-mono text-sm mb-2">{item.input}</div>
              <div className="flex gap-4 text-sm">
                <span>Intent: <b>{item.intent}</b></span>
                <span>Confidence: <b>{item.confidence}</b></span>
                <span>Model: <b>{item.model}</b></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
