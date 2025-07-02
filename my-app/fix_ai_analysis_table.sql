-- AI分析結果テーブル修正
-- otayori_idをオプショナルにし、user_idを直接保存

-- 既存のテーブルを削除（注意: データが失われます）
DROP TABLE IF EXISTS ai_analysis CASCADE;

-- 新しいテーブルを作成
CREATE TABLE IF NOT EXISTS ai_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  otayori_id UUID REFERENCES otayori(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('poop', 'meal', 'emotion')),
  
  -- 分析結果
  health_score INTEGER NOT NULL CHECK (health_score >= 1 AND health_score <= 10),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  observations TEXT[] NOT NULL DEFAULT '{}',
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  warnings TEXT[] NOT NULL DEFAULT '{}',
  encouragement TEXT,
  
  -- 詳細分析
  details JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id ON ai_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_otayori_id ON ai_analysis(otayori_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type ON ai_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_health_score ON ai_analysis(health_score);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at ON ai_analysis(created_at);

-- RLSポリシー設定
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の分析結果のみ閲覧可能
CREATE POLICY "Users can view their own analysis results" ON ai_analysis
  FOR SELECT USING (user_id = auth.uid());

-- 認証済みユーザーのみ分析結果を追加可能
CREATE POLICY "Authenticated users can insert analysis results" ON ai_analysis
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ユーザーは自分の分析結果のみ更新可能
CREATE POLICY "Users can update their own analysis results" ON ai_analysis
  FOR UPDATE USING (user_id = auth.uid());

-- ユーザーは自分の分析結果のみ削除可能
CREATE POLICY "Users can delete their own analysis results" ON ai_analysis
  FOR DELETE USING (user_id = auth.uid());

-- 自動更新トリガー
CREATE TRIGGER update_ai_analysis_updated_at
  BEFORE UPDATE ON ai_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 