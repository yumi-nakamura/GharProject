const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabaseクライアントを作成
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function fixRLSPolicies() {
  console.log('🔧 RLSポリシーを修正中...')
  
  try {
    // RLSポリシーを修正するSQL
    const sql = `
      -- 1. 既存のポリシーを削除（もし存在する場合）
      DROP POLICY IF EXISTS "Users can insert their own dog relations" ON dog_user_relations;
      DROP POLICY IF EXISTS "Users can view their own dog relations" ON dog_user_relations;
      DROP POLICY IF EXISTS "Users can update their own dog relations" ON dog_user_relations;
      DROP POLICY IF EXISTS "Users can delete their own dog relations" ON dog_user_relations;

      -- 2. 新しいポリシーを作成

      -- INSERTポリシー: ユーザーは自分の犬との関係を挿入できる
      CREATE POLICY "Users can insert their own dog relations" ON dog_user_relations
      FOR INSERT WITH CHECK (
        auth.uid() = user_id
      );

      -- SELECTポリシー: ユーザーは自分の犬との関係を閲覧できる
      CREATE POLICY "Users can view their own dog relations" ON dog_user_relations
      FOR SELECT USING (
        auth.uid() = user_id
      );

      -- UPDATEポリシー: ユーザーは自分の犬との関係を更新できる
      CREATE POLICY "Users can update their own dog relations" ON dog_user_relations
      FOR UPDATE USING (
        auth.uid() = user_id
      ) WITH CHECK (
        auth.uid() = user_id
      );

      -- DELETEポリシー: ユーザーは自分の犬との関係を削除できる
      CREATE POLICY "Users can delete their own dog relations" ON dog_user_relations
      FOR DELETE USING (
        auth.uid() = user_id
      );

      -- 3. RLSが有効になっていることを確認
      ALTER TABLE dog_user_relations ENABLE ROW LEVEL SECURITY;
    `

    // SQLを実行
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('❌ SQL実行エラー:', error)
      return
    }
    
    console.log('✅ RLSポリシーの修正が完了しました！')
    console.log('📋 実行結果:', data)
    
    // 確認用クエリ
    console.log('\n🔍 現在のポリシーを確認中...')
    const { data: policies, error: policyError } = await supabase.rpc('exec_sql', { 
      sql_query: "SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'dog_user_relations';" 
    })
    
    if (policyError) {
      console.error('❌ ポリシー確認エラー:', policyError)
    } else {
      console.log('📋 現在のポリシー:', policies)
    }
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
  }
}

// スクリプトを実行
fixRLSPolicies() 