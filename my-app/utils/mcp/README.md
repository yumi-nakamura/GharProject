# Supabase MCP 接続ガイド

このディレクトリには、SupabaseとMCP（Model Context Protocol）を接続するためのファイルが含まれています。

## ファイル構成

- `client.ts` - Supabaseクライアントクラス（MCPプロトコル対応）
- `server.js` - MCPサーバー（CommonJS形式）
- `example.ts` - 使用例
- `README.md` - このファイル

## セットアップ

### 1. 環境変数の設定

`.env.local`ファイルに以下を設定してください：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. MCPサーバーの起動

```bash
npm run mcp:server
```

## 使用方法

### 基本的な使用例

```typescript
import { SupabaseMCPClient } from './utils/mcp/client.js'

const mcpClient = new SupabaseMCPClient()

// テーブル一覧を取得
const tables = await mcpClient.getTables()

// データをクエリ
const data = await mcpClient.queryTable('your_table_name', '*')

// レコードを挿入
const newRecord = { name: 'Test', created_at: new Date() }
const insertedData = await mcpClient.insertRecord('your_table_name', newRecord)
```

### Next.js APIルートでの使用

```typescript
import { handleMCPRequest } from './utils/mcp/example.js'

export default async function handler(req, res) {
  await handleMCPRequest(req, res)
}
```

### MCPサーバーとの通信

MCPサーバーは標準入出力を使用してJSON形式で通信します：

```bash
# テーブル一覧を取得
echo '{"id": 1, "method": "resources/list"}' | npm run mcp:server

# データをクエリ
echo '{"id": 2, "method": "tools/call", "params": {"name": "query_table", "arguments": {"tableName": "users", "query": "*"}}}' | npm run mcp:server
```

## 利用可能なメソッド

### SupabaseMCPClientクラス
- `getTables()` - テーブル一覧を取得
- `getTableSchema(tableName)` - テーブルのスキーマを取得
- `queryTable(tableName, query)` - テーブルからデータをクエリ
- `insertRecord(tableName, record)` - 新しいレコードを挿入
- `updateRecord(tableName, record, conditions)` - レコードを更新
- `deleteRecord(tableName, conditions)` - レコードを削除

### MCPサーバー
- `resources/list` - 利用可能なリソース（テーブル）を一覧表示
- `tools/call` - データベース操作を実行
  - `query_table` - テーブルからデータをクエリ
  - `insert_record` - 新しいレコードを挿入

## 注意事項

- MCPサーバーはNode.js環境でのみ動作します
- Supabaseの認証情報が正しく設定されていることを確認してください
- 本番環境では適切なセキュリティ対策を実施してください
- MCPサーバーは標準入出力を使用するため、パイプやリダイレクトで通信できます 