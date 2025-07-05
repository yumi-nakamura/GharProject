// components/dog/DogForm.tsx
"use client"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { TextInput } from "@/components/common/TextInput"
import { Button } from "@/components/common/Button"
import type { DogProfile } from '@/types/dog'
import { PawPrint, Loader2 } from 'lucide-react'

const supabase = createClient()

interface DogFormProps {
  initialDogData?: DogProfile
  onComplete?: () => void
}

export default function DogForm({ initialDogData, onComplete }: DogFormProps) {
  const [name, setName] = useState("")
  const [breed, setBreed] = useState("")
  const [birthday, setBirthday] = useState("")
  const [message, setMessage] = useState("")
  const [gender, setGender] = useState("")
  const [weight, setWeight] = useState("")
  const [character, setCharacter] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isReady, setIsReady] = useState(false) // 表示準備完了フラグ
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditMode = !!initialDogData

  useEffect(() => {
    if (initialDogData) {
      setName(initialDogData.name || "")
      setBreed(initialDogData.breed || "")
      setBirthday(initialDogData.birthday ? new Date(initialDogData.birthday).toISOString().split('T')[0] : "")
      setGender(initialDogData.gender || "")
      setWeight(initialDogData.weight?.toString() || "")
      setCharacter(initialDogData.character || "")
    }
    // データ処理が終わったら描画準備完了とする
    setIsReady(true)
  }, [initialDogData])

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage("ログインが必要です")
      return
    }

    let finalImageUrl = isEditMode ? initialDogData?.image_url : null;

    if (imageFile) {
      setUploading(true)
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from("dog-images").upload(fileName, imageFile)

      if (uploadError) {
        setUploading(false)
        setMessage("画像のアップロードに失敗しました: " + uploadError.message)
        return
      }
      
      const { data: publicUrlData } = supabase.storage.from("dog-images").getPublicUrl(fileName)
      finalImageUrl = publicUrlData.publicUrl
      setUploading(false)
    }

    const dogData = {
      name,
      breed,
      birthday: birthday || null,
      gender,
      weight: weight ? parseFloat(weight) : null,
      character,
      image_url: finalImageUrl,
      owner_id: user.id,
    }

    if (isEditMode && initialDogData) {
      const { error } = await supabase.from("dogs").update(dogData).eq('id', initialDogData.id)
      if (error) {
        setMessage("更新に失敗しました: " + error.message)
      } else {
        setMessage("プロフィールを更新しました！")
        onComplete?.()
      }
    } else {
      const { data: newDog, error } = await supabase.from("dogs").insert(dogData).select().single()
      if (error || !newDog) {
        setMessage("登録に失敗しました: " + error?.message)
      } else {
        const { error: relationError } = await supabase.from("dog_user_relations").insert({ dog_id: newDog.id, user_id: user.id })
        if (relationError) {
          setMessage("犬とユーザーの紐付けに失敗しました: " + relationError.message)
          return
        }
        setMessage("新しいわんちゃんを登録しました！")
        onComplete?.()
      }
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const displayUrl = previewUrl || (isEditMode ? initialDogData?.image_url : null)

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-orange-600">{isEditMode ? "わんちゃんプロフィール編集" : "わんちゃんプロフィール登録"}</h2>

      <div className="flex justify-center">
        {!isReady ? (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div onClick={handleImageClick} className="cursor-pointer group relative">
            {displayUrl ? (
              <img
                src={displayUrl}
                alt="わんちゃんの写真"
                className="rounded-full object-cover w-32 h-32 border-4 border-orange-200"
                style={{ display: 'block' }} 
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center border-4 border-dashed border-orange-200">
                <PawPrint className="w-16 h-16 text-orange-300" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400 break-all p-2 bg-gray-50 rounded">
        【デバッグ情報】表示URL: {displayUrl || "なし"}
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      
      <label className="block mb-1 font-semibold text-gray-700">名前</label>
      <TextInput placeholder="ポチ" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="block mb-1 font-semibold text-gray-700">犬種</label>
      <TextInput placeholder="柴犬" value={breed} onChange={(e) => setBreed(e.target.value)} />
      <label className="block mb-1 font-semibold text-gray-700">誕生日</label>
      <TextInput type="date" placeholder="誕生日" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
      <div>
        <label className="block mb-2 font-semibold text-gray-700">性別</label>
        <div className="flex gap-4 items-center bg-gray-50 p-2 rounded-lg">
          <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer transition-colors ${gender === "オス" ? 'bg-blue-500 text-white shadow' : 'bg-white'}`}><input type="radio" name="gender" value="オス" checked={gender === "オス"} onChange={() => setGender("オス")} className="hidden" /> オス</label>
          <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer transition-colors ${gender === "メス" ? 'bg-pink-500 text-white shadow' : 'bg-white'}`}><input type="radio" name="gender" value="メス" checked={gender === "メス"} onChange={() => setGender("メス")} className="hidden" /> メス</label>
          <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer transition-colors ${gender === "未回答" ? 'bg-gray-400 text-white shadow' : 'bg-white'}`}><input type="radio" name="gender" value="未回答" checked={gender === "未回答"} onChange={() => setGender("未回答")} className="hidden" /> 未回答</label>
        </div>
      </div>
      <label className="block mb-1 font-semibold text-gray-700">体重(kg)</label>
      <TextInput type="number" placeholder="5.5" value={weight} onChange={(e) => setWeight(e.target.value)} min="0" step="0.1" />
      <div>
        <label className="block mb-1 font-semibold text-gray-700">性格・特徴</label>
        <textarea className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" placeholder="甘えん坊で、お散歩が大好き！" value={character} onChange={e => setCharacter(e.target.value)} rows={3} />
      </div>
      
      {uploading && <p className="text-sm text-center text-gray-500">画像をアップロード中...</p>}
      <Button onClick={handleSubmit} disabled={uploading}>{isEditMode ? "更新する" : "登録する"}</Button>
      {message && <p className="text-sm text-center text-green-600 mt-4">{message}</p>}
    </div>
  )
}
