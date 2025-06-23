import { SupabaseMCPClient } from './client.js'

// MCPクライアントの使用例
export async function exampleUsage() {
  const mcpClient = new SupabaseMCPClient()
  
  try {
    // テーブル一覧を取得
    const tables = await mcpClient.getTables()
    console.log('Available tables:', tables)
    
    // 特定のテーブルのスキーマを取得
    if (tables.length > 0) {
      const schema = await mcpClient.getTableSchema(tables[0])
      console.log(`Schema for ${tables[0]}:`, schema)
    }
    
    // テーブルからデータをクエリ
    const data = await mcpClient.queryTable('your_table_name', '*')
    console.log('Query result:', data)
    
    // 新しいレコードを挿入
    const newRecord = {
      name: 'Test Record',
      created_at: new Date().toISOString(),
    }
    const insertedData = await mcpClient.insertRecord('your_table_name', newRecord)
    console.log('Inserted record:', insertedData)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Next.js APIルートでの使用例
export async function handleMCPRequest(req: any, res: any) {
  const mcpClient = new SupabaseMCPClient()
  
  try {
    const { action, tableName, query, record } = req.body
    
    switch (action) {
      case 'query':
        const data = await mcpClient.queryTable(tableName, query)
        res.json({ success: true, data })
        break
        
      case 'insert':
        const insertedData = await mcpClient.insertRecord(tableName, record)
        res.json({ success: true, data: insertedData })
        break
        
      case 'tables':
        const tables = await mcpClient.getTables()
        res.json({ success: true, data: tables })
        break
        
      default:
        res.status(400).json({ success: false, error: 'Invalid action' })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
} 