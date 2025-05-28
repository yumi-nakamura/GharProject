// components/common/ImageUploader.tsx
import { useRef } from "react"

export function ImageUploader({ onSelect }: { onSelect: (file: File) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className="border border-dashed rounded p-4 text-center text-gray-500 cursor-pointer bg-gray-100"
      onClick={() => fileInputRef.current?.click()}
    >
      写真をアップロード
      <input
        type="file"
        hidden
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onSelect(e.target.files[0])  // ✅ ここで渡していること
          }
        }}
      />
    </div>
  )
}
