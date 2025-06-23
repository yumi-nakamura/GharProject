"use client"

import { useState, useRef } from "react"
import type { UserProfile } from "@/types/user"
import { Camera, Save, Edit3, User, MessageCircle, Upload, X } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

export function ProfileEditForm({ user, onSave }: { user: UserProfile; onSave: (updated: Partial<UserProfile>) => void }) {
  const [name, setName] = useState(user.name)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "")
  const [comment, setComment] = useState(user.comment || "")
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        alert('ログインが必要です')
        return
      }

      // ファイルサイズチェック（5MB制限）
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください')
        return
      }

      // ファイル形式チェック
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        alert('JPG、PNG、GIF形式の画像のみアップロードできます')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `avatar_${authUser.id}_${Date.now()}.${fileExt}`
      
      console.log('画像アップロード開始:', fileName)
      
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('アップロードエラー詳細:', uploadError)
        if (uploadError.message.includes('bucket')) {
          // ストレージバケットが存在しない場合は、Base64エンコードしてデータベースに保存
          console.log('ストレージバケットが存在しません。Base64エンコードを使用します。')
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64Data = reader.result as string
            setAvatarUrl(base64Data)
            setPreviewUrl(base64Data)
            console.log('Base64エンコード成功')
          }
          reader.readAsDataURL(file)
          return
        } else if (uploadError.message.includes('permission')) {
          alert('アップロード権限がありません。')
        } else {
          alert(`画像のアップロードに失敗しました: ${uploadError.message}`)
        }
        return
      }

      console.log('画像アップロード成功')

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName)

      setAvatarUrl(publicUrlData.publicUrl)
      setPreviewUrl(publicUrlData.publicUrl)
      
      console.log('公開URL取得:', publicUrlData.publicUrl)
      
    } catch (error) {
      console.error('画像アップロードエラー:', error)
      alert('画像のアップロードに失敗しました。もう一度お試しください。')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // プレビュー表示
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // アップロード
      handleImageUpload(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    setAvatarUrl("")
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSave({ name, avatar_url: avatarUrl, comment })
    setLoading(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setName(user.name)
    setAvatarUrl(user.avatar_url || "")
    setComment(user.comment || "")
    setPreviewUrl(null)
    setIsEditing(false)
  }

  const displayAvatarUrl = previewUrl || avatarUrl || user.avatar_url

  if (!isEditing) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <User size={20} className="text-orange-500" />
            プロフィール情報
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Edit3 size={16} />
            編集
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-orange-500" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">{name}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
            </div>
          </div>
          
          {comment && (
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <MessageCircle size={20} className="text-pink-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">ひとことコメント</div>
                <div className="text-gray-800 italic">&quot;{comment}&quot;</div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Edit3 size={20} className="text-orange-500" />
          プロフィール編集
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* アバター画像アップロード */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Camera size={16} className="text-orange-500" />
            プロフィール画像
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              {displayAvatarUrl ? (
                <img
                  src={displayAvatarUrl}
                  alt="プロフィール画像"
                  className="w-20 h-20 rounded-full object-cover border-2 border-orange-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center">
                  <User size={24} className="text-orange-400" />
                </div>
              )}
              {displayAvatarUrl && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="flex-1">
              <button
                type="button"
                onClick={handleImageClick}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    アップロード中...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    {displayAvatarUrl ? '画像を変更' : '画像をアップロード'}
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, GIF形式の画像をアップロードできます
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User size={16} className="text-orange-500" />
            名前
          </label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors" 
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <MessageCircle size={16} className="text-orange-500" />
            ひとことコメント
          </label>
          <textarea 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none" 
            rows={3}
            placeholder="自己紹介や愛犬への想いを書いてみてください..."
          />
        </div>
        
        <div className="flex gap-3 pt-2">
          <button 
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                保存中...
              </>
            ) : (
              <>
                <Save size={16} />
                保存する
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 