# GharProject
がるきゅんアプリ

--
ページ構成
| ページ名          | パス例                  | 内容                       |
| ------------- | -------------------- | ------------------------ |
| ホーム           | `/`                  | 飼っている犬の一覧、記録導線、週次サマリー    |
| サインアップ        | `/signup`            | 新規アカウント登録画面              |
| ログイン          | `/login`             | メール＋パスワードログイン画面          |
| 犬プロフィール詳細     | `/dog/[id]`          | 犬の基本情報、記録履歴へのリンク         |
| OTAYORIタイムライン | `/dog/[id]/timeline` | 犬ごとの投稿一覧（ごはん・うんち・きもち）    |
| OTAYORI作成     | `/otayori/new`       | 投稿フォーム（写真・感情・食事）         |
| コミュニティ        | `/community`         | 他ユーザーのOTAYORI投稿一覧＋リアクション |
| お知らせ一覧        | `/notifications`     | サービス・家族・病院からのお知らせ        |
| プロフィール        | `/profile`           | 飼主情報・バッジ・SNSリンクなど        |
| 設定・管理         | `/settings`          | 通知設定、家族／獣医の招待と管理         |

🧩 コンポーネント構成（Components）
| コンポーネント名            | 用途              |
| ------------------- | --------------- |
| `Button.tsx`        | プライマリ／セカンダリボタン  |
| `ToggleSwitch.tsx`  | 公開設定、通知ON/OFFなど |
| `TextInput.tsx`     | 単一行入力           |
| `TextArea.tsx`      | メモやコメント入力       |
| `ImageUploader.tsx` | 投稿画像アップロード      |

レイアウト・ナビゲーション
| コンポーネント名          | 用途                |
| ----------------- | ----------------- |
| `Navbar.tsx`      | ログイン状態表示、ナビゲーション  |
| `FooterNav.tsx`   | スマホ向けボトムナビゲーションバー |
| `PageWrapper.tsx` | ページ全体のレイアウト用ラッパー  |


OTAYORI関連（記録）
| コンポーネント名                          | 用途                |
| --------------------------------- | ----------------- |
| `EntryForm.tsx`                   | ごはん・うんち・きもち投稿フォーム |
| `Card.tsx`（または `OTAYORICard.tsx`） | 投稿カード表示           |
| `Detail.tsx`                      | 投稿詳細表示（コメント付き）    |
| `WeeklySummaryCard.tsx`           | 週次傾向まとめ（AIアドバイス）  |
| `ReactionBar.tsx`                 | いいね・絵文字・コメント入力バー  |


犬プロフィール
| コンポーネント名          | 用途            |
| ----------------- | ------------- |
| `DogCard.tsx`     | 一覧表示用の犬カード    |
| `DogProfile.tsx`  | 詳細プロフィール情報表示  |
| `DogTimeline.tsx` | 投稿履歴のタイムライン   |
| `DogStats.tsx`    | サイズ・体重などの測定記録 |

ユーザ関連
| コンポーネント名          | 用途           |
| ----------------- | ------------ |
| `SignupForm.tsx`  | 新規登録フォーム     |
| `LoginForm.tsx`   | ログインフォーム     |
| `UserCard.tsx`    | ユーザー情報表示     |
| `InviteModal.tsx` | 家族／獣医の招待モーダル |
| `FamilyList.tsx`  | 関係者の一覧と管理    |

通知・設定
| コンポーネント名               | 用途                 |
| ---------------------- | ------------------ |
| `NotificationList.tsx` | 通知の一覧表示            |
| `NotificationItem.tsx` | 通知メッセージの個別表示       |
| `ReminderSettings.tsx` | 食事／排泄／感情の記録リマインド設定 |


検索・フィルタ
| コンポーネント名            | 用途           |
| ------------------- | ------------ |
| `SearchBar.tsx`     | 検索入力欄        |
| `SearchTabs.tsx`    | 「犬」「投稿」切替タブ  |
| `SearchResults.tsx` | 検索結果一覧       |
| `TagSelector.tsx`   | 食材・感情などのタグ選択 |

