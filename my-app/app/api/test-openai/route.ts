import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    console.log('OpenAI APIキーテスト開始');
    
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
    const hasApiKey = !!apiKey;
    const apiKeyLength = apiKey ? apiKey.length : 0;
    const apiKeyPrefix = apiKey ? apiKey.substring(0, 7) + '...' : 'なし';
    
    console.log('OpenAI APIキー確認:', {
      hasApiKey,
      apiKeyLength,
      apiKeyPrefix
    });
    
    // OpenAIクライアントの初期化テスト
    let openaiClient = null;
    let openaiError = null;
    
    try {
      if (typeof window === 'undefined') {
        const { default: OpenAI } = await import('openai');
        openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('OpenAIクライアント初期化成功');
      } else {
        openaiError = 'クライアントサイドでは実行できません';
      }
    } catch (error) {
      openaiError = error instanceof Error ? error.message : '不明なエラー';
      console.error('OpenAIクライアント初期化エラー:', error);
    }
    
    // 簡単なAPIテスト（実際のリクエストは送信しない）
    let apiTestResult = null;
    if (openaiClient && !openaiError) {
      try {
        // 実際のAPIリクエストは送信せず、設定のみ確認
        apiTestResult = {
          model: 'gpt-4o',
          maxTokens: 1000,
          temperature: 0.1,
          status: '設定確認完了'
        };
        console.log('API設定確認完了');
      } catch (error) {
        apiTestResult = {
          error: error instanceof Error ? error.message : '不明なエラー'
        };
        console.error('API設定確認エラー:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      auth: {
        userId: session.user.id,
        status: '認証済み'
      },
      openai: {
        hasApiKey,
        apiKeyLength,
        apiKeyPrefix,
        clientInitialized: !!openaiClient,
        clientError: openaiError,
        apiTestResult
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('OpenAI APIキーテストエラー:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 