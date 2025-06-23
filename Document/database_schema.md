# OTAYORI アプリケーション データベーススキーマ定義めも

## 概要
OTAYORIは、犬の健康管理と記録を目的としたWebアプリケーションです！

## データベース構成

### 1. 認証・ユーザー管理

#### 1.1 auth.users (Supabase標準テーブル)
| カラム名 | データ型 | NULL | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | ユーザーID（主キー） |
| email | TEXT | NULL | - | メールアドレス |
| encrypted_password | TEXT | NULL | - | 暗号化されたパスワード |
| email_confirmed_at | TIMESTAMP WITH TIME ZONE | NULL | - | メール確認日時 |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 更新日時 |

#### 1.2 user_profiles
| カラム名 | データ型 | NULL | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | プロフィールID（主キー） |
| user_id | UUID | NOT NULL | - | ユーザーID（外部キー） |
| name | TEXT | NOT NULL | - | ユーザー名 |
| email | TEXT | NULL | - | メールアドレス |
| avatar_url | TEXT | NULL | - | アバター画像URL |
| comment | TEXT | NULL | - | 自己紹介コメント |
| rank | TEXT | NULL | - | ユーザーランク |
| badges | TEXT[] | NULL | - | 獲得バッジ配列 |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 更新日時 |

**制約:**
- UNIQUE(user_id)
- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

**RLSポリシー:**
- Users can view own profile
- Users can insert own profile
- Users can update own profile
- Users can delete own profile

### 2. 犬の管理

#### 2.1 dogs
| カラム名 | データ型 | NULL | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | 犬ID（主キー） |
| name | TEXT | NOT NULL | - | 犬の名前 |
| breed | TEXT | NULL | - | 犬種 |
| birthday | DATE | NULL | - | 誕生日 |
| gender | TEXT | NULL | - | 性別 |
| weight | NUMERIC | NULL | - | 体重（kg） |
| color | TEXT | NULL | - | 毛色 |
| size | TEXT | NULL | - | サイズ |
| character | TEXT | NULL | - | 性格 |
| charm_point | TEXT | NULL | - | チャームポイント |
| vaccine_info | TEXT[] | NULL | - | ワクチン情報配列 |
| caution | TEXT | NULL | - | 注意事項 |
| medical_history | TEXT[] | NULL | - | 病歴配列 |
| likes | TEXT[] | NULL | - | 好きなもの配列 |
| dislikes | TEXT[] | NULL | - | 嫌いなもの配列 |
| image_url | TEXT | NULL | - | 画像URL |
| owner_id | UUID | NOT NULL | - | 所有者ID（外部キー） |
| is_deleted | BOOLEAN | NOT NULL | FALSE | 削除フラグ |
| deleted_at | TIMESTAMP WITH TIME ZONE | NULL | - | 削除日時 |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 更新日時 |

**制約:**
- FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE

**RLSポリシー:**
- Users can view their own dogs (削除フラグを考慮)

#### 2.2 dog_user_relations
| カラム名 | データ型 | NULL | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | 関係ID（主キー） |
| dog_id | UUID | NOT NULL | - | 犬ID（外部キー） |
| user_id | UUID | NOT NULL | - | ユーザーID（外部キー） |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 作成日時 |

**制約:**
- FOREIGN KEY (dog_id) REFERENCES dogs(id) ON DELETE CASCADE
- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

**RLSポリシー:**
- Users can insert their own dog relations
- Users can view their own dog relations
- Users can update their own dog relations
- Users can delete their own dog relations

#### 2.3 dog_deletion_records
| カラム名 | データ型 | NULL | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | 削除記録ID（主キー） |
| dog_id | UUID | NOT NULL | - | 犬ID（外部キー） |
| user_id | UUID | NOT NULL | - | 削除実行ユーザーID（外部キー） |
| reason | TEXT | NOT NULL | - | 削除理由（mistake/transfer/rainbow_bridge/other） |
| deleted_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 削除実行日時 |
| keep_records | BOOLEAN | NOT NULL | TRUE | 記録保持フラグ |
| is_visible | BOOLEAN | NOT NULL | TRUE | 表示フラグ |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 作成日時 |

**制約:**
- FOREIGN KEY (dog_id) REFERENCES dogs(id) ON DELETE CASCADE
- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
- CHECK (reason IN ('mistake', 'transfer', 'rainbow_bridge', 'other'))

**インデックス:**
- idx_dog_deletion_records_dog_id ON dog_deletion_records(dog_id)
- idx_dog_deletion_records_user_id ON dog_deletion_records(user_id)
- idx_dog_deletion_records_deleted_at ON dog_deletion_records(deleted_at)

