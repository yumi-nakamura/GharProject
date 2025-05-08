# 🐶 犬の健康記録アプリ - Figma UIテンプレート構造

## 📁 画面構成（Pages）

### 🔰 Authentication

* ログイン画面

  * メールアドレス入力欄
  * パスワード入力欄
  * ログインボタン
  * SNSログイン（任意）
* 新規登録画面

  * 名前、メールアドレス、パスワード
  * アバター画像登録
  * SNS連携・一言コメント（任意）

### 🏠 Home（ホーム）

* 飼っている犬の一覧カード（DogCard）
* 「今日の記録」ボタン
* 今日の食事・うんち・感情へのショートリンク
* 通知ベルアイコン
* 週次まとめカード（WeeklySummaryCard）

### 🐶 Dog Profile（犬プロフィール）

* 基本情報セクション

  * 名前・犬種・誕生日・カラー
  * チャームポイント・性格・好きな遊び
  * サイズ情報（体重・背丈・首周り・胴回り）
* ワクチン接種履歴
* 「いつものごはん」「食べられないもの」「好きなおやつ」
* 公開／非公開トグル
* 家族／動物病院の招待ボタン

### 📋 Record Entry（記録投稿）

* タブ切替（食事／うんち／感情）
* 写真アップロード
* 食事 → 食材選択（Tag + フリーテキスト）＋時間
* うんち → 状態選択（色・硬さ）＋時間
* 感情 → 写真＋感情タグ＋メモ
* 投稿ボタン＋SNSシェア（Instagram／X）

### 🧑‍🤝‍🧑 Community（コミュニティ）

* 公開された記録投稿のタイムライン（TimelinePostCard）
* 投稿カード内：リアクション（いいね・コメント・絵文字）
* コメントリスト

### 🔔 Notifications（お知らせ）

* サービス運営からのお知らせ
* 家族・動物病院からのメッセージ
* 既読／未読ステータス付き

### ⏰ Reminders（リマインダー）

* 食事時間通知設定（時間帯）
* うんち・感情の記録リマインド
* トグルON/OFFと時間指定入力

### 📊 Weekly Summary（週次まとめ）

* 1週間分の記録傾向カード
* 食事バランス・排泄頻度・感情の推移を可視化
* AIコメント付きアドバイス

### 👥 Settings & Members（設定・関係者）

* プロフィール編集（SNS、Webサイト、一言）
* 飼主ランク・継続バッジ表示
* 家族／獣医の管理（Invite + Role表示）

## 🧩 再利用コンポーネント（Components）

### 共通UI

* `Button / Primary`
* `Button / Secondary`
* `TextInput` / `Textarea`
* `TagSelector`（食材・感情・性格など）
* `ToggleSwitch`（公開／非公開）
* `BottomNavBar`（モバイル下部固定ナビ）

### カード類

* `DogCard`（名前・画像・今日のごはん）
* `TimelinePostCard`（記録表示用）
* `WeeklySummaryCard`（週次傾向）

### 投稿系

* `ImageUploader`
* `MoodSelector`
* `ReactionBar`
* `CommentList`
* `ShareToSNSButton`

### ユーザー管理系

* `InviteModal`（家族／病院招待）
* `RoleBadge`（飼主・家族・獣医）
* `NotificationItem`

---

