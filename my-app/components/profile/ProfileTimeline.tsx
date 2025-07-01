"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Camera, Salad, Bubbles, MessageCircleHeart, Clock, Tag, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface OtayoriItem {
  id: string
  type: string
  content?: string
  datetime: string
  custom_datetime?: string
  photo_url?: string
  tags?: string[]
  dogs?: {
    name: string
  }
}

const supabase = createClient()

export function ProfileTimeline() {
  const [otayori, setOtayori] = useState<OtayoriItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [hidePoopImages, setHidePoopImages] = useState(true)
  const postsPerPage = 15

  useEffect(() => {
    fetchRecentOtayori()
  }, [])

  const fetchRecentOtayori = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('otayori')
        .select(`
          id,
          type,
          content,
          datetime,
          custom_datetime,
          photo_url,
          tags,
          dogs (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('datetime', { ascending: false })

      if (error) {
        console.error('おたより取得エラー:', error)
        return
      }

      const formattedData: OtayoriItem[] = (data || []).map(item => ({
        ...item,
        dogs: Array.isArray(item.dogs) && item.dogs.length > 0 ? item.dogs[0] : undefined
      }))

      setOtayori(formattedData)
    } catch (error) {
      console.error('おたより取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // 投稿削除機能
  const handleDelete = async (id: string) => {
    if (!confirm('この投稿を削除しますか？この操作は取り消せません。')) {
      return
    }

    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('otayori')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('投稿削除エラー:', error)
        alert('投稿の削除に失敗しました')
        return
      }

      // 削除成功後、投稿リストを更新
      setOtayori(prev => prev.filter(item => item.id !== id))
      
      // 現在のページが空になった場合、前のページに移動
      const totalPages = Math.ceil((otayori.length - 1) / postsPerPage)
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages)
      }
      
      alert('投稿を削除しました')
    } catch (error) {
      console.error('投稿削除エラー:', error)
      alert('投稿の削除に失敗しました')
    } finally {
      setDeletingId(null)
    }
  }

  // ページング用の投稿リスト
  const totalPages = Math.ceil(otayori.length / postsPerPage)
  const pagedOtayori = otayori.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)

  // うんち画像を隠すかどうかの制御
  const shouldHideImage = (item: OtayoriItem) => {
    return hidePoopImages && item.type === 'poop' && item.photo_url
  }

  // 日本時間に変換して表示
  const formatJapanTime = (isoString: string) => {
    const date = new Date(isoString)
    const japanTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}))
    return format(japanTime, "M/d HH:mm", { locale: ja })
  }

  // カスタム日時かどうかを判定（未来の日時で現在時刻との差が5分以上の場合を予約投稿とする）
  const isScheduledPost = (customDatetime?: string) => {
    if (!customDatetime) return false
    const customTime = new Date(customDatetime)
    const currentTime = new Date()
    // 未来の日時で、現在時刻との差が5分以上の場合のみ予約投稿とする
    return customTime > currentTime && (customTime.getTime() - currentTime.getTime()) > 5 * 60 * 1000
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return <Salad size={32} className="text-green-500" />
      case 'poop':
        return <Bubbles size={32} className="text-brown-500" />
      case 'emotion':
        return <MessageCircleHeart size={32} className="text-pink-500" />
      default:
        return <Camera size={32} className="text-blue-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'meal':
        return 'ごはん'
      case 'poop':
        return 'うんち'
      case 'emotion':
        return 'きもち'
      default:
        return 'おたより'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-4xl animate-bounce mb-2">🐾</div>
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (otayori.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📝</div>
        <div>まだおたよりがありません</div>
        <div className="text-sm mt-1">最初のおたよりを投稿してみましょう！</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* うんち画像表示制御 */}
      <div className="flex items-center justify-center">
        <div className="bg-white rounded-full px-6 py-3 shadow-sm border border-pink-100 flex items-center gap-3">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-2xl">💩</span>
            うんち画像を隠す
          </span>
          <button
            onClick={() => setHidePoopImages(!hidePoopImages)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
              hidePoopImages ? 'bg-pink-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                hidePoopImages ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            {hidePoopImages ? (
              <>
                <EyeOff size={16} className="text-pink-500" />
                隠す
              </>
            ) : (
              <>
                <Eye size={16} className="text-gray-400" />
                表示
              </>
            )}
          </span>
        </div>
      </div>

      {/* 投稿一覧（3列表示） */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pagedOtayori.map((item) => {
          const displayDatetime = item.custom_datetime || item.datetime
          return (
            <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow">
              {/* アイコンを中央上部に大きく表示 */}
              <div className="flex flex-col items-center mb-2">
                {getTypeIcon(item.type)}
                {item.dogs && (
                  <span className="text-xs text-gray-500 mt-1">{item.dogs.name}</span>
                )}
              </div>
              <div className="flex items-center justify-between mb-2">
                <div />
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    {formatJapanTime(displayDatetime)}
                    {isScheduledPost(item.custom_datetime) && (
                      <span className="text-orange-600 font-medium">（予約）</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                    title="削除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {item.content && (
                <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                  {item.content}
                </p>
              )}
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
                      <Tag size={10} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {item.photo_url && (
                <div className="mt-2">
                  {shouldHideImage(item) ? (
                    <div className="w-full h-32 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg flex items-center justify-center border-2 border-dashed border-pink-200">
                      <div className="text-center">
                        <div className="text-3xl mb-1">🙈</div>
                        <div className="text-xs text-pink-600 font-medium">うんち画像を隠しています</div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.photo_url}
                      alt="おたより画像"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ページング */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            前へ
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === page
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* 投稿数表示 */}
      <div className="text-center text-sm text-gray-500">
        {otayori.length}件の投稿中 {((currentPage - 1) * postsPerPage) + 1} - {Math.min(currentPage * postsPerPage, otayori.length)} を表示
      </div>
    </div>
  )
} 