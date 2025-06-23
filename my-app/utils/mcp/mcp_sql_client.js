const net = require('net')

// MCPサーバーとの通信を行うクライアント
class MCPClient {
  constructor(port = 3001) {
    this.port = port
    this.client = new net.Socket()
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.client.connect(this.port, 'localhost', () => {
        console.log('🔗 MCPサーバーに接続しました')
        resolve()
      })

      this.client.on('error', (err) => {
        console.error('❌ 接続エラー:', err)
        reject(err)
      })
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
      
      this.client.write(JSON.stringify(request) + '\n')

      this.client.once('data', (data) => {
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
      const result = await this.sendRequest('sql/execute', { query: sql })
      return result
    } catch (error) {
      console.error('❌ SQL実行エラー:', error)
      throw error
    }
  }

  close() {
    this.client.destroy()
  }
}

async function fixRLSViaMCP() {
  const mcpClient = new MCPClient()
  
  try {
    await mcpClient.connect()
    
    console.log('🔧 MCP経由でRLSポリシーを修正中...')
    
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

    const result = await mcpClient.executeSQL(sql)
    console.log('✅ RLSポリシーの修正が完了しました！')
    console.log('📋 実行結果:', result)
    
  } catch (error) {
    console.error('❌ エラー:', error.message)
  } finally {
    mcpClient.close()
  }
}

// スクリプトを実行
fixRLSViaMCP() 