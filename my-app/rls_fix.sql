-- dog_user_relationsテーブルのRLSポリシーを修正するSQL

-- 1. 既存のポリシーを削除（もし存在する場合）
DROP POLICY IF EXISTS "Users can insert their own dog relations" ON dog_user_relations;
DROP POLICY IF EXISTS "Users can view their own dog relations" ON dog_user_relations;
DROP POLICY IF EXISTS "Users can update their own dog relations" ON dog_user_relations;
DROP POLICY IF EXISTS "Users can delete their own dog relations" ON dog_user_relations;

-- 2. 新しいポリシーを作成

-- INSERTポリシー: ユーザーは自分の犬との関係を挿入できる
CREATE POLICY "Users can insert their own dog relations" ON dog_user_relations
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- SELECTポリシー: ユーザーは自分の犬との関係を閲覧できる
CREATE POLICY "Users can view their own dog relations" ON dog_user_relations
FOR SELECT USING (
  auth.uid() = user_id
);

-- UPDATEポリシー: ユーザーは自分の犬との関係を更新できる
CREATE POLICY "Users can update their own dog relations" ON dog_user_relations
FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

-- DELETEポリシー: ユーザーは自分の犬との関係を削除できる
CREATE POLICY "Users can delete their own dog relations" ON dog_user_relations
FOR DELETE USING (
  auth.uid() = user_id
);

-- 3. RLSが有効になっていることを確認
ALTER TABLE dog_user_relations ENABLE ROW LEVEL SECURITY;

-- 4. 確認用クエリ
-- SELECT * FROM dog_user_relations LIMIT 5;
