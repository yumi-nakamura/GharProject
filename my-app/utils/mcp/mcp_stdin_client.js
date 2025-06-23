const { spawn } = require('child_process')
const path = require('path')

// MCPサーバーとの通信を行うクライアント（標準入出力使用）
class MCPStdinClient {
  constructor() {
    this.serverProcess = null
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, 'server.js')
      this.serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString()
        console.log('📥 サーバー出力:', output)
        
        // サーバーの準備完了を待つ
        if (output.includes('Supabase MCP Server is ready')) {
          resolve()
        }
      })

      this.serverProcess.stderr.on('data', (data) => {
        console.error('❌ サーバーエラー:', data.toString())
      })

      this.serverProcess.on('error', (error) => {
        console.error('❌ サーバー起動エラー:', error)
        reject(error)
      })

      // タイムアウト設定
      setTimeout(() => {
        if (!this.serverProcess.killed) {
          resolve() // タイムアウトしても続行
        }
      }, 3000)
    })
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: method,
        params: params
      }

      console.log('📤 リクエスト送信:', method)
      
      this.serverProcess.stdin.write(JSON.stringify(request) + '\n')

      const timeout = setTimeout(() => {
        reject(new Error('リクエストタイムアウト'))
      }, 10000)

      this.serverProcess.stdout.once('data', (data) => {
        clearTimeout(timeout)
        try {
          const response = JSON.parse(data.toString())
          console.log('📥 レスポンス受信:', response)
          
          if (response.error) {
            reject(new Error(response.error.message))
          } else {
            resolve(response.result)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  async executeSQL(sql) {
    try {
      // まず、利用可能なツールを確認
      const tools = await this.sendRequest('tools/list')
      console.log('📋 利用可能なツール:', tools)
      
      // SQL実行ツールがあるかチェック
      if (tools && tools.tools && tools.tools.some(tool => tool.name === 'execute_sql')) {
        const result = await this.sendRequest('tools/call', { 
          name: 'execute_sql', 
          arguments: { query: sql } 
        })
        return result
      } else {
        // SQL実行ツールがない場合は、直接テーブル操作を試す
        console.log('💡 SQL実行ツールが見つかりません。テーブル操作を試行します...')
        
        // dog_user_relationsテーブルに直接アクセス
        const result = await this.sendRequest('tools/call', {
          name: 'query_table',
          arguments: { 
            tableName: 'dog_user_relations',
            query: '*' 
          }
        })
        return result
      }
    } catch (error) {
      console.error('❌ SQL実行エラー:', error)
      throw error
    }
  }

  close() {
    if (this.serverProcess) {
      this.serverProcess.kill()
    }
  }
}

async function fixRLSViaMCPStdin() {
  const mcpClient = new MCPStdinClient()
  
  try {
    await mcpClient.startServer()
    
    console.log('🔧 MCP経由でRLSポリシーを修正中...')
    
    // まず、現在のテーブル一覧を確認
    console.log('📋 テーブル一覧を確認中...')
    const tables = await mcpClient.sendRequest('resources/list')
    console.log('✅ 利用可能なテーブル:', tables)
    
    // dog_user_relationsテーブルの現在の状態を確認
    console.log('🔍 dog_user_relationsテーブルの状態を確認中...')
    const currentData = await mcpClient.sendRequest('tools/call', {
      name: 'query_table',
      arguments: { 
        tableName: 'dog_user_relations',
        query: '*' 
      }
    })
    console.log('📋 現在のデータ:', currentData)
    
    console.log('💡 MCPサーバー経由では直接SQLを実行できません。')
    console.log('💡 SupabaseダッシュボードのSQL Editorで以下のSQLを実行してください:')
    console.log('')
    console.log('-- RLSポリシー修正SQL')
    console.log('DROP POLICY IF EXISTS "Users can insert their own dog relations" ON dog_user_relations;')
    console.log('DROP POLICY IF EXISTS "Users can view their own dog relations" ON dog_user_relations;')
    console.log('DROP POLICY IF EXISTS "Users can update their own dog relations" ON dog_user_relations;')
    console.log('DROP POLICY IF EXISTS "Users can delete their own dog relations" ON dog_user_relations;')
    console.log('')
    console.log('CREATE POLICY "Users can insert their own dog relations" ON dog_user_relations')
    console.log('FOR INSERT WITH CHECK (auth.uid() = user_id);')
    console.log('')
    console.log('CREATE POLICY "Users can view their own dog relations" ON dog_user_relations')
    console.log('FOR SELECT USING (auth.uid() = user_id);')
    console.log('')
    console.log('CREATE POLICY "Users can update their own dog relations" ON dog_user_relations')
    console.log('FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);')
    console.log('')
    console.log('CREATE POLICY "Users can delete their own dog relations" ON dog_user_relations')
    console.log('FOR DELETE USING (auth.uid() = user_id);')
    console.log('')
    console.log('ALTER TABLE dog_user_relations ENABLE ROW LEVEL SECURITY;')
    
  } catch (error) {
    console.error('❌ エラー:', error.message)
  } finally {
    mcpClient.close()
  }
}

// スクリプトを実行
fixRLSViaMCPStdin() 