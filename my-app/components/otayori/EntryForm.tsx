// otayori/EntryForm.tsx
"use client"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/common/Button"
import { TextArea } from "@/components/common/TextArea"
import { ImageUploader } from "@/components/common/ImageUploader"
import PoopAnimation from "@/components/otayori/PoopAnimation"
import type { OtayoriType, OtayoriRecord } from "@/types/otayori"

const supabase = createClient()

export default function EntryForm({ dogId, birthday }: { dogId: string; birthday: string }) {
  const [type, setType] = useState<OtayoriType>('meal')
  const [content, setContent] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [datetime, setDatetime] = useState(new Date().toISOString())
  const [showAnimation, setShowAnimation] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!photo) return alert('画像をアップロードしてください')
    setLoading(true)

    const { data: userData, error: userError } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) {
      alert("ログインが必要です。先にログインしてください。")
      setLoading(false)
      return
    }

    const folder = type
    const filename = `${dogId}_${Date.now()}.${photo.name.split('.').pop()}`
    const path = `${folder}/${filename}`

    const { error: uploadError } = await supabase.storage.from('dog-images').upload(path, photo)
    if (uploadError) {
      alert('画像アップロードに失敗しました: ' + uploadError.message)
      setLoading(false)
      return
    }

    // OtayoriRecord型で型安全にinsert
    const record: OtayoriRecord = {
      id: '', // Supabase側で自動生成
      dogId,
      userId,
      type,
      content,
      datetime,
      photoUrl: path,
    }
    // DBカラム名に変換（idを含めない）
    const dbRecord = {
      dog_id: record.dogId,
      user_id: record.userId,
      type: record.type,
      content: record.content,
      datetime: record.datetime,
      photo_url: record.photoUrl,
    }
    const { error } = await supabase.from('otayori').insert(dbRecord)
    if (error) alert('投稿に失敗しました: ' + error.message)
    else if (type === 'poop') setShowAnimation(true)
    setLoading(false)
  }

  const tabList: { value: OtayoriType; label: string; icon: string }[] = [
    { value: 'meal', label: 'ごはん', icon: '🍚' },
    { value: 'poop', label: 'うんち', icon: '💩' },
    { value: 'emotion', label: 'きもち', icon: '😊' },
  ]

  return (
    <div className="p-4 space-y-4">
      {showAnimation && <PoopAnimation onComplete={() => setShowAnimation(false)} />}
      <div className="flex space-x-2 justify-center">
        {tabList.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`px-3 py-1 rounded-full text-sm border ${type === t.value ? 'bg-orange-400 text-white' : 'text-gray-600'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <ImageUploader onSelect={setPhoto} />
      {photo && (
        <img
          src={URL.createObjectURL(photo)}
          alt="プレビュー"
          className="w-full max-h-48 object-contain rounded border"
        />
      )}
      {/* <ImageUploader onSelect={(file) => {
  console.log("画像が選択されました:", file)
  setPhoto(file)
}} /> */}
      <TextArea placeholder="comment..." value={content} onChange={(e) => setContent(e.target.value)} />
      <Button onClick={handleSubmit} disabled={loading}>📸 OTAYORI を記録する</Button>
    </div>
  )
}
