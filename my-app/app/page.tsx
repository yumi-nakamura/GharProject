"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { WeeklySummaryCard } from "@/components/otayori/WeeklySummaryCard"
import { DogProfile } from "@/components/dog/DogProfile"
import { DogStats } from "@/components/dog/DogStats"
import type { DogProfile as DogProfileType } from "@/types/dog"

const supabase = createClient()

// 週次サマリー型
interface WeeklySummary {
  meals: number
  poops: number
  mood: string
}

const summary: WeeklySummary = {
  meals: 21,
  poops: 14,
  mood: "ポジティブ中心",
}

export default function HomePage() {
  const [dog, setDog] = useState<DogProfileType | null>(null)

  useEffect(() => {
    const fetchDog = async () => {
      const { data: session } = await supabase.auth.getUser()
      const userId = session?.user?.id
      if (!userId) return
      const { data, error } = await supabase.from("dogs").select("*", { count: "exact" }).eq("owner_id", userId).single()
      if (data) {
        setDog({
          ...data,
          avatarUrl: data.image_url || "/images/default-avatar.png",
        })
      }
    }
    fetchDog()
  }, [])

  return (
    <div className="p-4 space-y-4">
      {dog ? (
        <>
          <DogProfile dog={dog} />
          <DogStats stats={{
            weight: dog.weight ? `${dog.weight}kg` : "未登録",
            height: "未登録",
            neck: "未登録"
          }} />
        </>
      ) : (
        <div className="text-gray-500">犬プロフィールが登録されていません</div>
      )}
      <WeeklySummaryCard summary={summary} />
    </div>
  )
}