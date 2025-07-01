import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // セッションの永続化を改善
        persistSession: true,
        // 自動リフレッシュを有効化
        autoRefreshToken: true,
        // セッションの有効期限を延長
        detectSessionInUrl: true,
        // エラーハンドリングを改善
        flowType: 'pkce',
        // セッションが見つからない場合の処理を改善
        storageKey: 'otayori-auth-token',
        // セッションの有効期限を設定
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    }
  )
}

// スキーマキャッシュをリフレッシュする関数
export const refreshSchema = async () => {
  const supabase = createClient()
  try {
    // 簡単なクエリを実行してスキーマキャッシュを更新
    await supabase.from('user_profiles').select('id').limit(1)
    console.log('スキーマキャッシュをリフレッシュしました')
  } catch (error) {
    console.error('スキーマキャッシュのリフレッシュに失敗:', error)
  }
}

// 認証状態を確認する関数（エラーハンドリング改善）
export const checkAuthStatus = async () => {
  const supabase = createClient()
  try {
    // まずセッションを確認
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('セッション確認エラー:', sessionError)
      return null
    }
    
    if (!session) {
      console.log('セッションが存在しません')
      return null
    }
    
    // ユーザー情報を取得
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('ユーザー確認エラー:', userError)
      return null
    }
    
    return user
  } catch (error) {
    console.error('認証状態確認で予期しないエラー:', error)
    return null
  }
}

// セッションを安全に取得する関数
export const getSessionSafely = async () => {
  const supabase = createClient()
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('セッション取得エラー:', error)
      return null
    }
    return session
  } catch (error) {
    console.error('セッション取得で予期しないエラー:', error)
    return null
  }
}