import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createClient } from '../supabase/server.js'

// MCPサーバーの初期化
const server = new Server(
  {
    name: 'supabase-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
)

// Supabaseクライアントの初期化
let supabaseClient: any = null

// リソースハンドラー
server.setRequestHandler('resources/list', async () => {
  if (!supabaseClient) {
    supabaseClient = await createClient()
  }
  
  // Supabaseのテーブル一覧を取得
  const { data: tables, error } = await supabaseClient
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
  
  if (error) {
    throw new Error(`Failed to fetch tables: ${error.message}`)
  }
  
  return {
    resources: tables?.map((table: any) => ({
      uri: `supabase://table/${table.table_name}`,
      name: table.table_name,
      description: `Supabase table: ${table.table_name}`,
      mimeType: 'application/json',
    })) || [],
  }
})

// ツールハンドラー
server.setRequestHandler('tools/call', async (request) => {
  if (!supabaseClient) {
    supabaseClient = await createClient()
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
})

// サーバーの起動
const transport = new StdioServerTransport()
await server.connect(transport) 