"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import type { UserProfile } from "@/types/user"
import { TextInput } from "@/components/common/TextInput"
import { TextArea } from "@/components/common/TextArea"
import { Button } from "@/components/common/Button"
import { User, Save, X, Camera } from "lucide-react"
import { useAuth } from "@/components/layout/AuthProvider"

interface ProfileEditFormProps {
  user: UserProfile
  onSave: (updated: Partial<UserProfile>) => void
}

export function ProfileEditForm({ user, onSave }: ProfileEditFormProps) {
  const { user: authUser, loading: authLoading, initialized } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: "",
    comment: user.comment || "",
    avatar_url: user.avatar_url || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // authUserが取得できたらメールアドレスをセット
  useEffect(() => {
    if (authUser && (authUser.email || authUser.user_metadata?.email)) {
      setFormData(prev => ({
        ...prev,
        email: authUser.email || authUser.user_metadata?.email || user.email || ""
      }));
    } else if (user.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [authUser, user.email]);

  // authUserが取得できるまでフォームを表示しない
  if (authLoading || !initialized || !authUser) {
    return (
      <div className="text-center text-gray-500 py-8">
        メールアドレス取得中...
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const supabase = createClient()
      
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

      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        alert('ログインが必要です')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `avatar_${authUser.id}_${Date.now()}.${fileExt}`
      
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
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64Data = reader.result as string
            setFormData(prev => ({
              ...prev,
              avatar_url: base64Data
            }))
          }
          reader.readAsDataURL(file)
          return
        } else {
          alert(`画像のアップロードに失敗しました: ${uploadError.message}`)
        }
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName)

      setFormData(prev => ({
        ...prev,
        avatar_url: publicUrlData.publicUrl
      }))
      
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
      handleImageUpload(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('フォーム送信開始:', { formData })
    
    // フォームデータの検証
    if (!formData.name.trim()) {
      setError('名前を入力してください')
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      
      console.log('更新データ:', {
        name: formData.name,
        comment: formData.comment,
        avatar_url: formData.avatar_url
      })
      
      const { error } = await supabase
        .from("user_profiles")
        .update({
          name: formData.name,
          comment: formData.comment,
          avatar_url: formData.avatar_url
        })
        .eq("user_id", user.user_id)

      if (error) {
        console.error('Supabase更新エラー:', error)
        throw error
      }

      console.log('プロフィール更新成功')
      setSuccess(true)
      onSave(formData)
      
      // 成功メッセージを表示してから少し待つ
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      console.error("プロフィール更新エラー:", err)
      setError("プロフィールの更新に失敗しました。もう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: "",
      comment: user.comment || "",
      avatar_url: user.avatar_url || ""
    })
    setError(null)
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* アバター画像アップロード */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <User className="text-pink-500" size={20} />
            プロフィール画像
          </h3>
          <div className="space-y-3">
            {/* 現在の画像表示 */}
            {formData.avatar_url && (
              <div className="relative mx-auto w-24 h-24">
                <img
                  src={formData.avatar_url}
                  alt="プロフィール画像"
                  className="w-full h-full rounded-full object-cover border-2 border-pink-200"
                />
              </div>
            )}
            
            {/* アップロードボタン */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    アップロード中...
                  </>
                ) : (
                  <>
                    <Camera size={16} />
                    {formData.avatar_url ? '画像を変更' : '画像をアップロード'}
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
            </div>
          </div>
        </div>

        {/* 名前 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            名前 *
          </label>
          <TextInput
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="あなたの名前を入力してください"
            required
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={formData.email}
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="example@email.com"
              readOnly
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            現在登録されているメールアドレス（変更不可）
          </p>
        </div>

        {/* コメント */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            自己紹介
          </label>
          <TextArea
            id="comment"
            value={formData.comment}
            onChange={(e) => handleInputChange("comment", e.target.value)}
            placeholder="自己紹介や愛犬について書いてみましょう"
            rows={4}
            onFocus={() => {
              // スマホでのキーボード表示時の問題を防ぐ
              console.log('TextArea focused')
            }}
            onBlur={() => {
              console.log('TextArea blurred, current value:', formData.comment)
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            現在の文字数: {formData.comment.length}文字
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 成功メッセージ */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 text-sm">プロフィールが正常に更新されました！</p>
          </div>
        )}

        {/* ボタン */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            onClick={() => {
              console.log('保存ボタンクリック')
              // スマホでのタップ問題を防ぐため、少し遅延を入れる
              setTimeout(() => {
                console.log('保存ボタン処理開始')
              }, 100)
            }}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                保存中...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save size={16} />
                保存
              </div>
            )}
          </Button>
          
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X size={16} />
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
} 