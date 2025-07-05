import { DogImageAnalysis, AIAnalysisRequest, AIAnalysisResponse } from '../types/ai-analysis';

// サーバーサイドでのみOpenAIクライアントを初期化
let openai: any = null;

if (typeof window === 'undefined') {
  // サーバーサイドでのみ実行
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export class DogImageAnalyzer {
  private static getPrompt(type: 'poop' | 'meal' | 'emotion', dogInfo?: any): string {
    let typeDescription = '';
    let analysisFocus = '';
    let encouragement = '';
    let expectedContent = '';
    
    switch (type) {
      case 'poop':
        typeDescription = '排泄物の健康状態の指標となる記録';
        analysisFocus = '排泄物の色、形状、量、硬さなどを観察し、消化器の健康状態を評価してください。正常な排泄物は茶色で、適度な硬さがあります。';
        encouragement = '飼い主さんの細やかな観察力に感謝します！健康管理の基本は毎日の記録から始まります。';
        expectedContent = '排泄物（うんち）の画像';
        break;
      case 'meal':
        typeDescription = '食事の記録';
        analysisFocus = '食事の内容、量、食欲、食べ方などを観察し、栄養状態と食欲を評価してください。犬の表情や食べる様子も重要な指標です。';
        encouragement = '愛情たっぷりの食事管理、素晴らしいです！わんちゃんの健康は食事から作られます。';
        expectedContent = '食事（ごはん）の画像';
        break;
      case 'emotion':
        typeDescription = '様子の記録';
        analysisFocus = '犬の表情、姿勢、行動、目つき、耳の位置、尻尾の状態などを観察し、精神状態と機嫌を評価してください。リラックスしているか、興奮しているか、不安そうかなどを判断してください。';
        encouragement = 'わんちゃんの気持ちを大切にする優しい飼い主さんですね！心の健康も大切です。';
        expectedContent = '犬の表情や様子の画像';
        break;
    }
    
    const basePrompt = `あなたは親しみやすく、励ましの言葉を交えた獣医師のアシスタントです。この画像は犬の健康管理のための記録です。

期待される内容：${expectedContent}
分析タイプ：${typeDescription}

${analysisFocus}

**重要：画像の内容判定について**
画像に犬が写っている場合は、必ず分析を行ってください。犬以外の物体（食べ物、排泄物、風景など）が主に写っている場合のみ、以下の形式で回答してください。

犬が写っている場合は、通常の分析を行い、以下の形式で回答してください：

{
  "health_score": 1-10の数値,
  "confidence": 0.0-1.0の数値,
  "observations": ["具体的な観察結果"],
  "recommendations": ["具体的な推奨事項"],
  "warnings": ["注意が必要な点"],
  "encouragement": "飼い主さんへの励ましの言葉",
  "details": {
    "color": "色の説明（該当する場合）",
    "consistency": "硬さ・状態（該当する場合）",
    "amount": "量の評価（該当する場合）",
    "appetite": "食欲の評価（該当する場合）",
    "mood": "機嫌の評価（該当する場合）"
  }
}

**犬以外の物体が主に写っている場合のみ**、以下の形式で回答してください：
{
  "health_score": 5,
  "confidence": 0.9,
  "observations": ["画像の内容を観察した結果"],
  "recommendations": ["テーマに合わせたOTAYORIをアップしましょう！"],
  "warnings": ["この画像は期待される内容と異なります。正しいテーマの画像を選んでくださいね！"],
  "encouragement": "温かい励ましの言葉",
  "details": {
    "color": "不明",
    "consistency": "不明",
    "amount": "不明",
    "appetite": "不明",
    "mood": "不明"
  }
}

CRITICAL: あなたの回答は必ず有効なJSON形式でなければなりません。説明文、コメント、その他のテキストは一切含めないでください。JSONのみを返してください。

分析項目：
1. 健康スコア（1-10の数値）
2. 観察結果（具体的な特徴）
3. 推奨事項（改善点や良い点）
4. 注意事項（気をつけるべき点）
5. 励ましの言葉（飼い主さんへの温かいメッセージ）

${encouragement}

JSONのみを返してください。`;

    if (dogInfo) {
      return `${basePrompt}

わんちゃんの情報：
- 犬種: ${dogInfo.breed || '不明'}
- 年齢: ${dogInfo.age || '不明'}歳
- 体重: ${dogInfo.weight || '不明'}kg
- 病歴: ${dogInfo.medical_history?.join(', ') || 'なし'}

この情報も考慮して分析してください。`;
    }

    return basePrompt;
  }

  static async analyzeImage(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      console.log('DogImageAnalyzer.analyzeImage開始');
      
      // サーバーサイドでのみ実行可能
      if (typeof window !== 'undefined') {
        throw new Error('AI分析はサーバーサイドでのみ実行可能です');
      }

      if (!openai) {
        console.error('OpenAIクライアントが初期化されていません');
        throw new Error('OpenAIクライアントが初期化されていません');
      }

      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI APIキーが設定されていません');
        throw new Error('OpenAI APIキーが設定されていません');
      }

      console.log('OpenAI APIキー確認:', process.env.OPENAI_API_KEY ? '設定済み' : '未設定');
      console.log('OpenAI APIキーの長さ:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
      console.log('OpenAI APIキーのプレフィックス:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : 'なし');
      
      // APIキーの形式確認
      if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
        console.error('OpenAI APIキーの形式が正しくありません');
        throw new Error('OpenAI APIキーの形式が正しくありません');
      }

      const prompt = this.getPrompt(request.analysis_type, request.dog_info);
      console.log('プロンプト生成完了');
      
      // 画像データを処理（URLまたはBase64）
      const mimeType = request.image_mime_type || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${request.image_data}`;
      
      console.log('data URL生成:', {
        mimeType,
        dataUrlPrefix: dataUrl.substring(0, 50) + '...',
        imageDataLength: request.image_data ? request.image_data.length : 0
      });
      
      // Base64データの最終検証
      if (request.image_data) {
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(request.image_data)) {
          console.error('Base64データの形式が正しくありません（最終検証）');
          throw new Error('画像データの形式が正しくありません。もう一度お試しください。');
        }
        
        // データサイズの最終チェック
        if (request.image_data.length < 100) {
          console.error('Base64データが短すぎます（最終検証）');
          throw new Error('画像データが小さすぎます。別の画像をお試しください。');
        }
        
        if (request.image_data.length > 10 * 1024 * 1024) {
          console.error('Base64データが大きすぎます（最終検証）');
          throw new Error('画像サイズが大きすぎます。5MB以下の画像をお試しください。');
        }
      }
      
      const imageContent = request.image_data 
        ? {
            type: "image_url" as const,
            image_url: { 
              url: dataUrl
            }
          }
        : request.image_url 
        ? {
            type: "image_url" as const,
            image_url: { url: request.image_url }
          }
        : null;

      console.log('画像データ処理結果:', {
        hasImageData: !!request.image_data,
        hasImageUrl: !!request.image_url,
        imageMimeType: request.image_mime_type,
        imageContent: !!imageContent,
        imageDataLength: request.image_data ? request.image_data.length : 0
      });

      if (!imageContent) {
        console.error('画像データが見つかりません');
        throw new Error('画像データが見つかりません');
      }

      console.log('OpenAI APIリクエスト開始');
      console.log('プロンプト長さ:', prompt.length);
      console.log('プロンプト（最初の200文字）:', prompt.substring(0, 200) + '...');
      console.log('画像データ:', imageContent ? '存在' : 'なし');
      console.log('画像データ詳細:', {
        type: imageContent?.type,
        hasUrl: !!imageContent?.image_url?.url,
        urlPrefix: imageContent?.image_url?.url ? imageContent.image_url.url.substring(0, 50) + '...' : 'なし'
      });
      
      console.log('OpenAI APIリクエスト設定:', {
        model: "gpt-4o",
        maxTokens: 1000,
        temperature: 0.1,
        hasSystemMessage: true,
        hasUserMessage: true,
        hasImageContent: !!imageContent
      });
      
      let response;
      try {
        response = await openai.chat.completions.create({
          model: "gpt-4o",
                  messages: [
          {
            role: "system",
            content: "あなたは経験豊富な獣医師のアシスタントです。犬の画像を詳細に観察し、健康状態や精神状態を正確に評価してください。画像に犬が写っている場合は必ず分析を行い、犬以外の物体が主に写っている場合のみ特別な回答をしてください。必ずJSON形式で回答し、説明文は一切含めないでください。"
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              imageContent
            ]
          }
        ],
                  max_tokens: 1000,
        temperature: 0.0,
        response_format: { type: "json_object" }
        });
      } catch (apiError) {
        console.error('OpenAI API呼び出しエラー:', apiError);
        console.error('APIエラーの型:', typeof apiError);
        console.error('APIエラーの詳細:', apiError);
        
        if (apiError instanceof Error) {
          if (apiError.message.includes('API key')) {
            throw new Error('OpenAI APIキーが無効です。設定を確認してください。');
          } else if (apiError.message.includes('rate limit')) {
            throw new Error('OpenAI APIの利用制限に達しました。しばらく待ってから再試行してください。');
          } else if (apiError.message.includes('quota')) {
            throw new Error('OpenAI APIの利用制限に達しました。');
          } else {
            throw new Error(`OpenAI APIエラー: ${apiError.message}`);
          }
        } else {
          throw new Error('OpenAI APIで不明なエラーが発生しました');
        }
      }

      console.log('OpenAI API応答受信');
      console.log('応答の選択肢数:', response.choices.length);
      console.log('finish_reason:', response.choices[0].finish_reason);
      console.log('使用トークン数:', response.usage);
      
      if (response.choices.length === 0) {
        throw new Error('OpenAI APIから有効な応答が返されませんでした');
      }
      
      const choice = response.choices[0];
      console.log('選択肢詳細:', {
        finishReason: choice.finish_reason,
        hasMessage: !!choice.message,
        messageKeys: choice.message ? Object.keys(choice.message) : []
      });
      
      const content = response.choices[0].message.content;
      const refusal = response.choices[0].message.refusal;
      
      console.log('OpenAI API応答内容（最初の500文字）:', content ? content.substring(0, 500) : 'なし');
      console.log('OpenAI API応答内容（最後の500文字）:', content ? content.substring(Math.max(0, content.length - 500)) : 'なし');
      console.log('拒否理由:', refusal);
      console.log('応答内容の型:', typeof content);
      console.log('応答内容の長さ:', content ? content.length : 0);
      console.log('応答内容がnullかundefined:', content === null || content === undefined);
      
      // OpenAIが分析を拒否した場合の処理
      if (refusal) {
        console.log('OpenAIが分析を拒否しました:', refusal);
        if (request.analysis_type === 'poop') {
          throw new Error('排泄物の画像分析は、OpenAIのポリシーにより制限されています。代わりに、色、量、形状などの基本的な情報を手動で記録することをお勧めします。');
        } else {
          throw new Error('画像の内容により、AI分析が制限されています。別の画像をお試しください。');
        }
      }
      
      if (!content) {
        console.error('AI分析の結果が空です');
        console.error('応答オブジェクト全体:', response);
        console.error('選択肢の詳細:', response.choices);
        throw new Error('AI分析の結果が空です。OpenAI APIからの応答がありません。');
      }

      // response_format: { type: "json_object" }を使用しているため、直接JSONとして解析
      let jsonContent = content.trim();
      
      console.log('OpenAI応答内容（そのまま）:', jsonContent);

      // JSONレスポンスをパース
      let analysisData;
      try {
        console.log('JSONパース開始');
        console.log('抽出されたJSON（最初の200文字）:', jsonContent.substring(0, 200));
        console.log('抽出されたJSON（最後の200文字）:', jsonContent.substring(Math.max(0, jsonContent.length - 200)));
        console.log('JSONの長さ:', jsonContent.length);
        
        analysisData = JSON.parse(jsonContent);
        console.log('パースされたデータ:', analysisData);
        console.log('パースされたデータのキー:', Object.keys(analysisData));
      } catch (parseError) {
        console.error('JSONパースエラー:', parseError);
        console.error('JSONパースエラーの詳細:', parseError instanceof Error ? parseError.message : '不明なエラー');
        console.error('AI応答内容（最初の500文字）:', content.substring(0, 500));
        console.error('AI応答内容（最後の500文字）:', content.substring(Math.max(0, content.length - 500)));
        console.error('抽出されたJSON（最初の500文字）:', jsonContent.substring(0, 500));
        console.error('抽出されたJSON（最後の500文字）:', jsonContent.substring(Math.max(0, jsonContent.length - 500)));
        console.error('応答の長さ:', content.length);
        console.error('抽出されたJSONの長さ:', jsonContent.length);
        
        // JSONの構文エラーの詳細を確認
        if (parseError instanceof SyntaxError) {
          console.error('JSON構文エラー詳細:', parseError.message);
          console.error('エラー位置:', parseError.stack);
        }
        
        throw new Error('AI分析の結果を解析できませんでした。もう一度お試しください。');
      }

      // 必要なフィールドが存在するかチェック
      if (!analysisData.health_score || !analysisData.confidence || !analysisData.observations) {
        console.error('不完全なAI応答:', analysisData);
        throw new Error('AI分析の結果が不完全です。もう一度お試しください。');
      }
      
      const analysis: DogImageAnalysis = {
        id: crypto.randomUUID(),
        otayori_id: '', // 後で設定
        image_url: request.image_url || '',
        analysis_type: request.analysis_type,
        health_score: analysisData.health_score,
        confidence: analysisData.confidence,
        observations: analysisData.observations,
        recommendations: analysisData.recommendations,
        warnings: analysisData.warnings,
        details: analysisData.details,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('分析結果作成完了:', analysis);
      return {
        success: true,
        analysis
      };

    } catch (error) {
      console.error('AI分析エラー:', error);
      console.error('エラーの型:', typeof error);
      console.error('エラーの詳細:', error);
      console.error('エラースタック:', error instanceof Error ? error.stack : 'スタックトレースなし');
      
      const errorMessage = error instanceof Error ? error.message : '分析に失敗しました';
      const errorStack = error instanceof Error ? error.stack : 'スタックトレースなし';
      
      return {
        success: false,
        error: errorMessage,
        details: {
          stack: errorStack,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // 健康スコアの解釈
  static interpretHealthScore(score: number): string {
    if (score >= 8) return '非常に良好';
    if (score >= 6) return '良好';
    if (score >= 4) return '普通';
    if (score >= 2) return '注意が必要';
    return '要観察';
  }

  // 信頼度の解釈
  static interpretConfidence(confidence: number): string {
    if (confidence >= 0.8) return '高';
    if (confidence >= 0.6) return '中';
    return '低';
  }
} 