# OTAYORI - 犬の健康管理アプリ

## 概要
OTAYORIは、愛犬の健康管理と記録を目的としたWebアプリケーションです。ごはん、うんち、きもちの記録を通じて、愛犬の健康状態を継続的に管理できます。

## 主な機能

### 🐕 犬の管理
- 複数犬の登録・管理
- 犬のプロフィール情報（名前、犬種、誕生日、体重など）
- 犬の削除機能（ソフトデリート対応）

### 📝 おたより投稿
- **ごはん記録**: 食事の写真、完食状況、食欲の記録
- **うんち記録**: 排泄状況、健康状態の記録（プープバッグ機能付き）
- **きもち記録**: 愛犬の感情・機嫌の記録
- **タグ機能**: 投稿タイプ別のタグ付けによる分類・分析
- **予約投稿**: 日時指定による投稿予約機能

### 📊 健康管理
- 投稿履歴のタイムライン表示
- 週次・月次サマリー
- 健康レポート機能
- 統計データの可視化

### 🔐 セキュリティ
- Supabase認証による安全なログイン
- Row Level Security (RLS)によるデータ保護
- プープバッグ機能（パスワード保護）

## 技術スタック

### フロントエンド
- **Next.js 15.3.2** - Reactフレームワーク（App Router）
- **React 19.0.0** - UIライブラリ
- **TypeScript 5.x** - 型安全な開発
- **Tailwind CSS 4.x** - CSSフレームワーク
- **Turbopack** - 高速ビルドツール

### バックエンド・インフラ
- **Supabase** - BaaS（認証・データベース・ストレージ）
- **PostgreSQL** - リレーショナルデータベース
- **Row Level Security** - セキュリティ制御

### 主要ライブラリ
- **@supabase/supabase-js** - Supabaseクライアント
- **lucide-react** - アイコンライブラリ
- **date-fns** - 日付操作
- **classnames** - CSSクラス管理

## プロジェクト構造

```
my-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # 共通レイアウト
│   ├── page.tsx                 # ホームページ
│   ├── auth/                    # 認証関連
│   │   └── callback/
│   │       └── page.tsx
│   ├── dog/                     # 犬関連ページ
│   │   ├── [id]/
│   │   │   ├── page.tsx         # 犬のプロフィール
│   │   │   └── timeline/
│   │   │       └── page.tsx     # 犬のタイムライン
│   │   ├── edit/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # 犬の編集
│   │   └── register/
│   │       └── page.tsx         # 犬の登録
│   ├── otayori/                 # おたより関連
│   │   └── new/
│   │       └── page.tsx         # おたより投稿
│   ├── community/               # コミュニティ
│   │   └── page.tsx
│   ├── notifications/           # 通知
│   │   └── page.tsx
│   ├── profile/                 # プロフィール
│   │   └── page.tsx
│   ├── settings/                # 設定
│   │   └── page.tsx
│   ├── health-report/           # 健康レポート
│   │   └── page.tsx
│   ├── login/                   # ログイン
│   │   └── page.tsx
│   ├── signup/                  # サインアップ
│   │   └── page.tsx
│   └── error/                   # エラーページ
│       └── page.tsx
├── components/                  # Reactコンポーネント
│   ├── auth/                    # 認証コンポーネント
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── common/                  # 共通コンポーネント
│   │   ├── Button.tsx
│   │   ├── DateTimePicker.tsx   # 日時選択
│   │   ├── ImageUploader.tsx
│   │   ├── TagSelector.tsx      # タグ選択
│   │   ├── TextArea.tsx
│   │   ├── TextInput.tsx
│   │   └── ToggleSwitch.tsx
│   ├── dog/                     # 犬関連コンポーネント
│   │   ├── DogForm.tsx
│   │   ├── DogProfile.tsx
│   │   └── DogStats.tsx
│   ├── layout/                  # レイアウトコンポーネント
│   │   ├── FooterNav.tsx
│   │   ├── Navbar.tsx
│   │   ├── PageWrapper.tsx
│   │   └── ProfileStatusProvider.tsx
│   ├── notifications/           # 通知コンポーネント
│   │   ├── NotificationItem.tsx
│   │   └── NotificationList.tsx
│   ├── otayori/                 # おたよりコンポーネント
│   │   ├── Card.tsx             # 投稿カード
│   │   ├── DogTimeline.tsx      # 犬のタイムライン
│   │   ├── EntryForm.tsx        # 投稿フォーム
│   │   ├── PoopAnimation.tsx    # 投稿後アニメーション
│   │   ├── PoopImageGuard.tsx   # プープバッグ
│   │   ├── ReactionBar.tsx
│   │   └── WeeklySummaryCard.tsx
│   ├── profile/                 # プロフィールコンポーネント
│   │   ├── ProfileAchievements.tsx
│   │   ├── ProfileEditForm.tsx
│   │   ├── ProfileTimeline.tsx
│   │   └── UserCard.tsx
│   ├── settings/                # 設定コンポーネント
│   │   ├── DogListItem.tsx
│   │   └── ReminderSettings.tsx
│   ├── community/               # コミュニティコンポーネント
│   │   └── CommunityFeed.tsx
│   └── user/                    # ユーザー関連コンポーネント
│       └── UserCard.tsx
├── types/                       # TypeScript型定義
│   ├── dog.ts
│   ├── notification.ts
│   ├── otayori.ts
│   ├── settings.ts
│   └── user.ts
├── utils/                       # ユーティリティ
│   ├── supabase/                # Supabase関連
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   ├── mcp/                     # MCP関連
│   │   ├── client.ts
│   │   ├── server.js
│   │   └── server.ts
│   ├── otayoriHelpers.ts
│   └── userStats.ts
├── styles/                      # スタイル
│   └── theme.ts
├── public/                      # 静的ファイル
├── middleware.ts                # Next.jsミドルウェア
├── next.config.ts               # Next.js設定
├── tsconfig.json                # TypeScript設定
├── package.json                 # 依存関係
└── *.sql                        # データベーススキーマ
```

