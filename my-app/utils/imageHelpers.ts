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
 * 画像をリサイズする
 * @param file - 元の画像ファイル
 * @param maxWidth - 最大幅（デフォルト: 1024）
 * @param maxHeight - 最大高さ（デフォルト: 1024）
 * @param quality - JPEG品質（デフォルト: 0.8）
 * @returns リサイズ後のBlob
 */
export const resizeImage = async (
  file: File, 
  maxWidth: number = 1024, 
  maxHeight: number = 1024, 
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve(file)
      return
    }

    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      try {
        // アスペクト比を保持してリサイズ
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Canvasサイズを設定
        canvas.width = width
        canvas.height = height

        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height)

        // JPEGとしてBlobに変換
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          'image/jpeg',
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * 画像ファイルを適切な形式に変換してアップロード用に準備
 * @param file - 元のファイル
 * @returns 変換後のファイル
 */
export const prepareImageForUpload = async (file: File): Promise<File> => {
  try {
    let processedBlob: Blob = file

    // HEICファイルの場合は変換（クライアントサイドでのみ）
    if (isHeicFile(file) && typeof window !== 'undefined') {
      processedBlob = await convertHeicToJpeg(file)
    }

    // 画像をリサイズ（クライアントサイドでのみ）
    if (typeof window !== 'undefined') {
      processedBlob = await resizeImage(processedBlob as File)
    }

    // BlobをFileオブジェクトに変換
    const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
    const processedFile = new File([processedBlob], fileName, { 
      type: 'image/jpeg' 
    })

    console.log(`画像処理完了: ${file.size} bytes → ${processedFile.size} bytes`)
    
    return processedFile
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

/**
 * 画像をリサイズしてBase64形式で返す（AI用）
 * @param imageSrc - 画像のソース（URL、Base64、Blob）
 * @param maxWidth - 最大幅（デフォルト: 800px）
 * @param maxHeight - 最大高さ（デフォルト: 800px）
 * @param quality - 品質（0.1-1.0、デフォルト: 0.8）
 * @returns Promise<string> - リサイズされた画像のBase64文字列
 */
export const resizeImageForAI = async (
  imageSrc: string,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Canvas context could not be created'))
          return
        }

        // アスペクト比を保ちながらリサイズ
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height)

        // JPEG形式でBase64に変換
        const resizedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(resizedBase64)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = imageSrc
  })
}

/**
 * Base64画像のサイズをチェックし、必要に応じてリサイズする
 * @param imageBase64 - Base64形式の画像
 * @param maxSizeMB - 最大サイズ（MB、デフォルト: 1MB）
 * @returns Promise<string> - 最適化された画像のBase64文字列
 */
export const optimizeImageForAI = async (
  imageBase64: string,
  maxSizeMB: number = 1
): Promise<string> => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  
  // Base64文字列のサイズをチェック
  const base64Size = Math.ceil((imageBase64.length * 3) / 4)
  
  if (base64Size <= maxSizeBytes) {
    return imageBase64
  }

  // サイズが大きい場合はリサイズ
  console.log(`画像サイズが大きすぎます（${(base64Size / 1024 / 1024).toFixed(2)}MB）。リサイズ中...`)
  
  let quality = 0.8
  let resizedImage = imageBase64
  
  // 品質を下げながらリサイズを試行
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      resizedImage = await resizeImageForAI(imageBase64, 800, 800, quality)
      const resizedSize = Math.ceil((resizedImage.length * 3) / 4)
      
      if (resizedSize <= maxSizeBytes) {
        console.log(`リサイズ完了: ${(resizedSize / 1024 / 1024).toFixed(2)}MB`)
        return resizedImage
      }
      
      quality -= 0.2 // 品質を下げて再試行
    } catch (error) {
      console.error('リサイズエラー:', error)
      break
    }
  }
  
  // 最後の手段としてさらに小さくリサイズ
  try {
    const finalResized = await resizeImageForAI(imageBase64, 600, 600, 0.6)
    console.log('最終リサイズ完了')
    return finalResized
  } catch (error) {
    console.error('最終リサイズエラー:', error)
    throw new Error('画像の最適化に失敗しました')
  }
} 