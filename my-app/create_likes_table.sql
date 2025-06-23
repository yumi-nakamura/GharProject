-- いいね機能のためのテーブル作成
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  otayori_id UUID NOT NULL REFERENCES otayori(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, otayori_id)
);

-- RLSポリシーの設定
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがいいねを閲覧可能
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

-- 認証済みユーザーのみいいねを追加可能
CREATE POLICY "Authenticated users can insert likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分のいいねのみ削除可能
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_likes_otayori_id ON likes(otayori_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id); 