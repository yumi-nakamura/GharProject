"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Camera, Salad, Bubbles, MessageCircleHeart, Clock, Tag } from "lucide-react"
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
        .limit(10)

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
        return <Salad size={16} className="text-green-500" />
      case 'poop':
        return <Bubbles size={16} className="text-brown-500" />
      case 'emotion':
        return <MessageCircleHeart size={16} className="text-pink-500" />
      default:
        return <Camera size={16} className="text-blue-500" />
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meal':
        return 'bg-green-100 text-green-600'
      case 'poop':
        return 'bg-brown-100 text-brown-600'
      case 'emotion':
        return 'bg-pink-100 text-pink-600'
      default:
        return 'bg-blue-100 text-blue-600'
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
    <div className="space-y-4">
      {otayori.map((item) => {
        const displayDatetime = item.custom_datetime || item.datetime
        return (
          <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(item.type)}
                <span className="font-medium text-gray-800">
                  {getTypeLabel(item.type)}
                </span>
                {item.dogs && (
                  <span className="text-sm text-gray-500">
                    ({item.dogs.name})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                {formatJapanTime(displayDatetime)}
                {isScheduledPost(item.custom_datetime) && (
                  <span className="text-orange-600 font-medium">（予約）</span>
                )}
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
                <img
                  src={item.photo_url}
                  alt="おたより画像"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
} 