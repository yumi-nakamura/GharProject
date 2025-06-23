-- user_profilesテーブルのスキーマ修正スクリプト
-- このスクリプトをSupabaseダッシュボードのSQL Editorで実行してください

-- 1. 既存のuser_profilesテーブルを削除（データがある場合は注意）
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- 2. user_profilesテーブルを正しいスキーマで作成
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  "avatarUrl" TEXT, -- カラム名をダブルクォートで囲む
  comment TEXT,
  rank TEXT,
  badges TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. 既存のテーブルがある場合は、avatarUrlカラムを追加
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'avatarUrl'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN "avatarUrl" TEXT;
  END IF;
END $$;

-- 4. RLSポリシーを設定
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

-- 新しいポリシーを作成
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
FOR DELETE USING (auth.uid() = user_id);

-- 5. updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. テーブル構造を確認
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 7. 成功メッセージ
SELECT 'user_profilesテーブルのスキーマ修正が完了しました！' as message; 