## データベーススキーマ

### 主要テーブル
- **user_profiles** - ユーザープロフィール
- **dogs** - 犬の基本情報
- **dog_user_relations** - 犬とユーザーの関係
- **otayori** - おたより投稿（タグ・カスタム日時対応）
- **dog_deletion_records** - 犬の削除記録
- **reminders** - リマインダー設定

### 新機能対応
- **タグシステム**: 投稿タイプ別のタグ付け
- **予約投稿**: カスタム日時指定機能
- **プープバッグ**: パスワード保護機能
- **ソフトデリート**: データ保持機能

## 環境構築

### 必須要件
- Node.js 18.17.0以上
- npm 9.0.0以上
- Git 2.0.0以上

### セットアップ手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd GharProject/my-app
npm install
```

2. **環境変数の設定**
```bash
cp env.example .env.local
# .env.localを編集してSupabaseの設定を追加
```

3. **Supabaseプロジェクトの設定**
- [Supabase](https://supabase.com)でプロジェクトを作成
- 環境変数にプロジェクトURLとAPIキーを設定

4. **データベーススキーマの設定**
SupabaseダッシュボードのSQL Editorで以下のSQLを実行:
- `create_storage_bucket.sql`
- `dog_deletion_setup.sql`
- `update_otayori_schema.sql`
- `add_poop_guard_columns.sql`
- `rls_fix.sql`

5. **開発サーバーの起動**
```bash
npm run dev
```

## 開発コマンド

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

## 主要機能の実装状況

### ✅ 実装済み
- ユーザー認証（サインアップ・ログイン）
- 犬の登録・編集・削除
- おたより投稿（ごはん・うんち・きもち）
- タグ機能
- 予約投稿機能
- プープバッグ機能
- タイムライン表示
- 健康レポート
- 設定画面
- レスポンシブデザイン

### 🚧 開発中
- コミュニティ機能
- 通知システム
- リアクション機能

### 📋 今後の予定
- 画像最適化
- パフォーマンス向上
- テスト環境構築
- CI/CDパイプライン

## セキュリティ

- **Row Level Security (RLS)**: 全テーブルで実装
- **認証**: Supabase Authによる安全な認証
- **データ保護**: ユーザー間のデータ分離
- **環境変数**: 機密情報の適切な管理

## パフォーマンス

- **Turbopack**: 高速開発サーバー
- **Next.js Image**: 画像最適化
- **コード分割**: 効率的なバンドル分割
- **キャッシュ**: 適切なキャッシュ戦略

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

プルリクエストやイシューの報告を歓迎します。貢献する前に、コーディング規約を確認してください。

---

**開発者**: OTAYORI開発チーム  
**最終更新**: 2024年12月  
**バージョン**: 1.0.0