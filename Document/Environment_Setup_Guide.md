# OTAYORI アプリケーション 環境構築ガイド

## 概要
OTAYORIは、犬の健康管理と記録を目的としたWebアプリケーションです。Next.js 15とSupabaseを使用して構築されており、TypeScript、Tailwind CSS、Turbopackを採用しています。

## 動作環境

### 必須要件

#### Node.js
- **バージョン**: 18.17.0以上
- **推奨**: Node.js 20.x LTS
- **確認方法**: `node --version`

#### npm
- **バージョン**: 9.0.0以上
- **推奨**: npm 10.x
- **確認方法**: `npm --version`

#### Git
- **バージョン**: 2.0.0以上
- **確認方法**: `git --version`

### 推奨開発環境

#### OS
- **macOS**: 13.0以上
- **Windows**: Windows 10/11
- **Linux**: Ubuntu 20.04以上

#### エディタ
- **推奨**: Visual Studio Code
- **推奨拡張機能**:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint

#### ブラウザ
- **Chrome**: 100以上
- **Firefox**: 100以上
- **Safari**: 15以上
- **Edge**: 100以上

## 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|------|------------|------|
| Next.js | 15.3.2 | Reactフレームワーク |
| React | 19.0.0 | UIライブラリ |
| TypeScript | 5.x | 型安全な開発 |
| Tailwind CSS | 4.x | CSSフレームワーク |
| Turbopack | 内蔵 | 高速ビルドツール |

### バックエンド・インフラ
| 技術 | バージョン | 用途 |
|------|------------|------|
| Supabase | 最新 | BaaS（認証・DB・ストレージ） |
| PostgreSQL | 15+ | データベース |
| Row Level Security | - | セキュリティ制御 |

### 主要ライブラリ
| ライブラリ | バージョン | 用途 |
|------------|------------|------|
| @supabase/supabase-js | 2.49.4 | Supabaseクライアント |
| @supabase/ssr | 0.6.1 | サーバーサイドレンダリング |
| lucide-react | 0.510.0 | アイコンライブラリ |
| date-fns | 4.1.0 | 日付操作 |
| classnames | 2.5.1 | CSSクラス管理 |

## 環境構築手順

### 1. リポジトリのクローン

```bash
# リポジトリをクローン
git clone <repository-url>
cd GharProject/my-app

# 依存関係をインストール
npm install
```

### 2. Supabaseプロジェクトの設定

#### 2.1 Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com)にアクセス
2. アカウントを作成・ログイン
3. 新しいプロジェクトを作成
4. プロジェクト名: `otayori-app`
5. データベースパスワードを設定
6. リージョンを選択（推奨: Asia Pacific (Tokyo)）

#### 2.2 環境変数の設定

```bash
# .env.localファイルを作成
cp env.example .env.local
```

`.env.local`ファイルを編集:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**設定値の取得方法:**
1. Supabaseダッシュボードにアクセス
2. プロジェクトを選択
3. Settings > API
4. Project URLとanon public keyをコピー

#### 2.3 データベーススキーマの設定

SupabaseダッシュボードのSQL Editorで以下のSQLを順次実行:

```sql
-- 1. ストレージバケットとuser_profilesテーブルの作成
-- create_storage_bucket.sqlの内容を実行

-- 2. 犬の削除機能の設定
-- dog_deletion_setup.sqlの内容を実行

-- 3. おたよりテーブルにタグと日時指定機能を追加
-- update_otayori_schema.sqlの内容を実行

-- 4. プープバッグ機能の追加
-- add_poop_guard_columns.sqlの内容を実行

-- 5. RLSポリシーの修正
-- rls_fix.sqlの内容を実行
```

### 3. 開発サーバーの起動

```bash
# 開発サーバーを起動
npm run dev
```

**アクセスURL**: http://localhost:3000 (または利用可能なポート)

### 4. 動作確認

1. ブラウザで http://localhost:3000 にアクセス
2. サインアップページでアカウントを作成
3. ログインしてアプリケーションの動作を確認

## 開発コマンド

### 基本的なコマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# リンター実行
npm run lint

# MCPサーバー起動（開発用）
npm run mcp:server
```

### 追加の開発ツール

```bash
# TypeScript型チェック
npx tsc --noEmit

# Tailwind CSSビルド
npx tailwindcss -i ./styles/globals.css -o ./styles/output.css --watch

# 依存関係の更新確認
npm outdated

