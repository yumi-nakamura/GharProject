// otayori/EntryForm.tsx
"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ChevronLeft, ChevronRight, Send, Loader2, Bone, Bubbles, Heart, Lock, Shield, Tag, Sparkles } from 'lucide-react'
import type { DogProfile } from '@/types/dog'
import TagSelector from '@/components/common/TagSelector'
import { ImageUploader } from '@/components/common/ImageUploader'

const supabase = createClient()

export default function OtayoriEntryForm() {
  const router = useRouter()
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [selectedDogIndex, setSelectedDogIndex] = useState(0)
  const [type, setType] = useState<'meal' | 'poop' | 'emotion' | null>(null)
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
    // 日本時間をUTCに変換（9時間を引く）
    const utcTime = new Date(now.getTime() - (9 * 60 * 60 * 1000))
    return utcTime.toISOString()
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
        
        // ファイルサイズチェック（5MB以下）
        if (blob.size > 5 * 1024 * 1024) {
          throw new Error('画像サイズが大きすぎます。5MB以下の画像を選択してください。')
        }
        
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
      
      const response = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageBase64,
          type: type,
          dogName: selectedDog.name
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
      const errorMessage = error instanceof Error ? error.message : 'コメントの生成に失敗しました'
      alert(`コメント生成エラー: ${errorMessage}`)
    } finally {
      setGeneratingComment(false)
    }
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      let dogIdParam: string | null = null;
      let typeParam: string | null = null;
      
      // クライアントサイドでのみURLパラメータを取得
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        dogIdParam = params.get('dog_id');
        typeParam = params.get('type');
        if (typeParam === 'meal' || typeParam === 'poop' || typeParam === 'emotion') {
          setType(typeParam);
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rels } = await supabase.from('dog_user_relations').select('dog_id').eq('user_id', user.id);
      const dogIdsFromRels = rels?.map(r => r.dog_id) || [];
      const { data: dogsFromOwnerId } = await supabase.from('dogs').select('id').eq('owner_id', user.id);
      const dogIdsFromOwner = dogsFromOwnerId?.map(d => d.id) || [];
      const allDogIds = [...new Set([...dogIdsFromRels, ...dogIdsFromOwner])];

      if (allDogIds.length > 0) {
        const { data: dogData } = await supabase
          .from("dogs")
          .select("*")
          .in('id', allDogIds)
          .or('is_deleted.is.null,is_deleted.eq.false')
          .order('created_at', { ascending: false });

        if (dogData) {
          setDogs(dogData);
          if (dogIdParam) {
            const initialIndex = dogData.findIndex(d => d.id === dogIdParam);
            if (initialIndex !== -1) {
              setSelectedDogIndex(initialIndex);
            }
          }
        }
      }
    };
    fetchInitialData();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDog) {
      alert('記録対象の犬が選択されていません。')
      return
    }
    if (!type) {
      alert('おたよりの種類を選択してください。')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('ログインが必要です。')
      setLoading(false)
      return
    }

    let photo_url: string | undefined = undefined
    if (photo) {
      try {
        // トリミングされた画像がある場合は、プレビューURLからファイルを作成
        let uploadFile = photo
        let fileExt = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
        
        if (isPhotoCropped && photoPreview && photoPreview.startsWith('data:')) {
          // トリミングされた画像（Base64）をファイルに変換
          const response = await fetch(photoPreview)
          const blob = await response.blob()
          uploadFile = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' })
          fileExt = 'jpg'
        }
        
        if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
          alert('対応していないファイル形式です。JPG、PNG、GIF、WebP形式の画像を選択してください。')
          setLoading(false)
          return
        }

        // ファイルサイズチェック（5MB以下）
        if (uploadFile.size > 5 * 1024 * 1024) {
          alert('ファイルサイズが大きすぎます。5MB以下の画像を選択してください。')
          setLoading(false)
          return
        }

        const fileName = `otayori/${selectedDog.id}/${user.id}_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage.from('dog-images').upload(fileName, uploadFile, {
          cacheControl: '3600',
          upsert: false
        })
        
        if (uploadError) {
          console.error('写真のアップロードに失敗:', uploadError)
          if (uploadError.message.includes('bucket')) {
            alert('ストレージバケットが見つかりません。管理者にお問い合わせください。')
          } else if (uploadError.message.includes('permission')) {
            alert('アップロード権限がありません。ログインし直してください。')
          } else {
            alert(`写真のアップロードに失敗しました: ${uploadError.message}`)
          }
          setLoading(false)
          return
        }

        const { data: publicUrlData } = supabase.storage.from('dog-images').getPublicUrl(fileName)
        photo_url = publicUrlData.publicUrl
        
        console.log('画像アップロード成功:', photo_url)
        if (!photo_url) {
          alert('画像URLの取得に失敗しました。');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('画像アップロード処理中にエラー:', error)
        alert('画像の処理中にエラーが発生しました。')
        setLoading(false)
        return
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
    <div className="p-4 max-w-lg mx-auto bg-orange-50 min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 記録タイプ選択 */}
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-gray-700">おたよりの種類</h3>
          <div className="grid grid-cols-3 gap-3">
            {typeOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => setType(option.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 border-2 ${
                  type === option.id
                    ? 'bg-orange-100 border-orange-400 text-orange-600'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-orange-300'
                }`}
              >
                {option.icon}
                <span className="mt-2 text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 写真アップロード */}
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-3 text-gray-700">写真</h3>
          {type === 'poop' && photoPreview && (
            <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-700">
                <Lock size={16} />
                <span className="text-sm font-medium">この画像はプープバッグで保護されます</span>
              </div>
            </div>
          )}
          <ImageUploader
            onSelect={handlePhotoSelect}
            onPreview={handlePhotoPreview}
            onCropChange={handlePhotoCropChange}
          />
        </div>

        {/* タグ選択 */}
        {type && (
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={20} className="text-orange-500" />
              <h3 className="font-semibold text-lg text-gray-700">タグ</h3>
            </div>
            <TagSelector
              type={type}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>
        )}

        {/* コメント入力 */}
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="content" className="font-semibold text-lg text-gray-700">コメント</label>
            {photoPreview && type && (
              <button
                type="button"
                onClick={generateComment}
                disabled={generatingComment}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generatingComment ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                <span>{generatingComment ? '生成中...' : 'AI生成'}</span>
              </button>
            )}
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
            rows={4}
            placeholder="今日の様子はどうでしたか？"
          />
        </div>

        {/* うんち投稿時のプープバッグ説明 */}
        {type === 'poop' && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="text-yellow-600" size={20} />
              <h3 className="font-semibold text-yellow-800">プープバッグ機能</h3>
            </div>
            <p className="text-sm text-yellow-700 mb-4">
              うんちの画像は自動的にプープバッグで保護されます！<br/>
              <strong>{selectedDog.name}</strong>のお誕生日をパスワードとして使用します。
            </p>
            <div className="bg-yellow-100 p-3 rounded-lg">
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
        <div className="bg-white p-5 rounded-xl shadow-sm space-y-4">
          {/* 投稿日時（コンパクト版） */}
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-lg text-gray-700 mb-3">投稿日時</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">日付</label>
                <input
                  type="date"
                  value={new Date(customDatetime).toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = e.target.value
                    const currentTime = new Date(customDatetime).toTimeString().split(' ')[0].slice(0, 5)
                    const japanDateTimeString = `${newDate}T${currentTime}:00+09:00`
                    const utcDateTime = new Date(japanDateTimeString)
                    setCustomDatetime(utcDateTime.toISOString())
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px] text-base"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">時刻</label>
                <input
                  type="time"
                  value={new Date(new Date(customDatetime).getTime() + (9 * 60 * 60 * 1000)).toTimeString().split(' ')[0].slice(0, 5)}
                  onChange={(e) => {
                    const newTime = e.target.value
                    const currentDate = new Date(customDatetime).toISOString().split('T')[0]
                    const japanDateTimeString = `${currentDate}T${newTime}:00+09:00`
                    const utcDateTime = new Date(japanDateTimeString)
                    setCustomDatetime(utcDateTime.toISOString())
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px] text-base"
                />
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-lg text-gray-700">記録するわんちゃん</h3>
          <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg">
            <button
              type="button"
              onClick={() => handleDogChange('prev')}
              className="p-2 hover:bg-orange-200 rounded-full transition-colors disabled:opacity-50"
              disabled={dogs.length <= 1}
            >
              <ChevronLeft size={20} className="text-orange-500" />
            </button>
            <div className="flex items-center gap-3">
              <img
                src={selectedDog.image_url || '/images/default-avatar.png'}
                alt={selectedDog.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
              />
              <span className="font-semibold text-lg text-gray-800">{selectedDog.name}</span>
            </div>
            <button
              type="button"
              onClick={() => handleDogChange('next')}
              className="p-2 hover:bg-orange-200 rounded-full transition-colors disabled:opacity-50"
              disabled={dogs.length <= 1}
            >
              <ChevronRight size={20} className="text-orange-500" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg py-4 font-bold text-lg shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Send size={20} />
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
