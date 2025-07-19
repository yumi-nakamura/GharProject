"use client"
// otayori/DogTimeline.tsx
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { OtayoriCard } from "./Card"
import type { OtayoriRecord } from "@/types/otayori"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import type { DogProfile } from "@/types/dog"

const supabase = createClient()

function groupByDate(posts: OtayoriRecord[]) {
  return posts.reduce((acc, post) => {
    const displayDatetime = post.customDatetime || post.datetime
    // 正しい日本時間変換
    const date = new Date(displayDatetime)
    // UTC時刻を日本時間（JST）に変換
    const japanTime = new Date(date.getTime() + (9 * 60 * 60 * 1000))
    const dateString = format(japanTime, "yyyy-MM-dd")
    if (!acc[dateString]) acc[dateString] = []
    acc[dateString].push(post)
    return acc
  }, {} as Record<string, OtayoriRecord[]>)
}

export function DogTimeline({ dogs }: { dogs: DogProfile[] }) {
  const [posts, setPosts] = useState<OtayoriRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyzedOtayoriIds, setAnalyzedOtayoriIds] = useState<Set<string>>(new Set())
  const router = useRouter()

  // データを再取得する関数
  const refreshData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('DogTimeline: データ再取得開始', { dogs, dogIds: dogs.map(d => d.id) })
      
      // 認証状態を確認
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('DogTimeline: ユーザー未認証')
        router.push('/login')
        return
      }

      console.log('DogTimeline: ユーザー認証済み', { userId: user.id })

      // 複数の犬のIDでOTAYORIを取得
      const dogIds = dogs.map(dog => dog.id)
      const { data, error } = await supabase
        .from("otayori")
        .select("*")
        .in("dog_id", dogIds)
        .order("datetime", { ascending: false })

      console.log('DogTimeline: クエリ結果', { data, error, count: data?.length })

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
        photo_url: item.photo_url && String(item.photo_url).trim() !== '' ? String(item.photo_url) : undefined,
        mood: item.mood ? String(item.mood) : undefined,
        tags: Array.isArray(item.tags) ? item.tags as string[] : undefined,
        customDatetime: item.custom_datetime ? String(item.custom_datetime) : undefined,
        poopGuardPassword: item.poop_guard_password ? String(item.poop_guard_password) : undefined,
        isPoopGuarded: typeof item.is_poop_guarded === 'boolean' ? item.is_poop_guarded as boolean : undefined,
      }))
      
      console.log('DogTimeline: 処理済みデータ', { posts, count: posts.length })
      
      setPosts(posts)
      
      // 分析済みのotayori_idを取得
      await fetchAnalyzedOtayoriIds(posts.map(p => p.id))
      
      setLoading(false)
    } catch (err) {
      console.error('予期しないエラー:', err)
      setError('予期しないエラーが発生しました')
      setLoading(false)
    }
  }, [dogs, router])

  useEffect(() => {
    refreshData()
  }, [dogs, router, refreshData])

  // 分析済みのotayori_idを取得する関数
  const fetchAnalyzedOtayoriIds = async (otayoriIds: string[]) => {
    try {
      if (otayoriIds.length === 0) return
      
      const { data: analyzedData, error } = await supabase
        .from('ai_analysis')
        .select('otayori_id')
        .in('otayori_id', otayoriIds)
        .not('otayori_id', 'is', null)
      
      if (error) {
        console.error('分析済み投稿ID取得エラー:', error)
        return
      }
      
      const analyzedIds = new Set(analyzedData?.map(a => a.otayori_id).filter((id): id is string => id !== null) || [])
      console.log('分析済み投稿ID:', Array.from(analyzedIds))
      setAnalyzedOtayoriIds(analyzedIds)
    } catch (error) {
      console.error('分析済み投稿ID取得エラー:', error)
    }
  }

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
            {grouped[date].map(post => {
              // 投稿に対応する犬の情報を取得
              const dog = dogs.find(d => d.id === post.dogId)
              // 分析済みかどうかを判定
              const isAnalyzed = analyzedOtayoriIds.has(post.id)
              return (
                <OtayoriCard 
                  key={post.id} 
                  post={post} 
                  dog={dog || null} 
                  isAnalyzed={isAnalyzed}
                  onAnalysisComplete={refreshData}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
