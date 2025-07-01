# OTAYORI アプリケーション ER図

## 概要
OTAYORIアプリケーションのデータベース構造を表すER図です。

## ER図

```mermaid
erDiagram
    %% 認証・ユーザー管理
    auth_users {
        UUID id PK
        TEXT email
        TEXT encrypted_password
        TIMESTAMP email_confirmed_at
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    user_profiles {
        UUID id PK
        UUID user_id FK
        TEXT name
        TEXT email
        TEXT avatar_url
        TEXT comment
        TEXT rank
        TEXT[] badges
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    %% 犬の管理
    dogs {
        UUID id PK
        TEXT name
        TEXT breed
        DATE birthday
        TEXT gender
        NUMERIC weight
        TEXT color
        TEXT size
        TEXT character
        TEXT charm_point
        TEXT[] vaccine_info
        TEXT caution
        TEXT[] medical_history
        TEXT[] likes
        TEXT[] dislikes
        TEXT image_url
        UUID owner_id FK
        BOOLEAN is_deleted
        TIMESTAMP deleted_at
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    dog_user_relations {
        UUID id PK
        UUID dog_id FK
        UUID user_id FK
        TIMESTAMP created_at
    }

    dog_deletion_records {
        UUID id PK
        UUID dog_id FK
        UUID user_id FK
        TEXT reason
        TIMESTAMP deleted_at
        BOOLEAN keep_records
        BOOLEAN is_visible
        TIMESTAMP created_at
    }

    %% おたより（投稿）管理
    otayori {
        UUID id PK
        UUID dog_id FK
        UUID user_id FK
        TEXT type
        TEXT content
        TEXT photo_url
        TIMESTAMP datetime
        TIMESTAMP custom_datetime
        TEXT[] tags
        TEXT poop_guard_password
        BOOLEAN is_poop_guarded
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    %% いいね機能
    likes {
        UUID id PK
        UUID user_id FK
        UUID otayori_id FK
        TIMESTAMP created_at
    }

    %% 設定・通知管理
    reminders {
        UUID id PK
        UUID user_id FK
        BOOLEAN meal
        BOOLEAN poop
        BOOLEAN mood
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    %% ストレージ設定
    storage_buckets {
        TEXT name PK
        TEXT public
        NUMERIC file_size_limit
        TEXT[] allowed_mime_types
    }

    %% リレーションシップ
    auth_users ||--|| user_profiles : "1対1"
    auth_users ||--o{ dogs : "1対多（所有者）"
    auth_users ||--o{ dog_user_relations : "多対多"
    dogs ||--o{ dog_user_relations : "多対多"
    auth_users ||--o{ dog_deletion_records : "1対多"
    dogs ||--o{ dog_deletion_records : "1対多"
    auth_users ||--o{ otayori : "1対多（投稿者）"
    dogs ||--o{ otayori : "1対多"
    auth_users ||--o{ likes : "1対多"
    otayori ||--o{ likes : "1対多"
    auth_users ||--|| reminders : "1対1"

    %% 制約・チェック
    %% dogs.type: meal/poop/emotion
    %% dog_deletion_records.reason: mistake/transfer/rainbow_bridge/other
    %% otayori.type: meal/poop/emotion
```

## テーブル説明

### 認証・ユーザー管理
- **auth_users**: Supabase標準の認証テーブル
- **user_profiles**: ユーザーの詳細プロフィール情報

### 犬の管理
- **dogs**: 犬の基本情報と健康データ
- **dog_user_relations**: 犬とユーザーの多対多関係
- **dog_deletion_records**: 犬の削除記録（ソフトデリート対応）

### おたより（投稿）管理
- **otayori**: ごはん・うんち・きもちの投稿データ
- **likes**: 投稿へのいいね機能

### 設定・通知管理
- **reminders**: リマインダー設定

### ストレージ設定
- **storage_buckets**: 画像ファイルの保存設定

## 主要な制約

### 外部キー制約
- すべてのテーブルで適切な外部キー制約が設定されています
- CASCADE削除により、親レコード削除時に子レコードも自動削除されます

### チェック制約
- `otayori.type`: 'meal', 'poop', 'emotion'のいずれか
- `dog_deletion_records.reason`: 'mistake', 'transfer', 'rainbow_bridge', 'other'のいずれか

### ユニーク制約
- `user_profiles.user_id`: ユーザー1人につき1つのプロフィール
- `likes(user_id, otayori_id)`: 同じユーザーが同じ投稿に複数回いいねできない

## セキュリティ

### Row Level Security (RLS)
すべてのテーブルでRLSが有効化されており、ユーザーは自分のデータのみアクセス可能です。

### インデックス
パフォーマンス向上のため、主要なクエリパターンに対応したインデックスが設定されています。

---

**作成日:** 2025年5月  
**バージョン:** 1.0 