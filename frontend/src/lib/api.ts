import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ConfigResponse {
  llm: {
    default_model: string;
    available_models: string[];
  };
  ollama: {
    model_name: string;
    temperature: number;
    timeout: number;
  };
  qwen: {
    model_name: string;
    temperature: number;
  };
}

export interface AnalyzeRequest {
  message: string;
  model_type: 'gemma' | 'qwen';
  model_name?: string;
  api_key?: string;
  temperature?: number;
}

export interface AnalyzeResponse {
  intent: string;
  confidence: number;
  entities: Record<string, string>;
}

export interface BatchTestRequest {
  intent: string;
  num_samples: number;
}

export interface BatchTestResult {
  text: string;
  predicted_intent: string;
  confidence: number;
  entities: Record<string, string>;
}

export interface EvaluateRequest {
  samples_per_intent: number;
}

export interface EvaluateResponse {
  overall_accuracy: number;
  classification_report: Record<string, {
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }>;
}

export interface CompareModelsRequest {
  num_intents: number;
  samples_per_intent: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface CompareModelsResponse {
  gemma: ModelMetrics;
  qwen: ModelMetrics;
}

export const getConfig = async (): Promise<ConfigResponse> => {
  const response = await api.get<ConfigResponse>('/config');
  return response.data;
};

export const analyze = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const response = await api.post<AnalyzeResponse>('/analyze', request);
  return response.data;
};

export const batchTest = async (request: BatchTestRequest): Promise<BatchTestResult[]> => {
  const response = await api.post<BatchTestResult[]>('/batch_test', request);
  return response.data;
};

export const evaluate = async (request: EvaluateRequest): Promise<EvaluateResponse> => {
  const response = await api.post<EvaluateResponse>('/evaluate', request);
  return response.data;
};

export const compareModels = async (request: CompareModelsRequest): Promise<CompareModelsResponse> => {
  const response = await api.post<CompareModelsResponse>('/compare_models', request);
  return response.data;
};

// Add this to api.ts

export interface HistoryItem {
  timestamp: string;
  input: string;
  model: string;
  intent: string;
  confidence: number;
}

export const getHistory = async (): Promise<HistoryItem[]> => {
  const response = await api.get<HistoryItem[]>('/history'); // your backend endpoint
  return response.data;
};

export const clearHistory = async (): Promise<void> => {
  await api.delete('/history'); // your backend endpoint to clear history
};


export default api;
