// components/common/ImageUploader.tsx
import { useRef, useState, useCallback } from "react"
import { Camera, X, Loader2, Crop, Check, RotateCcw } from "lucide-react"
import { prepareImageForUpload, createImagePreview, isHeicFile } from "@/utils/imageHelpers"
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

interface ImageUploaderProps {
  onSelect: (file: File) => void
  onPreview?: (url: string) => void
  className?: string
  onCropChange?: (isCropped: boolean) => void
}

export function ImageUploader({ onSelect, onPreview, onCropChange, className = "" }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    try {
      // ファイルサイズチェック（10MB以下）
      if (file.size > 10 * 1024 * 1024) {
        alert('ファイルサイズが大きすぎます。10MB以下の画像を選択してください。')
        return
      }

      setIsConverting(true)
      
      // クライアントサイドでのみ画像処理を実行
      if (typeof window !== 'undefined') {
        // HEICファイルの場合は変換
        const preparedFile = await prepareImageForUpload(file)
        
        // 処理後のファイルサイズチェック（5MB以下）
        if (preparedFile.size > 5 * 1024 * 1024) {
          alert('画像の処理に失敗しました。別の画像をお試しください。')
          setIsConverting(false)
          return
        }
        
        // 元画像のURLを作成（トリミング用）
        const originalUrl = URL.createObjectURL(file)
        setOriginalImageUrl(originalUrl)
        
        // プレビュー生成
        const preview = await createImagePreview(file)
        setPreviewUrl(preview)
        
        // 画像のアスペクト比を取得
        const aspectRatio = await getImageAspectRatio(file)
        setImageAspectRatio(aspectRatio)
        
        // 親コンポーネントに通知
        onSelect(preparedFile)
        onPreview?.(preview)
        
        // トリミング状態をリセット
        onCropChange?.(false)
        
        // HEIC変換の場合はユーザーに通知
        if (isHeicFile(file)) {
          // HEIC画像をJPEGに変換しました
        }
      } else {
        // サーバーサイドの場合は元のファイルを使用
        onSelect(file)
      }
    } catch (error) {
      console.error('画像処理エラー:', error)
      alert('画像の処理中にエラーが発生しました。別の画像をお試しください。')
    } finally {
      setIsConverting(false)
    }
  }

  // 画像のアスペクト比を取得する関数
  const getImageAspectRatio = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const aspectRatio = img.width / img.height
        resolve(aspectRatio)
      }
      img.onerror = () => {
        // エラーの場合はデフォルトのアスペクト比（4:3）を使用
        resolve(4 / 3)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const clearPreview = () => {
    if (previewUrl && typeof window !== 'undefined') {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setImageAspectRatio(null)
      setShowCropper(false)
      setOriginalImageUrl(null)
      onCropChange?.(false)
    }
    // ファイル入力の値もリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // トリミング開始
  const startCrop = () => {
    setShowCropper(true)
  }

  // トリミング完了
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // トリミング適用
  const applyCrop = async () => {
    if (!originalImageUrl || !croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(originalImageUrl, croppedAreaPixels, rotation)
      setPreviewUrl(croppedImage)
      setShowCropper(false)
      onCropChange?.(true)
      
      // プレビューのみ更新（投稿は行わない）
      onPreview?.(croppedImage)
    } catch (error) {
      console.error('トリミングエラー:', error)
    }
  }

  // トリミングをキャンセル
  const cancelCrop = () => {
    setShowCropper(false)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
  }

  // 画像をトリミングする関数
  const getCroppedImg = (imageSrc: string, pixelCrop: Area, rotation = 0): Promise<string> => {
    return new Promise((resolve) => {
      const image = new Image()
      image.src = imageSrc
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          resolve(imageSrc)
          return
        }

        const maxSize = Math.max(image.width, image.height)
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

        canvas.width = safeArea
        canvas.height = safeArea

        ctx.translate(safeArea / 2, safeArea / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-safeArea / 2, -safeArea / 2)

        ctx.drawImage(
          image,
          safeArea / 2 - image.width * 0.5,
          safeArea / 2 - image.height * 0.5
        )

        const data = ctx.getImageData(0, 0, safeArea, safeArea)

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.putImageData(
          data,
          0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
          0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
        )

        resolve(canvas.toDataURL('image/jpeg'))
      }
    })
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* トリミングモーダル */}
      {showCropper && originalImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">写真をトリミング</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setRotation(rotation - 90)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="左に回転"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={cancelCrop}
                  className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <Check size={16} />
                  適用
                </button>
              </div>
            </div>
            
            <div className="relative h-80 mb-4">
              <Cropper
                image={originalImageUrl}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={4/3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={true}
                objectFit="horizontal-cover"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">ズーム</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* プレビュー表示 */}
      {previewUrl && !showCropper && (
        <div className="relative">
          <div 
            className="w-full rounded-lg border overflow-hidden"
            style={{
              aspectRatio: imageAspectRatio ? `${imageAspectRatio}` : '4/3',
              maxHeight: '300px'
            }}
          >
            <img
              src={previewUrl}
              alt="プレビュー"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={startCrop}
              className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
              title="トリミング"
            >
              <Crop size={16} />
            </button>
            <button
              onClick={clearPreview}
              className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="削除"
            >
              <X size={16} />
            </button>
          </div>
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
              カメラロールまたはカメラから選択できます
            </div>
            <div className="text-xs text-gray-400">
              HEIC形式も対応しています
            </div>
            <div className="text-xs text-gray-400">
              最大10MBまで（自動で1024x1024以下にリサイズ）
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelect(e.target.files[0])
              // 同じファイルを再選択できるように値をリセット
              e.target.value = ''
            }
          }}
          className="hidden"
        />
      </div>
    </div>
  )
}