# セキュリティ脆弱性チェック
npm audit
```

## プロジェクト構造

```
my-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 共通レイアウト
│   ├── page.tsx           # ホームページ
│   ├── auth/              # 認証関連ページ
│   ├── dog/               # 犬関連ページ
│   ├── otayori/           # おたより関連ページ
│   ├── community/         # コミュニティページ
│   ├── notifications/     # 通知ページ
│   ├── settings/          # 設定ページ
│   └── profile/           # プロフィールページ
├── components/            # Reactコンポーネント
│   ├── auth/              # 認証コンポーネント
│   ├── common/            # 共通コンポーネント
│   ├── dog/               # 犬関連コンポーネント
│   ├── otayori/           # おたよりコンポーネント
│   ├── layout/            # レイアウトコンポーネント
│   ├── notifications/     # 通知コンポーネント
│   ├── profile/           # プロフィールコンポーネント
│   ├── settings/          # 設定コンポーネント
│   └── user/              # ユーザー関連コンポーネント
├── types/                 # TypeScript型定義
├── utils/                 # ユーティリティ関数
│   ├── supabase/          # Supabase関連
│   ├── mcp/               # MCP関連
│   └── otayoriHelpers.ts  # おたよりヘルパー
├── styles/                # スタイルファイル
├── public/                # 静的ファイル
├── middleware.ts          # Next.jsミドルウェア
├── next.config.ts         # Next.js設定
├── tsconfig.json          # TypeScript設定
├── package.json           # 依存関係
└── .env.local             # 環境変数
```

## 環境変数

### 必須環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### 開発用環境変数（オプション）

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `NODE_ENV` | 実行環境 | `development` |
| `PORT` | 開発サーバーポート | `3000` |

## トラブルシューティング

### よくある問題と解決方法

#### 1. 依存関係のインストールエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

#### 2. Supabase接続エラー

```bash
# 環境変数が正しく設定されているか確認
cat .env.local

# Supabaseプロジェクトの設定を確認
# ダッシュボード > Settings > API
```

#### 3. TypeScriptエラー

```bash
# 型チェックを実行
npx tsc --noEmit

# 型定義を再生成
npm run build
```

#### 4. Tailwind CSSが適用されない

```bash
# Tailwind CSSを再ビルド
npx tailwindcss -i ./styles/globals.css -o ./styles/output.css --watch
```

#### 5. ポートが使用中

```bash
# 使用中のポートを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>
```

### ログの確認

```bash
# 開発サーバーのログを確認
npm run dev

# ビルドログを確認
npm run build

# リンターのログを確認
npm run lint
```

## デプロイメント

### Vercelへのデプロイ

1. [Vercel](https://vercel.com)にアカウント作成
2. GitHubリポジトリと連携
3. 環境変数を設定
4. デプロイ実行

### その他のプラットフォーム

- **Netlify**: 静的サイトホスティング
- **Railway**: フルスタックホスティング
- **AWS Amplify**: AWS統合ホスティング

## パフォーマンス最適化

### ビルド最適化

```bash
# プロダクションビルド
npm run build

# バンドルサイズ分析
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

### 画像最適化

- Next.js Image componentを使用
- WebP形式の画像を使用
- 適切なサイズで画像をアップロード

### データベース最適化

- 適切なインデックスを設定
- クエリの最適化
- RLSポリシーの見直し

## セキュリティ

### 推奨セキュリティ設定

1. **環境変数の管理**
   - `.env.local`を`.gitignore`に追加
   - 本番環境では環境変数を使用

2. **Supabaseセキュリティ**
   - RLSポリシーの適切な設定
   - 認証トークンの管理

3. **依存関係の管理**
   - 定期的なセキュリティアップデート
   - `npm audit`の実行

## 監視・ログ

### 推奨監視ツール

- **Vercel Analytics**: パフォーマンス監視
- **Supabase Dashboard**: データベース監視
- **Sentry**: エラー監視

### ログ設定

```javascript
// 本番環境でのログ設定
if (process.env.NODE_ENV === 'production') {
  // ログサービスへの送信設定
}
```

## 今後の拡張予定

### 技術的改善

1. **パフォーマンス向上**
   - 画像の最適化
   - コード分割の改善
   - キャッシュ戦略の最適化

2. **開発体験の向上**
   - テスト環境の構築
   - CI/CDパイプラインの構築
   - 開発ツールの充実

3. **セキュリティ強化**
   - 多要素認証の実装
   - 監査ログの実装
   - セキュリティスキャンの導入

---

**作成日**: 2024年12月
**バージョン**: 1.0
**作成者**: OTAYORI開発チーム 