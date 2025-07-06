"use client"
import { useState, useRef, useEffect } from "react"
import type { DogProfile } from "@/types/dog"
import { createClient } from "@/utils/supabase/client"
import { PawPrint, Loader2, Camera, Save } from "lucide-react"
import Image from 'next/image'

const supabase = createClient()

interface DogProfileEditFormProps {
  initialDogData?: DogProfile
  onComplete?: () => void
}

export default function DogProfileEditForm({ initialDogData, onComplete }: DogProfileEditFormProps) {
  // 各カラムのstate
  const [name, setName] = useState("")
  const [breed, setBreed] = useState("")
  const [birthday, setBirthday] = useState("")
  const [gender, setGender] = useState("")
  const [weight, setWeight] = useState("")
  const [color, setColor] = useState("")
  const [size, setSize] = useState("")
  const [character, setCharacter] = useState("")
  const [charmPoint, setCharmPoint] = useState("")
  const [vaccineInfo, setVaccineInfo] = useState("")
  const [caution, setCaution] = useState("")
  const [medicalHistory, setMedicalHistory] = useState("")
  const [likes, setLikes] = useState("")
  const [dislikes, setDislikes] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [message, setMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditMode = !!initialDogData

  useEffect(() => {
    if (initialDogData) {
      setName(initialDogData.name || "")
      setBreed(initialDogData.breed || "")
      setBirthday(initialDogData.birthday ? new Date(initialDogData.birthday).toISOString().split('T')[0] : "")
      setGender(initialDogData.gender || "")
      setWeight(initialDogData.weight?.toString() || "")
      setColor(initialDogData.color || "")
      setSize(initialDogData.size || "")
      setCharacter(initialDogData.character || "")
      setCharmPoint(initialDogData.charm_point || "")
      setVaccineInfo((initialDogData.vaccine_info || []).join(","))
      setCaution(initialDogData.caution || "")
      setMedicalHistory((initialDogData.medical_history || []).join(","))
      setLikes((initialDogData.likes || []).join(","))
      setDislikes((initialDogData.dislikes || []).join(","))
      setPreviewUrl(initialDogData.image_url || null)
    }
    setIsReady(true)
  }, [initialDogData])



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

  const handleSubmit = async () => {
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage("ログインが必要です")
      setUploading(false)
      return
    }
    let finalImageUrl = isEditMode ? initialDogData?.image_url : null
    if (imageFile && initialDogData) {
      const fileName = `${user.id}/${initialDogData.id}.jpg`
      const { error: uploadError } = await supabase.storage.from("profile").upload(fileName, imageFile, { upsert: true })
      if (uploadError) {
        setMessage("画像のアップロードに失敗しました: " + uploadError.message)
        setUploading(false)
        return
      }
      const { data: publicUrlData } = supabase.storage.from("profile").getPublicUrl(fileName)
      finalImageUrl = publicUrlData.publicUrl
    }
    // dogsテーブルの全カラム
    const dogData = {
      name,
      breed,
      birthday: birthday || null,
      gender,
      weight: weight ? parseFloat(weight) : null,
      color,
      size,
      character,
      charm_point: charmPoint,
      vaccine_info: vaccineInfo.split(",").map(s => s.trim()).filter(Boolean),
      caution,
      medical_history: medicalHistory.split(",").map(s => s.trim()).filter(Boolean),
      likes: likes.split(",").map(s => s.trim()).filter(Boolean),
      dislikes: dislikes.split(",").map(s => s.trim()).filter(Boolean),
      image_url: finalImageUrl,
      owner_id: user.id,
      is_deleted: false,
      deleted_at: null,
      // created_at, updated_atはDB側で自動
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
        // 新規登録時も画像アップロード＆image_url更新
        let finalImageUrl = null
        if (imageFile) {
          const fileName = `${user.id}/${newDog.id}.jpg`
          const { error: uploadError } = await supabase.storage.from("profile").upload(fileName, imageFile, { upsert: true })
          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage.from("profile").getPublicUrl(fileName)
            finalImageUrl = publicUrlData.publicUrl
            await supabase.from("dogs").update({ image_url: finalImageUrl }).eq('id', newDog.id)
          }
        }
        setMessage("新しいわんちゃんを登録しました！")
        onComplete?.()
      }
    }
    setUploading(false)
  }

  const displayUrl = previewUrl || (isEditMode ? initialDogData?.image_url : null)

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-lg mx-auto bg-white rounded-2xl shadow-lg border-2 border-orange-100">
      <h2 className="text-2xl font-bold text-center text-orange-600 mb-2 flex items-center justify-center gap-2">
        <PawPrint className="text-orange-400" size={28} />
        わんちゃんプロフィール{isEditMode ? "編集" : "登録"}
      </h2>
      <div className="flex justify-center">
        {!isReady ? (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div onClick={handleImageClick} className="cursor-pointer group relative">
            {displayUrl ? (
              <Image
                src={displayUrl}
                alt="わんちゃんの写真"
                width={128}
                height={128}
                className="rounded-full object-cover w-32 h-32 border-4 border-orange-200 shadow-lg"
                style={{ display: 'block' }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center border-4 border-dashed border-orange-200">
                <PawPrint className="w-16 h-16 text-orange-300" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-2 shadow-lg border-2 border-white">
              <Camera size={18} />
            </div>
          </div>
        )}
      </div>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">名前</label>
          <input className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" placeholder="ポチ" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">犬種</label>
          <input className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" placeholder="柴犬" value={breed} onChange={e => setBreed(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">誕生日</label>
          <input type="date" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" value={birthday} onChange={e => setBirthday(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">性別</label>
          <select className="w-full border rounded-lg p-2" value={gender} onChange={e => setGender(e.target.value)}>
            <option value="">選択してください</option>
            <option value="オス">オス</option>
            <option value="メス">メス</option>
            <option value="未回答">未回答</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">体重(kg)</label>
          <input type="number" min="0" step="0.1" className="w-full border rounded-lg p-2" placeholder="5.5" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">毛色</label>
          <input className="w-full border rounded-lg p-2" placeholder="茶色" value={color} onChange={e => setColor(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">サイズ</label>
          <select className="w-full border rounded-lg p-2" value={size} onChange={e => setSize(e.target.value)}>
            <option value="">選択してください</option>
            <option value="小型">小型</option>
            <option value="中型">中型</option>
            <option value="大型">大型</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">チャームポイント</label>
          <input className="w-full border rounded-lg p-2" placeholder="ふわふわのしっぽ" value={charmPoint} onChange={e => setCharmPoint(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">性格・特徴</label>
          <textarea className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" placeholder="甘えん坊で、お散歩が大好き！" value={character} onChange={e => setCharacter(e.target.value)} rows={2} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">ワクチン情報（カンマ区切りで複数可）</label>
          <input className="w-full border rounded-lg p-2" placeholder="狂犬病,混合ワクチン" value={vaccineInfo} onChange={e => setVaccineInfo(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">病歴（カンマ区切りで複数可）</label>
          <input className="w-full border rounded-lg p-2" placeholder="アレルギー,骨折" value={medicalHistory} onChange={e => setMedicalHistory(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">好きなもの（カンマ区切りで複数可）</label>
          <input className="w-full border rounded-lg p-2" placeholder="おやつ,おもちゃ" value={likes} onChange={e => setLikes(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">嫌いなもの（カンマ区切りで複数可）</label>
          <input className="w-full border rounded-lg p-2" placeholder="雷,掃除機" value={dislikes} onChange={e => setDislikes(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">注意事項</label>
          <textarea className="w-full border rounded-lg p-2" placeholder="食物アレルギーあり" value={caution} onChange={e => setCaution(e.target.value)} rows={2} />
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <button type="button" onClick={handleSubmit} disabled={uploading} className="flex items-center gap-2 px-6 py-2 rounded-full bg-orange-500 text-white font-bold shadow hover:bg-orange-600 transition-colors disabled:opacity-60">
          <Save size={18} />
          {isEditMode ? "更新する" : "登録する"}
        </button>
      </div>
      {message && <p className="text-center text-orange-600 mt-2">{message}</p>}
    </div>
  )
} 