-- Supabase Storage バケット作成スクリプト
-- このスクリプトをSupabaseダッシュボードのSQL Editorで実行してください

-- 1. avatarsバケットを作成
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. 既存のストレージポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- 3. 認証されたユーザーが自分のアバターをアップロードできるポリシー
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. 認証されたユーザーが自分のアバターを更新できるポリシー
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. 認証されたユーザーが自分のアバターを削除できるポリシー
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. 誰でもアバターを閲覧できるポリシー（publicバケットのため）
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 7. user_profilesテーブルを削除して再作成（データがある場合は注意）
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- 8. user_profilesテーブルを正しいスキーマで作成
CREATE TABLE public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT, -- スネークケースに変更
  comment TEXT,
  rank TEXT,
  badges TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 9. user_profilesテーブルのRLSポリシー
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 新しいポリシーを作成
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
FOR DELETE USING (auth.uid() = user_id);

-- 10. updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 11. テーブル構造を確認
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 12. 成功メッセージ
SELECT 'ストレージバケットとuser_profilesテーブルの作成が完了しました！' as message; 