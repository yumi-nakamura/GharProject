"use client"
// otayori/DogTimeline.tsx
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { OtayoriCard } from "./Card"
import type { OtayoriRecord } from "@/types/otayori"
import { format } from "date-fns"

const supabase = createClient()

function groupByDate(posts: OtayoriRecord[]) {
  return posts.reduce((acc, post) => {
    const date = format(new Date(post.datetime), "yyyy-MM-dd")
    if (!acc[date]) acc[date] = []
    acc[date].push(post)
    return acc
  }, {} as Record<string, OtayoriRecord[]>)
}

export function DogTimeline({ dogId, birthday }: { dogId: string; birthday: string }) {
  const [posts, setPosts] = useState<OtayoriRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase
      .from("otayori")
      .select("*")
      .eq("dog_id", dogId)
      .order("datetime", { ascending: false })
      .then(({ data }) => {
        const posts = (data || []).map((item: any) => ({
          ...item,
          photoUrl: item.photo_url,
        }))
        setPosts(posts)
        setLoading(false)
      })
  }, [dogId])

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
