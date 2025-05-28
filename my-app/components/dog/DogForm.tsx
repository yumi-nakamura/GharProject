// components/dog/DogForm.tsx
"use client"
import { useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { TextInput } from "@/components/common/TextInput"
import { Button } from "@/components/common/Button"

const supabase = createClient()

export default function DogForm({ onComplete }: { onComplete?: () => void }) {
  const [name, setName] = useState("")
  const [breed, setBreed] = useState("")
  const [birthday, setBirthday] = useState("")
  const [message, setMessage] = useState("")
  const [gender, setGender] = useState("")
  const [weight, setWeight] = useState("")
  const [character, setCharacter] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    const { data: session } = await supabase.auth.getUser()
    const userId = session?.user?.id
    if (!userId) {
      setMessage("ログインが必要です")
      return
    }

    let imageUrl = null
    if (imageFile) {
      setUploading(true)
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      const { data: storageData, error: storageError } = await supabase.storage.from("dog-images").upload(fileName, imageFile)
      setUploading(false)
      if (storageError) {
        setMessage("画像のアップロードに失敗しました: " + storageError.message)
        return
      }
      imageUrl = supabase.storage.from("dog-images").getPublicUrl(fileName).data.publicUrl
    }

    const { error } = await supabase.from("dogs").insert({
      name,
      breed,
      birthday,
      gender,
      weight: weight ? parseFloat(weight) : null,
      character,
      image_url: imageUrl,
      owner_id: userId,
    })

    if (error) {
      setMessage("登録に失敗しました: " + error.message)
    } else {
      setMessage("犬のプロフィールを登録しました")
      onComplete?.()
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">わんちゃんプロフィール登録</h2>
      <TextInput placeholder="名前" value={name} onChange={(e) => setName(e.target.value)} />
      <TextInput placeholder="犬種" value={breed} onChange={(e) => setBreed(e.target.value)} />
      <TextInput type="date" placeholder="誕生日" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
      <div>
        <label className="block mb-1">性別</label>
        <div className="flex gap-4">
          <label><input type="radio" name="gender" value="オス" checked={gender === "オス"} onChange={() => setGender("オス")} /> オス</label>
          <label><input type="radio" name="gender" value="メス" checked={gender === "メス"} onChange={() => setGender("メス")} /> メス</label>
          <label><input type="radio" name="gender" value="未回答" checked={gender === "未回答"} onChange={() => setGender("未回答")} /> 未回答</label>
        </div>
      </div>
      <TextInput type="number" placeholder="体重(kg)" value={weight} onChange={(e) => setWeight(e.target.value)} min="0" step="0.1" />
      <div>
        <label className="block mb-1">性格・特徴</label>
        <textarea className="w-full border rounded p-2" placeholder="性格や特徴を入力" value={character} onChange={e => setCharacter(e.target.value)} rows={2} />
      </div>
      <div>
        <label className="block mb-1">写真</label>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setImageFile(e.target.files?.[0] || null)} />
        {uploading && <p className="text-sm text-gray-500">画像アップロード中...</p>}
      </div>
      <Button onClick={handleSubmit}>登録する</Button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  )
}
