-- otayoriテーブルにタグと日時指定機能を追加
ALTER TABLE otayori 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS custom_datetime TIMESTAMP WITH TIME ZONE;

-- コメントを追加
COMMENT ON COLUMN otayori.tags IS '投稿のタグ（配列形式）';
COMMENT ON COLUMN otayori.custom_datetime IS 'ユーザーが指定した投稿日時（NULLの場合は投稿時の日時）';

-- 既存の投稿のcustom_datetimeをdatetimeと同じ値に設定
UPDATE otayori 
SET custom_datetime = datetime 
WHERE custom_datetime IS NULL; 