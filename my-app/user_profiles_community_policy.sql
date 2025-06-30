-- コミュニティページ用のuser_profilesテーブルRLSポリシー

-- 1. 既存のポリシーを削除（もし存在する場合）
DROP POLICY IF EXISTS "Users can view all user profiles for community" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- 2. 新しいポリシーを作成

-- SELECTポリシー: コミュニティページで全てのuser_profilesを閲覧可能
CREATE POLICY "Users can view all user profiles for community" ON user_profiles
FOR SELECT USING (true);

-- SELECTポリシー: ユーザーは自分のプロフィールを閲覧できる
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (
  auth.uid() = user_id
);

-- INSERTポリシー: ユーザーは自分のプロフィールを挿入できる
CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- UPDATEポリシー: ユーザーは自分のプロフィールを更新できる
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

-- DELETEポリシー: ユーザーは自分のプロフィールを削除できる
CREATE POLICY "Users can delete own profile" ON user_profiles
FOR DELETE USING (
  auth.uid() = user_id
);

-- 3. RLSが有効になっていることを確認
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. 確認用クエリ
-- SELECT * FROM user_profiles LIMIT 10; 