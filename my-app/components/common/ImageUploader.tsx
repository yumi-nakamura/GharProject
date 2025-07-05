// components/common/ImageUploader.tsx
import { useRef, useState } from "react"
import { Camera, X, Loader2 } from "lucide-react"
import { prepareImageForUpload, createImagePreview, isHeicFile } from "@/utils/imageHelpers"

interface ImageUploaderProps {
  onSelect: (file: File) => void
  onPreview?: (url: string) => void
  className?: string
}

export function ImageUploader({ onSelect, onPreview, className = "" }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    try {
      setIsConverting(true)
      
      // クライアントサイドでのみ画像処理を実行
      if (typeof window !== 'undefined') {
        // HEICファイルの場合は変換
        const preparedFile = await prepareImageForUpload(file)
        
        // プレビュー生成
        const preview = await createImagePreview(file)
        setPreviewUrl(preview)
        
        // 親コンポーネントに通知
        onSelect(preparedFile)
        onPreview?.(preview)
        
        // HEIC変換の場合はユーザーに通知
        if (isHeicFile(file)) {
          console.log('HEIC画像をJPEGに変換しました')
        }
      } else {
        // サーバーサイドの場合は元のファイルを使用
        onSelect(file)
      }
    } catch (error) {
      console.error('画像処理エラー:', error)
      // エラーの場合は元のファイルを使用
      onSelect(file)
    } finally {
      setIsConverting(false)
    }
  }

  const clearPreview = () => {
    if (previewUrl && typeof window !== 'undefined') {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* プレビュー表示 */}
      {previewUrl && (
        <div className="relative">
          <img
            src={previewUrl}
            alt="プレビュー"
            className="w-full h-32 object-cover rounded-lg border"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* アップロードエリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isConverting 
            ? 'border-gray-300 bg-gray-50' 
            : 'border-orange-300 bg-orange-50 hover:border-orange-400 hover:bg-orange-100'
        }`}
        onClick={() => !isConverting && fileInputRef.current?.click()}
      >
        {isConverting ? (
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Loader2 size={20} className="animate-spin" />
            <span>画像を変換中...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <Camera size={24} className="mx-auto text-orange-500" />
            <div className="text-sm font-medium text-gray-700">
              写真をアップロード
            </div>
            <div className="text-xs text-gray-500">
              HEIC形式も対応しています
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          capture="environment"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelect(e.target.files[0])
            }
          }}
          className="hidden"
        />
      </div>
    </div>
  )
}
