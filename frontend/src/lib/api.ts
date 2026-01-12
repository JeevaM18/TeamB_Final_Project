import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ConfigResponse {
  llm: { default_model: string };
  ollama: { model_name: string };
  gemini: { model_name: string; api_key: string };
}

export interface AnalyzeRequest {
  message: string;
  model_type: 'gemma' | 'gemini';
  model_name: string;
  api_key: string;
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
  gemini: ModelMetrics;
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

export default api;
