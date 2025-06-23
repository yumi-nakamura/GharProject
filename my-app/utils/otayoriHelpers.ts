// utils/otayoriHelpers.ts

/**
 * Supabase Storage上の画像URLを生成する
 * @param path - ストレージ内のファイルパス
 * @returns 完全な画像URL
 */
export function getOtayoriImageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  
  // 既に完全なURLの場合はそのまま返す
  if (path.startsWith('http')) {
    return path
  }
  
  // 新しいパス構造（otayori/{dog_id}/{user_id}_{timestamp}.{ext}）に対応
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${baseUrl}/storage/v1/object/public/dog-images/${path}`
}

/**
 * 犬の誕生日から簡易パスワードを生成（YYYYMMDD形式）
 * @param birthday - 誕生日（例：2024-01-03）
 * @returns パスワード文字列（例：20240103）
 */
export function generatePasswordFromBirthday(birthday: string): string {
  if (!birthday) return '1234'
  return birthday.replace(/-/g, "")
}

/**
 * 犬の名前と種類から表示名を生成（例：モコ（トイプードル））
 */
export function formatDogDisplayName(name: string, breed?: string): string {
  return breed ? `${name}（${breed}）` : name
}
