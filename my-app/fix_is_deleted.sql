-- is_deletedカラムを適切に設定するSQL

-- 1. is_deletedカラムが存在しない場合は追加
ALTER TABLE dogs 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. 既存のデータでis_deletedがNULLの場合はFALSEに設定
UPDATE dogs 
SET is_deleted = FALSE 
WHERE is_deleted IS NULL;

-- 3. 確認用クエリ
SELECT id, name, is_deleted, deleted_at FROM dogs LIMIT 10;

-- 4. 削除記録テーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS dog_deletion_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('mistake', 'transfer', 'rainbow_bridge', 'other')),
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  keep_records BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. インデックスを作成
CREATE INDEX IF NOT EXISTS idx_dog_deletion_records_dog_id ON dog_deletion_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_deletion_records_user_id ON dog_deletion_records(user_id);
CREATE INDEX IF NOT EXISTS idx_dog_deletion_records_deleted_at ON dog_deletion_records(deleted_at);

-- 6. RLSポリシーを設定
ALTER TABLE dog_deletion_records ENABLE ROW LEVEL SECURITY;

-- 削除記録の閲覧ポリシー
DROP POLICY IF EXISTS "Users can view their own deletion records" ON dog_deletion_records;
CREATE POLICY "Users can view their own deletion records" ON dog_deletion_records
FOR SELECT USING (auth.uid() = user_id);

-- 削除記録の挿入ポリシー
DROP POLICY IF EXISTS "Users can insert their own deletion records" ON dog_deletion_records;
CREATE POLICY "Users can insert their own deletion records" ON dog_deletion_records
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 削除記録の更新ポリシー
DROP POLICY IF EXISTS "Users can update their own deletion records" ON dog_deletion_records;
CREATE POLICY "Users can update their own deletion records" ON dog_deletion_records
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 削除記録の削除ポリシー
DROP POLICY IF EXISTS "Users can delete their own deletion records" ON dog_deletion_records;
CREATE POLICY "Users can delete their own deletion records" ON dog_deletion_records
FOR DELETE USING (auth.uid() = user_id); 