-- ai_analysisテーブルにユニーク制約を追加（同じotayori_idの重複を防ぐ）
-- PostgreSQLでは部分インデックスを使用してユニーク制約を作成

-- 既存の重複データを確認
SELECT otayori_id, COUNT(*) 
FROM ai_analysis 
WHERE otayori_id IS NOT NULL 
GROUP BY otayori_id 
HAVING COUNT(*) > 1;

-- 重複データがある場合は、最新のものを残して削除（created_atで最新を判定）
DELETE FROM ai_analysis 
WHERE id NOT IN (
  SELECT DISTINCT ON (otayori_id) id
  FROM ai_analysis 
  WHERE otayori_id IS NOT NULL 
  ORDER BY otayori_id, created_at DESC
);

-- ユニークインデックスを作成（部分インデックス）
CREATE UNIQUE INDEX unique_otayori_analysis 
ON ai_analysis (otayori_id) 
WHERE otayori_id IS NOT NULL;
