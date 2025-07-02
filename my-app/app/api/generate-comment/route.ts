import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('generate-comment API 開始')
    
    const { imageUrl, type } = await request.json()
    console.log('リクエストデータ:', { imageUrl, type })

    if (!imageUrl) {
      console.log('エラー: 画像URLがありません')
      return NextResponse.json({ error: '画像URLが必要です' }, { status: 400 })
    }

    if (!type || !['meal', 'poop', 'emotion'].includes(type)) {
      console.log('エラー: 無効なタイプ:', type)
      return NextResponse.json({ error: '有効なタイプが必要です' }, { status: 400 })
    }

    // Supabaseクライアントの初期化
    console.log('Supabaseクライアント初期化中...')
    const supabase = await createClient()
    console.log('Supabaseクライアント初期化完了')

    // 認証チェック
    console.log('認証チェック中...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.log('認証エラー:', authError)
      return NextResponse.json({ error: '認証エラー: ' + authError.message }, { status: 401 })
    }
    if (!user) {
      console.log('ユーザーが見つかりません')
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }
    console.log('認証チェック完了:', user.id)

    // OpenAI APIキーの取得
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.log('警告: OpenAI APIキーが設定されていません。テスト用コメントを返します。')
      // テスト用のコメントを返す
      const testComments = {
        meal: '今日も美味しそうに食べてくれて嬉しい！お気に入りのごはん、完食だね！',
        poop: '健康なうんちで良かった！今日も元気に排泄できてるね。',
        emotion: 'とっても楽しそうな表情だね！リラックスして気持ちよさそう。'
      }
      return NextResponse.json({ 
        comment: testComments[type as keyof typeof testComments],
        success: true,
        note: 'テスト用コメントです'
      })
    }
    console.log('OpenAI APIキー確認完了')

    // 画像をBase64に変換
    console.log('画像処理中:', imageUrl.substring(0, 50) + '...')
    
    let base64Image = ''
    if (imageUrl.startsWith('data:image/')) {
      // すでにBase64形式の場合
      const base64Match = imageUrl.match(/data:image\/[^;]+;base64,(.+)/)
      if (base64Match) {
        base64Image = base64Match[1]
        console.log('Base64画像取得完了, サイズ:', base64Image.length)
        
        // Base64サイズチェック（約5MB相当）
        if (base64Image.length > 6 * 1024 * 1024) {
          console.log('エラー: 画像サイズが大きすぎます')
          return NextResponse.json({ error: '画像サイズが大きすぎます。5MB以下の画像を選択してください。' }, { status: 400 })
        }
      } else {
        console.log('エラー: 無効なBase64形式')
        return NextResponse.json({ error: '無効な画像形式です' }, { status: 400 })
      }
    } else {
      // URLの場合（フォールバック）
      console.log('URL画像取得中:', imageUrl)
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        console.log('画像取得エラー:', imageResponse.status, imageResponse.statusText)
        return NextResponse.json({ error: '画像の取得に失敗しました: ' + imageResponse.statusText }, { status: 400 })
      }

      const imageBuffer = await imageResponse.arrayBuffer()
      base64Image = Buffer.from(imageBuffer).toString('base64')
      console.log('画像Base64変換完了, サイズ:', base64Image.length)
      
      // Base64サイズチェック（約5MB相当）
      if (base64Image.length > 6 * 1024 * 1024) {
        console.log('エラー: 画像サイズが大きすぎます')
        return NextResponse.json({ error: '画像サイズが大きすぎます。5MB以下の画像を選択してください。' }, { status: 400 })
      }
    }

    // タイプに応じたプロンプトを設定
    const typePrompts = {
      meal: 'この写真は犬の食事に関する写真です。愛らしく、親しみやすい口調で、この食事の様子について自然なコメントを生成してください。例：「今日も美味しそうに食べてくれて嬉しい！」「お気に入りのごはん、完食だね！」など。',
      poop: 'この写真は犬の排泄物に関する写真です。健康管理の観点から、親しみやすく、励ましの言葉を含むコメントを生成してください。例：「健康なうんちで良かった！」「今日も元気に排泄できてるね」など。',
      emotion: 'この写真は犬の表情や様子に関する写真です。愛らしく、感情豊かな口調で、この瞬間の様子について自然なコメントを生成してください。例：「とっても楽しそうな表情だね！」「リラックスして気持ちよさそう」など。'
    }

    const prompt = typePrompts[type as keyof typeof typePrompts]
    console.log('プロンプト設定完了:', type)

    // OpenAI APIリクエスト
    console.log('OpenAI APIリクエスト送信中...')
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'あなたは愛犬の写真を見て、親しみやすく温かいコメントを生成するアシスタントです。日本語で、愛らしく、励ましの言葉を含む自然なコメントを生成してください。'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      })

      console.log('OpenAI APIレスポンス:', openaiResponse.status)
      
      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json()
        console.error('OpenAI API エラー:', errorData)
        throw new Error('OpenAI API エラー: ' + (errorData.error?.message || '不明なエラー'))
      }

      const openaiData = await openaiResponse.json()
      console.log('OpenAI API レスポンスデータ:', openaiData)
      
      const generatedComment = openaiData.choices[0]?.message?.content?.trim()

      if (!generatedComment) {
        console.log('生成されたコメントが空です')
        throw new Error('コメントの生成に失敗しました')
      }

      console.log('コメント生成成功:', generatedComment)

      return NextResponse.json({ 
        comment: generatedComment,
        success: true 
      })
      
    } catch (openaiError) {
      console.error('OpenAI API エラー:', openaiError)
      console.log('フォールバック: テスト用コメントを返します')
      
      // フォールバック: テスト用のコメントを返す
      const testComments = {
        meal: '今日も美味しそうに食べてくれて嬉しい！お気に入りのごはん、完食だね！',
        poop: '健康なうんちで良かった！今日も元気に排泄できてるね。',
        emotion: 'とっても楽しそうな表情だね！リラックスして気持ちよさそう。'
      }
      
      return NextResponse.json({ 
        comment: testComments[type as keyof typeof testComments],
        success: true,
        note: 'OpenAI APIエラーのため、テスト用コメントを返しました',
        error: openaiError instanceof Error ? openaiError.message : 'OpenAI API エラー'
      })
    }

  } catch (error) {
    console.error('generate-comment API エラー:', error)
    return NextResponse.json({ 
      error: 'サーバーエラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー'),
      details: error instanceof Error ? error.stack : error
    }, { status: 500 })
  }
} 