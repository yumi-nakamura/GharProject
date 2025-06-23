const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabaseクライアントを作成
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkAvailableFunctions() {
  console.log('🔍 利用可能な関数を確認中...')
  
  try {
    // 利用可能な関数を確認
    const { data: functions, error } = await supabase.rpc('get_public_tables')
    
    if (error) {
      console.error('❌ 関数確認エラー:', error)
      console.log('📋 エラーメッセージ:', error.message)
      return
    }
    
    console.log('✅ 利用可能な関数:', functions)
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
  }
}

// スクリプトを実行
checkAvailableFunctions() 