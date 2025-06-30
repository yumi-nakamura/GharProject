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
        flowType: 'pkce'
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

// 認証状態を確認する関数
export const checkAuthStatus = async () => {
  const supabase = createClient()
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('認証状態確認エラー:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('認証状態確認で予期しないエラー:', error)
    return null
  }
}