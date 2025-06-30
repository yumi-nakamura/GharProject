-- コミュニティページ用のotayoriテーブルRLSポリシー

-- 1. 既存のポリシーを削除（もし存在する場合）
DROP POLICY IF EXISTS "Users can view all otayori for community" ON otayori;
DROP POLICY IF EXISTS "Users can view their own otayori" ON otayori;
DROP POLICY IF EXISTS "Users can insert their own otayori" ON otayori;
DROP POLICY IF EXISTS "Users can update their own otayori" ON otayori;
DROP POLICY IF EXISTS "Users can delete their own otayori" ON otayori;

-- 2. 新しいポリシーを作成

-- SELECTポリシー: コミュニティページで全てのotayoriを閲覧可能（poopタイプを除く）
CREATE POLICY "Users can view all otayori for community" ON otayori
FOR SELECT USING (
  type != 'poop'
);

-- SELECTポリシー: ユーザーは自分のotayoriを閲覧できる（poopタイプも含む）
CREATE POLICY "Users can view their own otayori" ON otayori
FOR SELECT USING (
  auth.uid() = user_id
);

-- INSERTポリシー: ユーザーは自分のotayoriを挿入できる
CREATE POLICY "Users can insert their own otayori" ON otayori
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- UPDATEポリシー: ユーザーは自分のotayoriを更新できる
CREATE POLICY "Users can update their own otayori" ON otayori
FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

-- DELETEポリシー: ユーザーは自分のotayoriを削除できる
CREATE POLICY "Users can delete their own otayori" ON otayori
FOR DELETE USING (
  auth.uid() = user_id
);

-- 3. RLSが有効になっていることを確認
ALTER TABLE otayori ENABLE ROW LEVEL SECURITY;

-- 4. 確認用クエリ
-- SELECT * FROM otayori WHERE type != 'poop' ORDER BY created_at DESC LIMIT 10; 