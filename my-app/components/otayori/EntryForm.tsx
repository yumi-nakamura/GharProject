// otayori/EntryForm.tsx
"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ChevronLeft, ChevronRight, Send, Loader2, Bone, Bubbles, Heart, Lock, Shield, Tag, Sparkles } from 'lucide-react'
import type { DogProfile } from '@/types/dog'
import TagSelector from '@/components/common/TagSelector'
import { ImageUploader } from '@/components/common/ImageUploader'
import Image from 'next/image'
import { optimizeImageForAI } from '@/utils/imageHelpers'

const supabase = createClient()

type Props = { 
  dogs: DogProfile[]
  initialType?: 'meal' | 'poop' | 'emotion' | null
}
export default function EntryForm({ dogs, initialType = null }: Props) {
  const router = useRouter()
  const [selectedDogIndex, setSelectedDogIndex] = useState(0)
  const [type, setType] = useState<'meal' | 'poop' | 'emotion' | null>(initialType)
  const [content, setContent] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isPhotoCropped, setIsPhotoCropped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customDatetime, setCustomDatetime] = useState<string>(() => {
    // 現在の日本時間をUTC形式で設定
    const now = new Date()
    return now.toISOString()
  })
  const [generatingComment, setGeneratingComment] = useState(false)

  const selectedDog = dogs[selectedDogIndex]

  // 犬の誕生日からパスワードを生成する関数
  const generatePasswordFromBirthday = (birthday: string) => {
    if (!birthday) return '1234'
    const birthDate = new Date(birthday)
    return birthDate.getFullYear().toString() + 
           String(birthDate.getMonth() + 1).padStart(2, '0') + 
           String(birthDate.getDate()).padStart(2, '0')
  }

  // AIコメント生成関数
  const generateComment = async () => {
    if (!photoPreview || !type) {
      alert('写真とおたよりの種類を選択してください')
      return
    }

    setGeneratingComment(true)
    try {
      console.log('コメント生成リクエスト送信中:', { type })
      
      // blob URLをBase64に変換
      let imageBase64 = ''
      if (photoPreview.startsWith('blob:')) {
        console.log('blob URLをBase64に変換中...')
        
        // FileReaderを使用して安全にBase64に変換
        const response = await fetch(photoPreview)
        const blob = await response.blob()
        
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result)
            } else {
              reject(new Error('FileReader result is not a string'))
            }
          }
          reader.onerror = () => reject(new Error('FileReader failed'))
          reader.readAsDataURL(blob)
        })
        
        console.log('Base64変換完了')
      } else {
        imageBase64 = photoPreview
      }

      // 画像をAI用に最適化（1MB以下にリサイズ）
      console.log('画像最適化中...')
      const optimizedImage = await optimizeImageForAI(imageBase64, 1)
      console.log('画像最適化完了')
      
      const response = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: optimizedImage,
          type: type,
          dogName: selectedDog.name,
          tags: selectedTags
        })
      })

      console.log('レスポンスステータス:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API エラーレスポンス:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API 成功レスポンス:', data)
      
      if (data.success && data.comment) {
        setContent(data.comment)
        console.log('コメント設定完了:', data.comment)
      } else {
        throw new Error('コメントが生成されませんでした')
      }
    } catch (error) {
      console.error('コメント生成エラー:', error)
      let errorMessage = 'コメントの生成に失敗しました'
      
      if (error instanceof Error) {
        if (error.message.includes('pattern')) {
          errorMessage = '画像の形式に問題があります。別の画像をお試しください。'
        } else if (error.message.includes('size')) {
          errorMessage = '画像サイズが大きすぎます。画像を小さくしてから再度お試しください。'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してから再度お試しください。'
        } else if (error.message.includes('最適化')) {
          errorMessage = '画像の処理に失敗しました。別の画像をお試しください。'
        } else {
          errorMessage = `エラー: ${error.message}`
        }
      }
      
      alert(`コメント生成エラー: ${errorMessage}`)
    } finally {
      setGeneratingComment(false)
    }
  }

  const handleDogChange = (direction: 'prev' | 'next') => {
    if (dogs.length <= 1) return
    const newIndex = direction === 'prev'
      ? (selectedDogIndex - 1 + dogs.length) % dogs.length
      : (selectedDogIndex + 1) % dogs.length
    setSelectedDogIndex(newIndex)
  }

  const handlePhotoSelect = (file: File) => {
    setPhoto(file)
  }

  const handlePhotoPreview = (url: string) => {
    setPhotoPreview(url)
  }

  const handlePhotoCropChange = (isCropped: boolean) => {
    setIsPhotoCropped(isCropped)
  }

  const handlePhotoRemove = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setIsPhotoCropped(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('ログインが必要です。');
      setLoading(false);
      return;
    }

    if (!dogs[selectedDogIndex]) {
      alert('記録対象の犬が選択されていません。');
      setLoading(false);
      return;
    }
    if (!type) {
      alert('おたよりの種類を選択してください。');
      setLoading(false);
      return;
    }

    setLoading(true)

    let photo_url: string | undefined = undefined
    if (photo) {
      try {
        let uploadFile: File;
        let fileExt: string;
        if (isPhotoCropped) {
          if (!photoPreview || typeof photoPreview !== 'string' || !photoPreview.startsWith('data:')) {
            alert('プレビュー画像がありません。');
            setLoading(false);
            return;
          }
          const response = await fetch(photoPreview);
          const blob = await response.blob();
          uploadFile = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
          fileExt = 'jpg';
        } else {
          if (!photo) {
            alert('画像ファイルがありません。');
            setLoading(false);
            return;
          }
          uploadFile = photo;
          fileExt = photo.name.split('.')?.pop()?.toLowerCase() || 'jpg';
        }
        if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
          alert('対応していないファイル形式です。JPG、PNG、GIF、WebP形式の画像を選択してください。');
          setLoading(false);
          return;
        }
        if (uploadFile.size > 5 * 1024 * 1024) {
          alert('ファイルサイズが大きすぎます。5MB以下の画像を選択してください。');
          setLoading(false);
          return;
        }
        const fileName = `otayori/${dogs[selectedDogIndex].id}/${user.id}_${Date.now()}.${fileExt}`;
        const uploadResult = await supabase.storage.from('dog-images').upload(fileName, uploadFile, {
          cacheControl: '3600',
          upsert: false
        });
        const uploadError = uploadResult.error;
        if (uploadError) {
          console.error('写真のアップロードに失敗:', uploadError);
          if (uploadError.message && uploadError.message.includes('bucket')) {
            alert('ストレージバケットが見つかりません。管理者にお問い合わせください。');
          } else if (uploadError.message && uploadError.message.includes('permission')) {
            alert('アップロード権限がありません。ログインし直してください。');
          } else {
            alert(`写真のアップロードに失敗しました: ${uploadError.message}`);
          }
          setLoading(false);
          return;
        }
        const { data: publicUrlData } = supabase.storage.from('dog-images').getPublicUrl(fileName);
        photo_url = publicUrlData.publicUrl;
        console.log('画像アップロード成功:', photo_url);
        if (!photo_url) {
          alert('画像URLの取得に失敗しました。');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('画像アップロード処理中にエラー:', error);
        alert('画像の処理中にエラーが発生しました。');
        setLoading(false);
        return;
      }
    }

    // 投稿データを準備
    const postData: Record<string, unknown> = {
      dog_id: selectedDog.id,
      user_id: user.id,
      type,
      content,
      photo_url,
      datetime: new Date().toISOString(),
      ...(type === 'poop' && {
        poop_guard_password: generatePasswordFromBirthday(selectedDog.birthday || ''),
        is_poop_guarded: true
      })
    }

    // カスタム日時が設定されている場合は追加
    if (customDatetime) {
      postData.custom_datetime = customDatetime
    }

    // タグが選択されている場合は追加
    if (selectedTags.length > 0) {
      postData.tags = selectedTags
    }

    const { error } = await supabase.from('otayori').insert(postData)

    setLoading(false)

    if (error) {
      console.error('おたよりの記録に失敗:', error)
      alert(`エラーが発生しました: ${error.message}`)
    } else {
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        router.push('/')
      }, 2500)
    }
  }
  
  const typeOptions = [
    { id: 'meal', label: 'ごはん', icon: <Bone size={24} /> },
    { id: 'poop', label: 'うんち', icon: <Bubbles size={24} /> },
    { id: 'emotion', label: 'きもち', icon: <Heart size={24} /> },
  ] as const;

  if (!selectedDog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50">
        <div className="text-6xl animate-bounce mb-4">🐾</div>
        <div className="text-lg font-semibold text-orange-600">準備中...</div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 記録タイプ選択 */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow">
          <h3 className="font-semibold text-base sm:text-lg mb-3 text-gray-700">おたよりの種類</h3>
          <div className="grid grid-cols-3 gap-2">
            {typeOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => setType(option.id)}
                className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg transition-all duration-200 border-2 text-xs sm:text-sm font-medium ${
                  type === option.id
                    ? 'bg-orange-100 border-orange-400 text-orange-600'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-orange-300'
                }`}
              >
                {option.icon}
                <span className="mt-1">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 写真アップロード */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow">
          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-700">写真</h3>
          {type === 'poop' && photoPreview && (
            <div className="mb-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-700">
                <Lock size={16} />
                <span className="text-xs sm:text-sm font-medium">この画像はプープバッグで保護されます</span>
              </div>
            </div>
          )}
          <ImageUploader
            onSelect={handlePhotoSelect}
            onPreview={handlePhotoPreview}
            onCropChange={handlePhotoCropChange}
            onRemove={handlePhotoRemove}
          />
        </div>

        {/* タグ選択 */}
        {type && (
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={18} className="text-orange-500" />
              <h3 className="font-semibold text-base text-gray-700">タグ</h3>
            </div>
            <TagSelector
              type={type}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>
        )}

        {/* コメント入力 */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="content" className="font-semibold text-base text-gray-700">コメント</label>
            {photoPreview && type && type !== 'poop' && (
              <button
                type="button"
                onClick={generateComment}
                disabled={generatingComment}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generatingComment ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                <span>{generatingComment ? '生成中...' : 'AI生成'}</span>
              </button>
            )}
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none text-sm"
            rows={4}
            placeholder="今日の様子はどうでしたか？"
          />
        </div>

        {/* うんち投稿時のプープバッグ説明 */}
        {type === 'poop' && (
          <div className="bg-yellow-50 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-yellow-600" size={18} />
              <h3 className="font-semibold text-base text-yellow-800">プープバッグ機能</h3>
            </div>
            <p className="text-xs text-yellow-700 mb-2">
              うんちの画像は自動的にプープバッグで保護されます！<br/>
              <strong>{selectedDog.name}</strong>のお誕生日をパスワードとして使用します。
            </p>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <p className="text-xs text-yellow-800">
                💡 <strong>パスワード:</strong> {selectedDog.birthday ? generatePasswordFromBirthday(selectedDog.birthday) : '1234（デフォルト）'}
              </p>
              {selectedDog.birthday && (
                <p className="text-xs text-yellow-700 mt-1">
                  誕生日: {new Date(selectedDog.birthday).toLocaleDateString('ja-JP')}
                </p>
              )}
            </div>
          </div>
        )}
        {/* 投稿日時と犬選択 */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow space-y-2">
          {/* 投稿日時（コンパクト版） */}
          <div className="border-b border-gray-100 pb-2 mb-2">
            <h3 className="font-semibold text-base text-gray-700 mb-2">投稿日時</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">日付</label>
                <input
                  type="date"
                  value={new Date(customDatetime).toLocaleDateString('sv-SE')}
                  onChange={(e) => {
                    const newDate = e.target.value
                    const currentDateTime = new Date(customDatetime)
                    const newDateTime = new Date(`${newDate}T${currentDateTime.toTimeString().slice(0, 8)}`)
                    setCustomDatetime(newDateTime.toISOString())
                  }}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[36px] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">時刻</label>
                <input
                  type="time"
                  value={new Date(customDatetime).toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const newTime = e.target.value
                    const currentDateTime = new Date(customDatetime)
                    const currentDate = currentDateTime.toISOString().split('T')[0]
                    const newDateTime = new Date(`${currentDate}T${newTime}:00`)
                    setCustomDatetime(newDateTime.toISOString())
                  }}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[36px] text-sm"
                />
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-base text-gray-700">記録するわんちゃん</h3>
          <div className="flex items-center justify-between bg-orange-50 p-2 rounded-lg">
            <button
              type="button"
              onClick={() => handleDogChange('prev')}
              className="p-1 hover:bg-orange-200 rounded-full transition-colors disabled:opacity-50"
              disabled={dogs.length <= 1}
            >
              <ChevronLeft size={18} className="text-orange-500" />
            </button>
            <div className="flex items-center gap-2">
              <Image
                src={selectedDog.image_url || '/images/default-avatar.png'}
                alt={selectedDog.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
              />
              <span className="font-semibold text-base text-gray-800">{selectedDog.name}</span>
            </div>
            <button
              type="button"
              onClick={() => handleDogChange('next')}
              className="p-1 hover:bg-orange-200 rounded-full transition-colors disabled:opacity-50"
              disabled={dogs.length <= 1}
            >
              <ChevronRight size={18} className="text-orange-500" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg py-3 font-bold text-base shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            <span>{loading ? '記録しています...' : 'おたよりを記録する'}</span>
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl transform transition-all scale-100 opacity-100">
            <div className="text-7xl animate-bounce">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mt-4">記録ありがとう！</h3>
            <p className="text-gray-600 mt-2">{selectedDog.name}も喜んでいるよ！</p>
          </div>
        </div>
      )}
    </div>
  )
}
