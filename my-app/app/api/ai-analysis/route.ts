import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DogImageAnalyzer } from '../../../utils/ai-analysis';
import { AIAnalysisRequest } from '../../../types/ai-analysis';

export async function POST(request: NextRequest) {
  try {
    console.log('AI分析API開始');
    const supabase = await createClient();
    
    // セッションを取得
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('認証エラー:', sessionError);
      return NextResponse.json({ 
        error: '認証が必要です',
        details: sessionError?.message || 'セッションが見つかりません'
      }, { status: 401 });
    }
    
    console.log('認証成功:', session.user.id);
    
    // OpenAI APIキーの確認
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI APIキーが設定されていません');
      return NextResponse.json({ 
        error: 'OpenAI APIキーが設定されていません',
        details: '環境変数OPENAI_API_KEYを確認してください'
      }, { status: 500 });
    }
    
    console.log('OpenAI APIキー確認:', {
      hasKey: !!apiKey,
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 7) + '...'
    });
    
    // ユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('ユーザー取得エラー:', authError);
      return NextResponse.json({ 
        error: '認証が必要です',
        details: authError?.message || 'ユーザーが見つかりません'
      }, { status: 401 });
    }

    const body: AIAnalysisRequest = await request.json();
    console.log('リクエストボディ:', {
      hasImageData: !!body.image_data,
      imageDataLength: body.image_data ? body.image_data.length : 0,
      imageMimeType: body.image_mime_type,
      analysisType: body.analysis_type,
      hasDogInfo: !!body.dog_info
    });
    
    // バリデーション
    if (!body.image_data || !body.analysis_type) {
      console.error('バリデーションエラー: 画像データまたは分析タイプが不足');
      return NextResponse.json({ error: '画像データと分析タイプが必要です' }, { status: 400 });
    }

    // Base64データの検証
    if (body.image_data) {
      console.log('Base64データ検証開始');
      console.log('Base64データ長:', body.image_data.length);
      console.log('Base64データ（最初の50文字）:', body.image_data.substring(0, 50));
      console.log('Base64データ（最後の50文字）:', body.image_data.substring(Math.max(0, body.image_data.length - 50)));
      
      // Base64文字列の形式チェック
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(body.image_data)) {
        console.error('Base64データの形式が正しくありません');
        return NextResponse.json({ 
          error: '画像データの形式が正しくありません。もう一度お試しください。',
          details: 'Base64データの形式エラー'
        }, { status: 400 });
      }
      
      // Base64データの長さチェック（最小・最大）
      if (body.image_data.length < 100) {
        console.error('Base64データが短すぎます');
        return NextResponse.json({ 
          error: '画像データが小さすぎます。別の画像をお試しください。',
          details: 'Base64データが短すぎる'
        }, { status: 400 });
      }
      
      if (body.image_data.length > 10 * 1024 * 1024) { // 10MB制限
        console.error('Base64データが大きすぎます');
        return NextResponse.json({ 
          error: '画像サイズが大きすぎます。5MB以下の画像をお試しください。',
          details: 'Base64データが大きすぎる'
        }, { status: 400 });
      }
      
      console.log('Base64データ検証完了');
    }

    // 犬の情報を取得（オプション）
    let dogInfo: { breed?: string; age?: number; weight?: number; medical_history?: string[] } | undefined = undefined;
    if (body.dog_info) {
      console.log('犬の情報取得開始');
      const { data: dogs, error: dogsError } = await supabase
        .from('dogs')
        .select('breed, birthday, weight, medical_history')
        .eq('owner_id', user.id)
        .eq('is_deleted', false)
        .limit(1);
      
      if (dogsError) {
        console.error('犬の情報取得エラー:', dogsError);
      } else {
        console.log('犬の情報取得結果:', dogs);
      }
      
      if (dogs && dogs.length > 0) {
        const dog = dogs[0];
        const age = dog.birthday ? 
          Math.floor((Date.now() - new Date(dog.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 
          null;
        
        dogInfo = {
          breed: dog.breed,
          age: age || undefined,
          weight: dog.weight,
          medical_history: dog.medical_history
        };
        console.log('犬の情報設定:', dogInfo);
      }
    }

    // AI分析実行
    const analysisRequest: AIAnalysisRequest = {
      ...body,
      dog_info: dogInfo
    };

    console.log('AI分析実行開始');
    console.log('分析リクエスト詳細:', {
      hasImageData: !!analysisRequest.image_data,
      imageDataLength: analysisRequest.image_data ? analysisRequest.image_data.length : 0,
      imageMimeType: analysisRequest.image_mime_type,
      analysisType: analysisRequest.analysis_type,
      hasDogInfo: !!analysisRequest.dog_info,
      hasOtayoriId: !!analysisRequest.otayori_id
    });
    
    const result = await DogImageAnalyzer.analyzeImage(analysisRequest);
    console.log('AI分析結果:', {
      success: result.success,
      hasAnalysis: !!result.analysis,
      error: result.error,
      hasDetails: !!result.details
    });
    
    if (!result.success) {
      console.error('AI分析失敗:', result.error);
      console.error('AI分析エラー詳細:', result.details);
      return NextResponse.json({ 
        error: result.error,
        details: result.details?.stack || result.error,
        timestamp: result.details?.timestamp || new Date().toISOString()
      }, { status: 500 });
    }

    console.log('AI分析成功');
    
    // 分析結果をデータベースに保存
    if (result.analysis) {
      try {
        // otayori_idを取得（画像URLから推測 or 直接渡された場合）
        let otayori_id = null;
        if (body.otayori_id) {
          otayori_id = body.otayori_id;
          console.log('bodyから直接渡されたotayori_idを使用:', otayori_id);
        } else if (body.image_url) {
          console.log('画像URLからotayori_idを抽出:', body.image_url);
          
          // 複数のパターンでotayori_idを抽出
          let extractedId = null;
          
          // パターン1: /storage/v1/object/public/dog-images/otayori/{otayori_id}/...
          const urlMatch1 = body.image_url.match(/otayori\/([^\/]+)\//);
          if (urlMatch1) {
            extractedId = urlMatch1[1];
            console.log('パターン1で抽出されたotayori_id:', extractedId);
          }
          
          // パターン2: /dog-images/otayori/{otayori_id}/...
          if (!extractedId) {
            const urlMatch2 = body.image_url.match(/dog-images\/otayori\/([^\/]+)\//);
            if (urlMatch2) {
              extractedId = urlMatch2[1];
              console.log('パターン2で抽出されたotayori_id:', extractedId);
            }
          }
          
          // photo_urlでotayori投稿を必ず検索
          if (!extractedId && body.image_url) {
            try {
              const { data: otayoriByPhoto, error: photoError } = await supabase
                .from('otayori')
                .select('id')
                .eq('photo_url', body.image_url)
                .single();
              if (!photoError && otayoriByPhoto) {
                extractedId = otayoriByPhoto.id;
                console.log('photo_urlで見つかったotayori_id:', extractedId);
              }
            } catch (e) {
              console.log('photo_url検索エラー:', e);
            }
          }
          
          if (extractedId) {
            // 実際にotayoriテーブルに存在するか確認
            const { data: otayoriPost, error: otayoriError } = await supabase
              .from('otayori')
              .select('id, dog_id, type, datetime')
              .eq('id', extractedId)
              .single();
            
            if (otayoriError) {
              console.error('otayori_id確認エラー:', otayoriError);
            } else if (otayoriPost) {
              otayori_id = extractedId;
              console.log('有効なotayori_id確認:', otayori_id, otayoriPost);
            }
          }
        }
        
        // otayori_idが取得できない場合は、一時的なレコードを作成
        if (!otayori_id) {
          console.log('otayori_idが取得できないため、一時的なotayoriレコードを作成');
          
          // ユーザーの犬のIDを取得
          const { data: userDogs, error: dogsError } = await supabase
            .from('dogs')
            .select('id')
            .eq('owner_id', user.id)
            .eq('is_deleted', false)
            .limit(1);
          
          let dogId = user.id; // フォールバック
          if (!dogsError && userDogs && userDogs.length > 0) {
            dogId = userDogs[0].id;
            console.log('使用するdog_id:', dogId);
          }
          
          // 一時的なotayoriレコードを作成
          const { data: tempOtayori, error: tempOtayoriError } = await supabase
            .from('otayori')
            .insert({
              dog_id: dogId,
              type: body.analysis_type,
              datetime: new Date().toISOString(),
              content: 'AI分析用の一時的な投稿',
              photo_url: body.image_url || ''
            })
            .select()
            .single();
          
          if (tempOtayoriError) {
            console.error('一時的なotayoriレコード作成エラー:', tempOtayoriError);
          } else {
            otayori_id = tempOtayori.id;
          }
        }
        
        const { error: saveError } = await supabase
          .from('ai_analysis')
          .insert({
            user_id: user.id,
            otayori_id: otayori_id,
            image_url: body.image_url || '',
            analysis_type: body.analysis_type,
            health_score: result.analysis.health_score,
            confidence: result.analysis.confidence,
            observations: result.analysis.observations,
            recommendations: result.analysis.recommendations,
            warnings: result.analysis.warnings,
            encouragement: result.analysis.encouragement,
            details: result.analysis.details
          });
        
        if (saveError) {
          console.error('分析結果保存エラー:', saveError);
          // 保存エラーでも分析結果は返す
        }
      } catch (saveError) {
        console.error('分析結果保存中にエラー:', saveError);
        // 保存エラーでも分析結果は返す
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      analysis: result.analysis 
    });

  } catch (error) {
    console.error('AI分析APIエラー:', error);
    console.error('エラースタック:', error instanceof Error ? error.stack : 'スタックトレースなし');
    console.error('エラーの型:', typeof error);
    console.error('エラーの詳細:', error);
    
    // より詳細なエラー情報を返す
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    const errorStack = error instanceof Error ? error.stack : 'スタックトレースなし';
    
    return NextResponse.json(
      { 
        error: 'AI分析の結果を解析できませんでした。もう一度お試しください。',
        details: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
} 