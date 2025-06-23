// otayori/EntryForm.tsx
"use client"
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Camera, ChevronLeft, ChevronRight, Send, Loader2, Bone, Droplet, Heart, Lock, Shield, Tag } from 'lucide-react'
import type { DogProfile } from '@/types/dog'
import TagSelector from '@/components/common/TagSelector'
import DateTimePicker from '@/components/common/DateTimePicker'

const supabase = createClient()

export default function OtayoriEntryForm() {
  const router = useRouter()
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [selectedDogIndex, setSelectedDogIndex] = useState(0)
  const [type, setType] = useState<'meal' | 'poop' | 'emotion' | null>(null)
  const [content, setContent] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customDatetime, setCustomDatetime] = useState<string>('')

  const selectedDog = dogs[selectedDogIndex]

  // 犬の誕生日からパスワードを生成する関数
  const generatePasswordFromBirthday = (birthday: string) => {
    if (!birthday) return '1234'
    const birthDate = new Date(birthday)
    return birthDate.getFullYear().toString() + 
           String(birthDate.getMonth() + 1).padStart(2, '0') + 
           String(birthDate.getDate()).padStart(2, '0')
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const dogIdParam = params.get('dog_id')
    const typeParam = params.get('type')
    if (typeParam === 'meal' || typeParam === 'poop' || typeParam === 'emotion') {
      setType(typeParam)
    }

    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: rels } = await supabase.from('dog_user_relations').select('dog_id').eq('user_id', user.id)
      const dogIdsFromRels = rels?.map(r => r.dog_id) || []
      const { data: dogsFromOwnerId } = await supabase.from('dogs').select('id').eq('owner_id', user.id)
      const dogIdsFromOwner = dogsFromOwnerId?.map(d => d.id) || []
      const allDogIds = [...new Set([...dogIdsFromRels, ...dogIdsFromOwner])]

      if (allDogIds.length > 0) {
        const { data: dogData } = await supabase
          .from("dogs")
          .select("*")
          .in('id', allDogIds)
          .or('is_deleted.is.null,is_deleted.eq.false')
          .order('created_at', { ascending: false })

        if (dogData) {
          setDogs(dogData)
          if (dogIdParam) {
            const initialIndex = dogData.findIndex(d => d.id === dogIdParam)
            if (initialIndex !== -1) {
              setSelectedDogIndex(initialIndex)
            }
          }
        }
      }
    }
    fetchInitialData()
  }, [])

  const handleDogChange = (direction: 'prev' | 'next') => {
    if (dogs.length <= 1) return
    const newIndex = direction === 'prev'
      ? (selectedDogIndex - 1 + dogs.length) % dogs.length
      : (selectedDogIndex + 1) % dogs.length
    setSelectedDogIndex(newIndex)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // ファイル形式チェック
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        alert('対応していないファイル形式です。JPG、PNG、GIF、WebP形式の画像を選択してください。')
        return
      }

      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズが大きすぎます。5MB以下の画像を選択してください。')
        return
      }

      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
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
        const fileExt = photo.name.split('.').pop()?.toLowerCase()
        if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
          alert('対応していないファイル形式です。JPG、PNG、GIF、WebP形式の画像を選択してください。')
          setLoading(false)
          return
        }

        // ファイルサイズチェック（5MB以下）
        if (photo.size > 5 * 1024 * 1024) {
          alert('ファイルサイズが大きすぎます。5MB以下の画像を選択してください。')
          setLoading(false)
          return
        }

        const fileName = `otayori/${selectedDog.id}/${user.id}_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage.from('dog-images').upload(fileName, photo, {
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
    { id: 'poop', label: 'うんち', icon: <Droplet size={24} /> },
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

        {/* 日時選択 */}
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <DateTimePicker
            value={customDatetime}
            onChange={setCustomDatetime}
            label="投稿日時"
          />
        </div>

        {/* 内容入力 */}
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <label htmlFor="content" className="font-semibold text-lg mb-3 text-gray-700 block">内容</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
            rows={4}
            placeholder="今日の様子はどうでしたか？"
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
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoPreview ? (
              <div className="space-y-3">
                <img src={photoPreview} alt="プレビュー" className="mx-auto h-32 rounded-lg object-cover shadow-sm" />
                <div className="text-sm text-gray-600">
                  <p>{photo?.name}</p>
                  <p>{photo?.size ? (photo.size / 1024 / 1024).toFixed(2) : '0'} MB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPhoto(null)
                    setPhotoPreview(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  削除
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <Camera size={32} className="mb-2" />
                <span>写真を追加</span>
                <span className="text-xs mt-1">クリックしてファイルを選択</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP (5MB以下)</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>
        
        {/* 犬選択と記録ボタン */}
        <div className="bg-white p-5 rounded-xl shadow-sm space-y-4">
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
