# GharProject
がるきゅんアプリ

--
| パス              | ページ内容                                   |
|-------------------|----------------------------------------------|
| `/`               | ホーム画面（ダッシュボード）                 |
| `/login`          | ログイン画面                                 |
| `/signup`         | サインアップ画面                             |
| `/profile`        | 愛犬プロフィール登録・編集                   |
| `/record/meal`    | 食事記録ページ                               |
| `/record/poop`    | 排泄記録ページ                               |
| `/record/emotion` | 感情（かわいい瞬間）記録ページ              |
| `/moments`        | 感情投稿一覧（モーメンツ）                   |
| `/settings`       | 通知・プライバシー設定ページ                 |
| `/about`          | アプリ概要・運営ポリシーなど                 |
| `/404`            | カスタム404ページ（迷子犬風にしても◎）       |

<pre><code>
src/
├── app/
│   ├── page.tsx               // ホーム画面
│   ├── login/page.tsx         // ログイン画面
│   ├── signup/page.tsx        // サインアップ画面
│   ├── profile/page.tsx       // 愛犬プロフィール
│   ├── record/
│   │   ├── meal/page.tsx      // 食事記録
│   │   ├── poop/page.tsx      // 排泄記録
│   │   └── emotion/page.tsx   // 感情記録
│   ├── moments/page.tsx       // モーメンツ一覧
│   ├── settings/page.tsx      // 通知・設定
│   └── about/page.tsx         // アプリ概要
│
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── DogAvatar.tsx
│   ├── EmotionStamp.tsx
│   ├── RecordCard.tsx
│   ├── MealForm.tsx
│   ├── PoopForm.tsx
│   ├── EmotionForm.tsx
│   ├── MomentCard.tsx
│   ├── AdviceCard.tsx
│   └── Shared/Button.tsx
│
├── styles/
│   ├── globals.css
│   └── theme.css
│
├── lib/                       // Supabase / Utils / API連携
│   ├── supabaseClient.ts
│   └── emotionUtils.ts
│
└── types/
    └── index.ts               // 型定義（プロフィール・感情・記録など）

</code></pre>
