"use client"
// otayori/DogTimeline.tsx
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { OtayoriCard } from "./Card"
import type { OtayoriRecord } from "@/types/otayori"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

const supabase = createClient()

function groupByDate(posts: OtayoriRecord[]) {
  return posts.reduce((acc, post) => {
    const displayDatetime = post.customDatetime || post.datetime
    // 日本時間に変換して日付を取得
    const date = new Date(displayDatetime)
    const japanTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}))
    const dateString = format(japanTime, "yyyy-MM-dd")
    if (!acc[dateString]) acc[dateString] = []
    acc[dateString].push(post)
    return acc
  }, {} as Record<string, OtayoriRecord[]>)
}

export function DogTimeline({ dogId, birthday }: { dogId: string; birthday: string }) {
  const [posts, setPosts] = useState<OtayoriRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    setError(null)
    
    const fetchPosts = async () => {
      try {
        // 認証状態を確認
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from("otayori")
          .select("*")
          .eq("dog_id", dogId)
          .order("datetime", { ascending: false })

        if (error) {
          console.error('OTAYORI取得エラー:', error)
          setError('データの取得に失敗しました')
          setLoading(false)
          return
        }
        
        const posts = (data || []).map((item: Record<string, unknown>) => ({
          id: String(item.id),
          dogId: String(item.dog_id),
          userId: String(item.user_id),
          type: String(item.type) as 'meal' | 'poop' | 'emotion',
          content: String(item.content),
          datetime: String(item.datetime),
          photoUrl: String(item.photo_url),
          mood: item.mood ? String(item.mood) : undefined,
          tags: Array.isArray(item.tags) ? item.tags as string[] : undefined,
          customDatetime: item.custom_datetime ? String(item.custom_datetime) : undefined,
          poopGuardPassword: item.poop_guard_password ? String(item.poop_guard_password) : undefined,
          isPoopGuarded: typeof item.is_poop_guarded === 'boolean' ? item.is_poop_guarded as boolean : undefined,
        }))
        
        setPosts(posts)
        setLoading(false)
      } catch (err) {
        console.error('予期しないエラー:', err)
        setError('予期しないエラーが発生しました')
        setLoading(false)
      }
    }

    fetchPosts()
  }, [dogId, router])

  const grouped = groupByDate(posts)
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-orange-400">
        <span className="text-5xl animate-bounce">🐶</span>
        <div className="mt-4 text-lg font-bold">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-red-400">
        <span className="text-5xl mb-4">⚠️</span>
        <div className="text-lg font-bold mb-2">エラーが発生しました</div>
        <div className="text-sm text-gray-600">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          再読み込み
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-6xl mb-2">📭</span>
        <div className="text-lg font-bold mb-1">まだOTAYORIがありません</div>
        <div className="text-sm">最初のおたよりを記録してみましょう！</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-8">
      {sortedDates.map(date => (
        <div key={date}>
          <div className="font-bold text-lg text-orange-500 mb-2 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            {format(new Date(date), "yyyy年M月d日 (EEE)")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {grouped[date].map(post => (
              <OtayoriCard key={post.id} post={post} birthday={birthday} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
