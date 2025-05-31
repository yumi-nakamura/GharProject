// utils/otayoriHelpers.ts

/**
 * Supabase Storage上の画像URLを生成する
 * @param path - ストレージ内のファイルパス
 * @returns 完全な画像URL
 */
export function getOtayoriImageUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${baseUrl}/storage/v1/object/public/dog-images/${path}`
}

/**
 * 犬の誕生日から簡易パスワードを生成（YYYYMMDD形式）
 * @param birthday - 誕生日（例：2024-01-03）
 * @returns パスワード文字列（例：20240103）
 */
export function generatePasswordFromBirthday(birthday: string): string {
  return birthday.replace(/-/g, "")
}

/**
 * 犬の名前と種類から表示名を生成（例：モコ（トイプードル））
 */
export function formatDogDisplayName(name: string, breed?: string): string {
  return breed ? `${name}（${breed}）` : name
}