🛠️ 今後の拡張候補

BadgeDisplay.tsx：飼主バッジ／継続バッジの表示
ChatPanel.tsx：家族や獣医とのチャット形式UI
ShareToSNS.tsx：OTAYORI投稿のSNSカード生成と共有


<pre><code>
my-otayori-app/
├── app/                             # App Routerのルート（各ページ）
│   ├── layout.tsx                   # 共通レイアウト（Navbar含む）
│   ├── page.tsx                     # ホーム画面
│   ├── login/
│   │   └── page.tsx                 # ログインページ
│   ├── signup/
│   │   └── page.tsx                 # サインアップページ
│   ├── dog/
│   │   └── [id]/
│   │       ├── page.tsx             # 犬のプロフィール
│   │       └── timeline/page.tsx    # 犬のOTAYORIタイムライン
│   ├── otayori/
│   │   └── new/page.tsx             # OTAYORI投稿ページ
│   ├── community/
│   │   └── page.tsx                 # コミュニティタイムライン
│   ├── notifications/
│   │   └── page.tsx                 # お知らせ一覧
│   ├── settings/
│   │   └── page.tsx                 # 通知・共有設定
│   └── profile/
│       └── page.tsx                 # 自分のプロフィール
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── FooterNav.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── ToggleSwitch.tsx
│   │   ├── TextInput.tsx
│   │   ├── TextArea.tsx
│   │   ├── ImageUploader.tsx
│   │   └── TagSelector.tsx
│   ├── otayori/
│   │   ├── EntryForm.tsx
│   │   ├── Card.tsx
│   │   ├── Detail.tsx
│   │   ├── WeeklySummaryCard.tsx
│   │   ├── PoopAnimation.tsx              # 🎉 投稿後演出専用アニメーション
│   │   └── PoopImageGuard.tsx             # 🔐 パスワード入力後に画像を表示する保護表示UI
│   │   └── ReactionBar.tsx
│   ├── dog/
│   │   ├── DogCard.tsx
│   │   ├── DogProfile.tsx
│   │   ├── DogTimeline.tsx
│   │   └── DogStats.tsx
│   ├── user/
│   │   ├── UserCard.tsx
│   │   ├── InviteModal.tsx
│   │   ├── FamilyList.tsx
│   │   └── BadgeDisplay.tsx
│   ├── notification/
│   │   ├── NotificationList.tsx
│   │   └── NotificationItem.tsx
│   └── search/
│       ├── SearchBar.tsx
│       ├── SearchTabs.tsx
│       └── SearchResults.tsx
│
├── public/
│   ├── images/                      # 静的画像（犬アイコンなど）
│   │   ├── logo.png
│   │   └── default-avatar.png
│
├── styles/
│   ├── globals.css                  # 全体スタイル
│   ├── tailwind.config.ts          # Tailwind設定
│   └── variables.css                # カスタムプロパティなど（任意）
│
├── utils/
│   ├── supabase/client.ts           # Supabaseクライアント初期化
│   ├── auth.ts                      # ログイン／セッション管理
│   └── formatter.ts                 # 日時・感情などのフォーマッター
│
├── middleware.ts                    # Supabaseのセッション保護用（任意）
├── .env.local                       # SupabaseのURL／Keyなどの環境変数
├── package.json
└── tsconfig.json
</code></pre>


components/ 配下を 機能ドメイン（auth, dog, otayori, user）ごとに分類
App Router 構成に対応した app/ 配下にページを分割
public/images に静的画像を配置し、プロフィールやカードに利用
utils/ で Supabase、フォーマッタ、認証状態などの共通ロジックを集中管理

**ライブラリ
- [アイコン用　lucide](https://lucide.dev/icons/)
- supabase
- classnames
- date-fns

https://motion.dev