-- otayoriテーブルにプープバッグ関連のカラムを追加
ALTER TABLE otayori 
ADD COLUMN IF NOT EXISTS poop_guard_password TEXT DEFAULT '1234',
ADD COLUMN IF NOT EXISTS is_poop_guarded BOOLEAN DEFAULT false;

-- 既存のうんち投稿にプープバッグを適用
UPDATE otayori 
SET is_poop_guarded = true 
WHERE type = 'poop' AND is_poop_guarded IS NULL;

-- コメントを追加
COMMENT ON COLUMN otayori.poop_guard_password IS 'プープバッグのパスワード（西暦のお誕生日）';
COMMENT ON COLUMN otayori.is_poop_guarded IS 'プープバッグ保護フラグ'; 