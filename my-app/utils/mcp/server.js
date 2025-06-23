#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js')

// MCPサーバーの初期化
const server = {
  name: 'supabase-mcp-server',
  version: '1.0.0',
  capabilities: {
    resources: {},
    tools: {},
  }
}

// Supabaseクライアントの初期化
let supabaseClient = null

// Supabaseクライアントを作成する関数
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Supabase環境変数が設定されていません。
    
設定方法:
1. .env.localファイルを作成
2. 以下の内容を追加:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

または、環境変数を直接設定:
   export NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

Supabaseダッシュボード: https://supabase.com/dashboard/project/[your-project-id]/settings/api`)
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// リソースハンドラー
async function handleResourcesList() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient()
  }
  
  // Supabaseのテーブル一覧を取得
  const { data: tables, error } = await supabaseClient
    .rpc('get_public_tables')
  
  if (error) {
    throw new Error(`Failed to fetch tables: ${error.message}`)
  }
  
  return {
    resources: tables?.map((table) => ({
      uri: `supabase://table/${table.table_name}`,
      name: table.table_name,
      description: `Supabase table: ${table.table_name}`,
      mimeType: 'application/json',
    })) || [],
  }
}

// ツールハンドラー
async function handleToolsCall(request) {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient()
  }
  
  const { name, arguments: args } = request.params
  
  switch (name) {
    case 'query_table':
      const { tableName, query } = args
      const { data, error } = await supabaseClient
        .from(tableName)
        .select(query || '*')
      
      if (error) {
        throw new Error(`Query failed: ${error.message}`)
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      }
    
    case 'insert_record':
      const { tableName: insertTable, record } = args
      const { data: insertData, error: insertError } = await supabaseClient
        .from(insertTable)
        .insert(record)
        .select()
      
      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`)
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(insertData, null, 2),
          },
        ],
      }
    
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

// メイン処理
async function main() {
  try {
    console.log('Supabase MCP Server starting...')
    console.log('環境変数の確認中...')
    
    // 環境変数の確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL が設定されていません')
    } else {
      console.log('✅ NEXT_PUBLIC_SUPABASE_URL が設定されています')
    }
    
    if (!supabaseKey) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません')
    } else {
      console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されています')
    }
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase環境変数が設定されていません')
    }
    
    console.log('Supabase MCP Server is ready')
    console.log('Available commands:')
    console.log('- resources/list: List all tables')
    console.log('- tools/call: Execute database operations')
    
    // 標準入出力でMCPプロトコルを処理
    process.stdin.on('data', async (data) => {
      let request;
      try {
        request = JSON.parse(data.toString())
        
        if (request.method === 'resources/list') {
          const result = await handleResourcesList()
          console.log(JSON.stringify({ id: request.id, result }))
        } else if (request.method === 'tools/call') {
          const result = await handleToolsCall(request)
          console.log(JSON.stringify({ id: request.id, result }))
        } else {
          console.log(JSON.stringify({ 
            id: request.id, 
            error: { message: `Unknown method: ${request.method}` } 
          }))
        }
      } catch (error) {
        console.log(JSON.stringify({ 
          id: request?.id, 
          error: { message: error.message } 
        }))
      }
    })
    
  } catch (error) {
    console.error('Server error:', error.message)
    process.exit(1)
  }
}

main() 