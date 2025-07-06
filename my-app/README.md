# OTAYORI - 犬の健康管理アプリ

## 概要
OTAYORIは、愛犬の健康管理と記録を目的としたWebアプリケーションです。ごはん、うんち、きもちの記録を通じて、愛犬の健康状態を継続的に管理できます。
np

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
- 投稿履歴のタイムライン表示（多頭飼い対応 `/timeline` で全犬まとめて表示）
- 週次・月次サマリー
- 健康レポート機能（トップページから横長ボタンで遷移可能）
- 統計データの可視化

### 🔐 セキュリティ
- Supabase認証による安全なログイン
- Row Level Security (RLS)によるデータ保護
- プープバッグ機能（パスワード保護、犬の誕生日で解除）

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
│   │   │   └── page.tsx         # 犬のプロフィール（timeline削除済み）
│   │   ├── edit/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # 犬の編集
│   │   └── register/
│   │       └── page.tsx         # 犬の登録
│   ├── timeline/                # タイムライン（多頭飼い対応）
│   │   └── page.tsx
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
│   ├── common/                  # 共通コンポーネント
│   ├── dog/                     # 犬関連コンポーネント
│   ├── layout/                  # レイアウトコンポーネント
│   ├── notifications/           # 通知コンポーネント
│   ├── otayori/                 # おたよりコンポーネント
│   ├── profile/                 # プロフィールコンポーネント
│   ├── settings/                # 設定コンポーネント
│   ├── community/               # コミュニティコンポーネント
│   └── user/                    # ユーザー関連コンポーネント
├── types/                       # TypeScript型定義
├── utils/                       # ユーティリティ
│   ├── supabase/                # Supabase関連
│   ├── imageHelpers.ts
│   ├── otayoriHelpers.ts
│   └── userStats.ts
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
- プープバッグ機能
- タイムライン表示
- 健康レポート
- 設定画面（犬設定）
- レスポンシブデザイン
- リアクション機能（いいね）

### 🚧 開発中
- コミュニティ機能
- 通知システム


### 📋 今後の予定
- 画像最適化
- 健康アドバイスをAIで。うんち診断。
- 主治医や家族との連携機能
- シェア機能
- リマインダー機能

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


## 変更履歴

- 2025/05:  
  - タイムラインを多頭飼い対応 `/timeline` に統合
  - プロフィール・編集・カードUI刷新
  - プープバッグ機能のUI・認証・文言改善
  - トップページUI刷新・健康レポートボタン追加
  - コミュニティで犬名が正しく表示されるよう修正
  - Vercel環境変数の注意をREADMEに追記

---

**開発者**: OTAYORI開発チーム  
**最終更新**: 2025年5月  
**バージョン**: 1.0.0



##　健康アドバイスをAIに書いてもらう実装（取組中）

Phase 1:
基本的な画像分析機能 ✅
✅ 型定義作成 (types/ai-analysis.ts)
✅ AI分析ユーティリティ (utils/ai-analysis.ts)
✅ APIエンドポイント (app/api/ai-analysis/route.ts)
✅ UIコンポーネント (components/otayori/AIAnalysisCard.tsx)

推奨: OpenAI GPT-4 Vision API
理由:
高精度な画像認識
自然な日本語でのアドバイス
獣医学的知識の活用
実装の簡便性
コスト効率化の工夫:
分析結果のキャッシュ: 同じ画像の再分析を避ける
バッチ処理: 複数画像をまとめて分析
ユーザー制限: 1日あたりの分析回数制限
画像圧縮: 分析前に画像サイズを最適化
セキュリティ考慮事項:
画像の一時保存: 分析後は削除
APIキーの保護: 環境変数での管理
ユーザー認証: 分析権限の確認
データプライバシー: 個人情報の適切な処理

�� 今後の拡張案
Phase 4: 高度な機能
健康トレンド分析: 時系列での健康状態変化
獣医師連携: 分析結果の獣医師への共有
緊急アラート: 異常値検出時の通知
栄養アドバイス: 食事内容の改善提案

Phase 5: AI機能強化
行動分析: 動画での行動パターン分析
病気予測: 症状の早期発見
個体差対応: 犬種・年齢別の分析精度向上
この実装により、ユーザーはわんちゃんの健康状態をより科学的に把握し、適切なケアを行うことができるようになります。まずは基本的な画像分析機能から始めて、段階的に機能を拡張していくことをお勧めします。

### 2025.07.01
AI健康分析機能を既存コンポーネント（おたより投稿フォーム・カード・健康レポート）に統合しました。
1. おたより投稿フォーム（EntryForm.tsx）
画像をアップロードし、種別を選択すると「AI健康分析を実行」ボタンが表示されます。
ボタンを押すとAI分析モーダルが開き、分析結果が表示されます。
2. おたよりカード（Card.tsx）
画像付き投稿に「AI健康分析」ボタン（右上に🧠アイコン）が表示され、クリックで分析モーダルが開きます。
3. 健康レポートページ（health-report/page.tsx）
「AI健康アドバイス」セクションに「画像分析」ボタンを追加。クリックでAI分析モーダルが開きます。
