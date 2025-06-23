const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabaseクライアントを作成（管理権限が必要）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function fixRLSPoliciesDirect() {
  console.log('🔧 RLSポリシーを直接修正中...')
  
  try {
    // まず、現在のポリシーを確認
    console.log('📋 現在のポリシーを確認中...')
    
    // dog_user_relationsテーブルの構造を確認
    const { data: tableInfo, error: tableError } = await supabase
      .from('dog_user_relations')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ テーブル確認エラー:', tableError)
      return
    }
    
    console.log('✅ テーブル構造確認完了')
    
    // テスト用のデータを挿入してみる
    console.log('🧪 テスト挿入を試行中...')
    
    // まず、現在のユーザーを取得
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ ユーザー取得エラー:', userError)
      console.log('💡 ログインが必要です。ブラウザでログインしてから再実行してください。')
      return
    }
    
    console.log('✅ ユーザー確認完了:', user.id)
    
    // 既存の犬のIDを取得
    const { data: dogs, error: dogsError } = await supabase
      .from('dogs')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
    
    if (dogsError || !dogs || dogs.length === 0) {
      console.error('❌ 犬のデータ取得エラー:', dogsError)
      console.log('💡 まず犬を登録してください。')
      return
    }
    
    const dogId = dogs[0].id
    console.log('✅ 犬のID確認完了:', dogId)
    
    // 既存の関係を確認
    const { data: existingRels, error: relsError } = await supabase
      .from('dog_user_relations')
      .select('*')
      .eq('user_id', user.id)
      .eq('dog_id', dogId)
    
    if (relsError) {
      console.error('❌ 関係確認エラー:', relsError)
      return
    }
    
    console.log('📋 既存の関係:', existingRels)
    
    if (existingRels && existingRels.length > 0) {
      console.log('✅ 既に関係が存在します')
    } else {
      console.log('💡 新しい関係を作成してみます...')
      
      // 新しい関係を挿入してみる
      const { data: newRel, error: insertError } = await supabase
        .from('dog_user_relations')
        .insert({
          user_id: user.id,
          dog_id: dogId
        })
        .select()
      
      if (insertError) {
        console.error('❌ 挿入エラー:', insertError)
        console.log('💡 このエラーがRLSポリシーの問題です。')
        console.log('💡 SupabaseダッシュボードのSQL Editorで手動でポリシーを修正してください。')
        return
      }
      
      console.log('✅ 新しい関係を作成しました:', newRel)
    }
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
  }
}

// スクリプトを実行
fixRLSPoliciesDirect() 