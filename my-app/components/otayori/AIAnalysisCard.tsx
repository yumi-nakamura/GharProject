'use client';

import React, { useState } from 'react';
import { DogImageAnalysis } from '../../types/ai-analysis';
import { DogImageAnalyzer } from '../../utils/ai-analysis';
import { createClient } from '../../utils/supabase/client';
import { Save, CheckCircle } from 'lucide-react';

interface AIAnalysisCardProps {
  imageUrl: string;
  analysisType: 'poop' | 'meal' | 'emotion';
  otayoriId?: string;
  onAnalysisComplete?: (analysis: DogImageAnalysis) => void;
}

// 画像をBase64エンコードする関数
const convertImageToBase64 = async (imageUrl: string): Promise<{ base64: string; mimeType: string }> => {
  try {
    console.log('画像変換開始:', imageUrl);
    console.log('画像URL詳細:', {
      url: imageUrl,
      isSupabaseUrl: imageUrl.includes('supabase.co'),
      hasAuth: imageUrl.includes('token=')
    });
    
    let response: Response;
    
    // Supabase StorageのURLの場合は認証付きで取得
    if (imageUrl.includes('supabase.co')) {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('認証が必要です');
      }
      
      // Supabase Storageから直接ダウンロード
      const pathParts = imageUrl.split('/dog-images/');
      const filePath = pathParts[1];
      console.log('Supabase Storage パス抽出:', {
        originalUrl: imageUrl,
        pathParts,
        filePath
      });
      
      if (!filePath) {
        throw new Error('画像パスが正しく抽出できませんでした');
      }
      
      const { data, error } = await supabase.storage
        .from('dog-images')
        .download(filePath);
      
      if (error) {
        console.error('Supabase Storage エラー:', error);
        console.log('通常のfetchにフォールバック');
        // エラーの場合は通常のfetchにフォールバック
        response = await fetch(imageUrl);
        console.log('画像フェッチ結果:', response.status, response.statusText);
        console.log('レスポンスヘッダー:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`画像の取得に失敗しました: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log('画像Blob取得:', blob.size, 'bytes, type:', blob.type);
        
        // HTMLレスポンスを検出（エラーページが返された場合）
        if (blob.type === 'text/html' || blob.type.includes('html')) {
          throw new Error('画像URLが無効です。認証エラーまたは画像が見つかりません。');
        }
        
        // 画像タイプでない場合
        if (!blob.type.startsWith('image/')) {
          throw new Error(`サポートされていないファイル形式です: ${blob.type}`);
        }
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            console.log('FileReader結果:', result.substring(0, 100) + '...');
            // data:image/jpeg;base64, の部分を除去してBase64部分のみを取得
            const base64 = result.split(',')[1];
            const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
            console.log('Base64変換完了:', base64 ? base64.substring(0, 50) + '...' : '空', 'MIMEタイプ:', mimeType);
            resolve({ base64, mimeType });
          };
          reader.onerror = (error) => {
            console.error('FileReaderエラー:', error);
            reject(error);
          };
          reader.readAsDataURL(blob);
        });
      }
      
      if (!data) {
        throw new Error('画像データが見つかりません');
      }
      
      console.log('Supabase Storage取得成功:', data.size, 'bytes, type:', data.type);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          console.log('FileReader結果:', result.substring(0, 100) + '...');
          // data:image/jpeg;base64, の部分を除去してBase64部分のみを取得
          const base64 = result.split(',')[1];
          const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
          console.log('Base64変換完了:', base64 ? base64.substring(0, 50) + '...' : '空', 'MIMEタイプ:', mimeType);
          resolve({ base64, mimeType });
        };
        reader.onerror = (error) => {
          console.error('FileReaderエラー:', error);
          reject(error);
        };
        reader.readAsDataURL(data);
      });
    } else {
      // 通常のURLの場合は直接fetch
      response = await fetch(imageUrl);
      console.log('画像フェッチ結果:', response.status, response.statusText);
      console.log('レスポンスヘッダー:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`画像の取得に失敗しました: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('画像Blob取得:', blob.size, 'bytes, type:', blob.type);
      
      // HTMLレスポンスを検出（エラーページが返された場合）
      if (blob.type === 'text/html' || blob.type.includes('html')) {
        throw new Error('画像URLが無効です。認証エラーまたは画像が見つかりません。');
      }
      
      // 画像タイプでない場合
      if (!blob.type.startsWith('image/')) {
        throw new Error(`サポートされていないファイル形式です: ${blob.type}`);
      }
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          console.log('FileReader結果:', result.substring(0, 100) + '...');
          // data:image/jpeg;base64, の部分を除去してBase64部分のみを取得
          const base64 = result.split(',')[1];
          const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
          console.log('Base64変換完了:', base64 ? base64.substring(0, 50) + '...' : '空', 'MIMEタイプ:', mimeType);
          resolve({ base64, mimeType });
        };
        reader.onerror = (error) => {
          console.error('FileReaderエラー:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.error('画像変換エラー:', error);
    throw new Error('画像の変換に失敗しました');
  }
};

export default function AIAnalysisCard({ 
  imageUrl, 
  analysisType, 
  otayoriId,
  onAnalysisComplete 
}: AIAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<DogImageAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleAnalyze = async () => {
    console.log('AI分析開始');
    setIsLoading(true);
    setError(null);

    try {
      // 画像をBase64エンコード
      console.log('画像Base64変換開始');
      const imageData = await convertImageToBase64(imageUrl);
      console.log('画像Base64変換完了:', imageData.base64 ? imageData.base64.substring(0, 50) + '...' : '空', 'MIMEタイプ:', imageData.mimeType);
      
      // Base64データが正しい形式かチェック
      if (!imageData.base64 || imageData.base64.length === 0) {
        throw new Error('画像の変換に失敗しました');
      }
      
      const requestBody = {
        image_data: imageData.base64,
        image_mime_type: imageData.mimeType,
        image_url: imageUrl,
        analysis_type: analysisType,
        otayori_id: otayoriId,
        dog_info: true // 犬の情報も含める
      };
      
      console.log('APIリクエスト送信:', {
        hasImageData: !!imageData.base64,
        imageDataLength: imageData.base64 ? imageData.base64.length : 0,
        imageMimeType: imageData.mimeType,
        analysisType: analysisType
      });
      
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 認証情報を含める
        body: JSON.stringify(requestBody),
      });

      console.log('APIレスポンス:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('API結果:', result);

      if (!result.success) {
        const errorMessage = result.error || '分析に失敗しました';
        const details = result.details ? ` (${result.details})` : '';
        console.error('APIエラー:', errorMessage, details);
        throw new Error(`${errorMessage}${details}`);
      }

      console.log('分析成功:', result.analysis);
      setAnalysis(result.analysis);
      onAnalysisComplete?.(result.analysis);

    } catch (err) {
      console.error('分析エラー:', err);
      setError(err instanceof Error ? err.message : '分析中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToHealthReport = async () => {
    if (!analysis) return;
    
    setIsSaving(true);
    try {
      const supabase = createClient();
      
      // 認証状態を確認
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('認証が必要です');
      }

      // 分析結果をデータベースに保存
      const { data: savedAnalysis, error: saveError } = await supabase
        .from('ai_analysis')
        .insert({
          user_id: user.id,
          otayori_id: otayoriId || null,
          image_url: imageUrl,
          analysis_type: analysisType,
          health_score: analysis.health_score,
          confidence: analysis.confidence,
          observations: analysis.observations,
          recommendations: analysis.recommendations,
          warnings: analysis.warnings,
          encouragement: analysis.encouragement,
          details: analysis.details
        })
        .select()
        .single();

      if (saveError) {
        throw new Error(`保存に失敗しました: ${saveError.message}`);
      }

      console.log('健康レポートに保存成功:', savedAnalysis);
      setIsSaved(true);
      
      // 3秒後に保存完了メッセージを消す
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);

    } catch (err) {
      console.error('保存エラー:', err);
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (analysis) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            🤖 AI健康分析結果
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              信頼度: {DogImageAnalyzer.interpretConfidence(analysis.confidence)}
            </span>
          </div>
        </div>

        {/* 健康スコア */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">健康スコア</span>
            <span className="text-2xl font-bold text-blue-600">
              {analysis.health_score}/10
            </span>
          </div>
          <div className="mt-1">
            <span className="text-sm text-gray-600">
              {DogImageAnalyzer.interpretHealthScore(analysis.health_score)}
            </span>
          </div>
        </div>

        {/* 観察結果 */}
        {analysis.observations.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">観察結果</h4>
            <ul className="space-y-1">
              {analysis.observations.map((observation, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {observation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 推奨事項 */}
        {analysis.recommendations.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">推奨事項</h4>
            <ul className="space-y-1">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-blue-500 mr-2">💡</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 注意事項 */}
        {analysis.warnings.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">注意事項</h4>
            <ul className="space-y-1">
              {analysis.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-orange-600 flex items-start">
                  <span className="text-orange-500 mr-2">⚠️</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 励ましの言葉 */}
        {analysis.encouragement && (
          <div className="border-t pt-4">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💝</div>
                <div>
                  <h4 className="text-sm font-medium text-pink-700 mb-1">メッセージ</h4>
                  <p className="text-sm text-pink-600 leading-relaxed">{analysis.encouragement}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 詳細情報 */}
        {analysis.details && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">詳細分析</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {analysis.details.color && (
                <div>
                  <span className="text-gray-500">色:</span>
                  <span className="ml-1 text-gray-700">{analysis.details.color}</span>
                </div>
              )}
              {analysis.details.consistency && (
                <div>
                  <span className="text-gray-500">状態:</span>
                  <span className="ml-1 text-gray-700">{analysis.details.consistency}</span>
                </div>
              )}
              {analysis.details.amount && (
                <div>
                  <span className="text-gray-500">量:</span>
                  <span className="ml-1 text-gray-700">{analysis.details.amount}</span>
                </div>
              )}
              {analysis.details.appetite && (
                <div>
                  <span className="text-gray-500">食欲:</span>
                  <span className="ml-1 text-gray-700">{analysis.details.appetite}</span>
                </div>
              )}
              {analysis.details.mood && (
                <div>
                  <span className="text-gray-500">機嫌:</span>
                  <span className="ml-1 text-gray-700">{analysis.details.mood}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 保存ボタン */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          {isSaved ? (
            <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="text-green-500" size={20} />
              <span className="text-green-700 font-medium">健康レポートに保存しました！</span>
            </div>
          ) : (
            <button
              onClick={handleSaveToHealthReport}
              disabled={isSaving}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save size={16} />
                  健康レポートに保存
                </>
              )}
            </button>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          ※ この分析はAIによる参考情報です。気になる症状がある場合は獣医師にご相談ください。
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="text-center">
        <div className="text-4xl mb-4">🤖</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          AI健康分析
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          画像を分析して健康状態を評価し、アドバイスを提供します
        </p>
        
        {error && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-start">
              <div className="text-orange-500 mr-2 mt-0.5">⚠️</div>
              <div>
                <p className="text-sm font-medium text-orange-800 mb-1">分析できませんでした</p>
                <p className="text-sm text-orange-700">{error}</p>
                {error.includes('排泄物') && (
                  <div className="mt-2 p-2 bg-orange-100 rounded text-xs text-orange-800">
                    <p className="font-medium mb-1">代替案:</p>
                    <ul className="space-y-1">
                      <li>• 色、量、形状を手動で記録</li>
                      <li>• 食事記録や様子の記録を分析</li>
                      <li>• 気になる症状があれば獣医師に相談</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              分析中...
            </div>
          ) : (
            '分析を開始'
          )}
        </button>
      </div>
    </div>
  );
} 