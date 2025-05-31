// otayori/EntryForm.tsx
"use client"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/common/Button"
import { TextArea } from "@/components/common/TextArea"
import { ImageUploader } from "@/components/common/ImageUploader"
import PoopAnimation from "@/components/otayori/PoopAnimation"
import type { OtayoriType, OtayoriRecord } from "@/types/otayori"
import type { JSX } from "react"
import { Salad, Bubbles, MessageCircleHeart, Camera } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

const supabase = createClient()

export default function EntryForm({ dogId, birthday }: { dogId: string; birthday: string }) {
  const allowedTypes: OtayoriType[] = ['meal', 'poop', 'emotion'];
  const searchParams = useSearchParams();
  const paramType = searchParams?.get("type");
  const initialType: OtayoriType = allowedTypes.includes(paramType as OtayoriType) ? (paramType as OtayoriType) : 'meal';
  const [type, setType] = useState<OtayoriType>(initialType)
  const [content, setContent] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toTimeString().slice(0, 5)
  })
  const [showAnimation, setShowAnimation] = useState(false)
  const [showThanks, setShowThanks] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!photo) return alert('画像をアップロードしてください')
    setLoading(true)

    const { data: userData, error: userError } = await supabase.auth.getUser()
    console.log('supabase.auth.getUser()', { userData, userError })
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

    // 日付＋時刻を結合
    const datetime = new Date(`${date}T${time}`).toISOString()
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
      dog_id: dogId,
      user_id: userId,
      type,
      content,
      datetime,
      photo_url: path,
    }
    // デバッグ用出力
    console.log({ dogId, userId })
    const { error } = await supabase.from('otayori').insert(dbRecord)
    if (error) {
      alert('投稿に失敗しました: ' + error.message)
      console.error('投稿エラー詳細:', error)
    } else if (type === 'poop') setShowAnimation(true)
    // Thanksモーダル表示（全type共通）
    setShowThanks(true)
    setTimeout(() => {
      setShowThanks(false)
      router.push(`/dog/${dogId}/timeline`)
    }, 3000)
    setLoading(false)
  }

  const tabList: { value: OtayoriType; label: string; icon: JSX.Element }[] = [
    { value: 'meal', label: 'ごはん', icon: <Salad className="inline w-5 h-5 mr-1" /> },
    { value: 'poop', label: 'うんち', icon: <Bubbles className="inline w-5 h-5 mr-1" /> },
    { value: 'emotion', label: 'きもち', icon: <MessageCircleHeart className="inline w-5 h-5 mr-1" /> },
  ]

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {showAnimation && <PoopAnimation onComplete={() => setShowAnimation(false)} />}
      {showThanks && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 animate-fade-in">
          <div className="bg-pink-100 border-4 border-pink-300 rounded-3xl shadow-lg px-8 py-10 flex flex-col items-center">
            <div className="text-5xl mb-2 animate-bounce">🐾</div>
            <div className="text-2xl font-bold text-pink-500 mb-2">OTAYORI Thanks!</div>
            <div className="text-md text-gray-700 mb-4">投稿が完了しました！<br/>みんなに気持ちが届きますように…</div>
            <div className="text-sm text-gray-400">3秒後にタイムラインへ移動します</div>
          </div>
        </div>
      )}
      <div className="flex space-x-2 justify-center mb-2">
        {tabList.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`flex items-center px-4 py-2 rounded-t-lg border-b-2 ${type === t.value ? 'border-orange-400 bg-orange-50 text-orange-500 font-bold' : 'border-transparent text-gray-400 bg-gray-50'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="bg-gray-100 rounded-lg flex flex-col items-center justify-center py-8 mb-2 border border-dashed border-gray-300">
        <Camera className="w-10 h-10 text-gray-400 mb-2" />
        <div className="text-gray-400 text-sm mb-1">写真をアップロード</div>
        <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} className="mt-2" />
        {photo && (
          <img src={URL.createObjectURL(photo)} alt="プレビュー" className="w-full max-h-48 object-contain rounded border mt-2" />
        )}
      </div>
      <textarea className="w-full border rounded p-2" placeholder="comment...." value={content} onChange={e => setContent(e.target.value)} rows={2} />
      <div className="flex items-center gap-2">
        <Camera className="w-5 h-5 text-orange-400" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-2 py-1" />
        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="border rounded px-2 py-1" />
      </div>
      <button onClick={handleSubmit} disabled={loading} className="w-full bg-orange-400 text-white rounded-full py-3 font-bold text-lg shadow hover:bg-orange-500 transition flex items-center justify-center gap-2">
        <Camera className="w-6 h-6" />
        OTAYORI を記録する
      </button>
      {type === 'poop' && (
        <div className="text-xs text-orange-400 mt-2">
          ※うんち記録の投稿は自動的にpoop bagに入ります。<br />
          poop bagは、わんこの誕生日で開封できます。
        </div>
      )}
    </div>
  )
}
