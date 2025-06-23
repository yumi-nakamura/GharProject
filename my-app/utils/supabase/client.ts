import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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