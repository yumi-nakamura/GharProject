import type { OtayoriPost } from './otayori';

export interface DogImageAnalysis {
  id: string;
  otayori_id: string;
  image_url: string;
  analysis_type: 'poop' | 'meal' | 'emotion';
  
  // 分析結果
  health_score: number; // 1-10
  confidence: number; // 0-1
  observations: string[];
  recommendations: string[];
  warnings: string[];
  encouragement?: string; // 飼い主さんへの励ましの言葉
  
  // 詳細分析
  details: {
    color?: string;
    consistency?: string;
    amount?: string;
    appetite?: string;
    mood?: string;
  };
  
  created_at: string;
  updated_at: string;
}

export type DogImageAnalysisWithOtayori = DogImageAnalysis & { otayori: OtayoriPost };

export interface AIAnalysisRequest {
  image_url?: string; // 後方互換性のため残す
  image_data?: string; // Base64エンコードされた画像データ
  image_mime_type?: string; // 画像のMIMEタイプ
  analysis_type: 'poop' | 'meal' | 'emotion';
  otayori_id?: string;
  dog_info?: {
    breed?: string;
    age?: number;
    weight?: number;
    medical_history?: string[];
  };
}

export interface AIAnalysisResponse {
  success: boolean;
  analysis?: DogImageAnalysis;
  error?: string;
  details?: {
    stack?: string;
    timestamp?: string;
  };
} 