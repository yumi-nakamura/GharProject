/**
 * HEIC画像をJPEGに変換する
 * @param file - 変換対象のファイル
 * @returns 変換後のBlob
 */
export const convertHeicToJpeg = async (file: File): Promise<Blob> => {
  try {
    // HEICファイルかどうかをチェック
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
      console.log('HEIC画像を変換中...')
      
      // クライアントサイドでのみheic2anyを動的インポート
      if (typeof window !== 'undefined') {
        const heic2any = (await import('heic2any')).default
        
        // HEICをJPEGに変換
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        })
        
        console.log('HEIC変換完了')
        return convertedBlob as Blob
      }
    }
    
    // HEICでない場合またはサーバーサイドの場合はそのまま返す
    return file
  } catch (error) {
    console.error('HEIC変換エラー:', error)
    // 変換に失敗した場合は元のファイルを返す
    return file
  }
}

/**
 * ファイルがHEIC形式かどうかを判定
 * @param file - チェック対象のファイル
 * @returns HEIC形式の場合true
 */
export const isHeicFile = (file: File): boolean => {
  return file.type === 'image/heic' || 
         file.type === 'image/heif' || 
         file.name.toLowerCase().endsWith('.heic') ||
         file.name.toLowerCase().endsWith('.heif')
}

/**
 * 画像ファイルを適切な形式に変換してアップロード用に準備
 * @param file - 元のファイル
 * @returns 変換後のファイル
 */
export const prepareImageForUpload = async (file: File): Promise<File> => {
  try {
    // HEICファイルの場合は変換（クライアントサイドでのみ）
    if (isHeicFile(file) && typeof window !== 'undefined') {
      const convertedBlob = await convertHeicToJpeg(file)
      
      // BlobをFileオブジェクトに変換
      const convertedFile = new File([convertedBlob], 
        file.name.replace(/\.(heic|heif)$/i, '.jpg'), 
        { type: 'image/jpeg' }
      )
      
      return convertedFile
    }
    
    // その他の画像形式はそのまま返す
    return file
  } catch (error) {
    console.error('画像準備エラー:', error)
    return file
  }
}

/**
 * 画像のプレビュー用URLを生成
 * @param file - 画像ファイル
 * @returns プレビュー用URL
 */
export const createImagePreview = async (file: File): Promise<string> => {
  try {
    // クライアントサイドでのみURL生成
    if (typeof window === 'undefined') {
      return ''
    }
    
    // HEICファイルの場合は変換してからプレビュー生成
    if (isHeicFile(file)) {
      const convertedBlob = await convertHeicToJpeg(file)
      return URL.createObjectURL(convertedBlob)
    }
    
    // その他の形式は直接URL生成
    return URL.createObjectURL(file)
  } catch (error) {
    console.error('プレビュー生成エラー:', error)
    // エラーの場合は元のファイルでプレビュー生成
    return typeof window !== 'undefined' ? URL.createObjectURL(file) : ''
  }
} 