**RLSポリシー:**
- Users can view their own deletion records
- Users can insert their own deletion records
- Users can update their own deletion records
- Users can delete their own deletion records

### 3. おたより（投稿）管理

#### 3.1 otayori
| カラム名 | データ型 | NULL | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | おたよりID（主キー） |
| dog_id | UUID | NOT NULL | - | 犬ID（外部キー） |
| user_id | UUID | NOT NULL | - | 投稿者ID（外部キー） |
| type | TEXT | NOT NULL | - | 投稿タイプ（meal/poop/emotion） |
| content | TEXT | NULL | - | 投稿内容 |
| photo_url | TEXT | NULL | - | 写真URL |
| datetime | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 投稿日時 |
| custom_datetime | TIMESTAMP WITH TIME ZONE | NULL | - | ユーザー指定投稿日時 |
| tags | TEXT[] | NULL | '{}' | タグ配列 |
| poop_guard_password | TEXT | NULL | '1234' | プープバッグパスワード |
| is_poop_guarded | BOOLEAN | NOT NULL | FALSE | プープバッグ保護フラグ |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 更新日時 |

**制約:**
- FOREIGN KEY (dog_id) REFERENCES dogs(id) ON DELETE CASCADE
- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
- CHECK (type IN ('meal', 'poop', 'emotion'))

**コメント:**
- tags: 投稿のタグ（配列形式）
- custom_datetime: ユーザーが指定した投稿日時（NULLの場合は投稿時の日時）
- poop_guard_password: プープバッグのパスワード（西暦のお誕生日）
- is_poop_guarded: プープバッグ保護フラグ

### 4. 設定・通知管理

#### 4.1 reminders
| カラム名 | データ型 | NULL | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | リマインダーID（主キー） |
| user_id | UUID | NOT NULL | - | ユーザーID（外部キー） |
| meal | BOOLEAN | NOT NULL | TRUE | 食事リマインダー |
| poop | BOOLEAN | NOT NULL | TRUE | 排泄リマインダー |
| mood | BOOLEAN | NOT NULL | FALSE | 感情記録リマインダー |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | NOW() | 更新日時 |

**制約:**
- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

### 5. ストレージ設定

#### 5.1 storage.buckets
| バケット名 | 用途 | 公開設定 | ファイルサイズ制限 | 許可MIMEタイプ |
|-----------|------|----------|-------------------|----------------|
| avatars | ユーザーアバター | 公開 | 5MB | image/jpeg, image/jpg, image/png, image/gif |
| dog-images | 犬の画像・おたより写真 | 公開 | 5MB | image/jpeg, image/jpg, image/png, image/gif, image/webp |

## タグシステム

### 投稿タイプ別タグ定義

#### ごはん（meal）
- 完食, 残食, おいしそう, 食欲旺盛, ゆっくり食べた, 早食い, おやつも食べた, ドッグフード, 手作りごはん

#### うんち（poop）
- 良い状態, やや軟便, 下痢, 便秘, 量が多い, 量が少ない, 色が良い, 色が悪い, 臭いが強い, 臭いが弱い

#### きもち（emotion）
- 元気, 嬉しい, 楽しい, リラックス, 興奮, 不安, 寂しい, 怒っている, 悲しい, 満足, 疲れている

## セキュリティ設定

### Row Level Security (RLS)
すべてのテーブルでRLSが有効化されており、ユーザーは自分のデータのみアクセス可能です。

### 認証フロー
1. Supabase Authを使用したメール・パスワード認証
2. JWTトークンによるセッション管理
3. RLSポリシーによるデータアクセス制御

## インデックス設定

### パフォーマンス最適化用インデックス
- dog_deletion_records: dog_id, user_id, deleted_at
- otayori: dog_id, user_id, datetime, type
- dogs: owner_id, is_deleted
- dog_user_relations: dog_id, user_id

## トリガー・関数

### 自動更新トリガー
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

適用テーブル:
- user_profiles
- dogs
- otayori
- reminders


## 今後の拡張予定

### 追加予定テーブル
1. notifications: 通知管理
2. comments: コメント機能
3. likes: いいね機能
4. health_records: 健康記録詳細
5. vet_relations: 獣医師との関係管理

### 分析機能
1. 投稿パターン分析
2. 健康状態トレンド分析
3. 行動パターン分析
4. タグ相関分析

---

**作成日:** 2025年06月
**バージョン:** 1.0