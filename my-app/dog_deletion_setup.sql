-- 犬の削除機能に必要なテーブルとカラムを作成するSQL

-- 1. dogsテーブルに削除フラグと削除日時カラムを追加
ALTER TABLE dogs 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. 削除記録テーブルを作成
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

-- 3. インデックスを作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_dog_deletion_records_dog_id ON dog_deletion_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_deletion_records_user_id ON dog_deletion_records(user_id);
CREATE INDEX IF NOT EXISTS idx_dog_deletion_records_deleted_at ON dog_deletion_records(deleted_at);

-- 4. RLSポリシーを設定
ALTER TABLE dog_deletion_records ENABLE ROW LEVEL SECURITY;

-- 削除記録の閲覧ポリシー
CREATE POLICY "Users can view their own deletion records" ON dog_deletion_records
FOR SELECT USING (auth.uid() = user_id);

-- 削除記録の挿入ポリシー
CREATE POLICY "Users can insert their own deletion records" ON dog_deletion_records
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 削除記録の更新ポリシー
CREATE POLICY "Users can update their own deletion records" ON dog_deletion_records
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 削除記録の削除ポリシー
CREATE POLICY "Users can delete their own deletion records" ON dog_deletion_records
FOR DELETE USING (auth.uid() = user_id);

-- 5. 既存のdogsテーブルにRLSポリシーを追加（削除フラグを考慮）
DROP POLICY IF EXISTS "Users can view their own dogs" ON dogs;
CREATE POLICY "Users can view their own dogs" ON dogs
FOR SELECT USING (
  (auth.uid() = owner_id OR 
   EXISTS (
     SELECT 1 FROM dog_user_relations 
     WHERE dog_user_relations.dog_id = dogs.id 
     AND dog_user_relations.user_id = auth.uid()
   )) AND 
  (is_deleted IS NULL OR is_deleted = FALSE)
);

-- 6. 確認用クエリ
-- SELECT * FROM dog_deletion_records LIMIT 5;
-- SELECT * FROM dogs WHERE is_deleted = TRUE LIMIT 5; 