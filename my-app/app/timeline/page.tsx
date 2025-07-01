"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/components/layout/AuthProvider"
import { DogTimeline } from "@/components/otayori/DogTimeline"
import type { DogProfile } from "@/types/dog"

export default function TimelinePage() {
  const { user, initialized, loading } = useAuth()
  const router = useRouter()
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!initialized || !user) return
    const fetchDogs = async () => {
      const supabase = createClient()
      const { data: dogsData } = await supabase
        .from("dogs")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true })
      setDogs(dogsData || [])
      setFetching(false)
    }
    fetchDogs()
  }, [user, initialized, router])

  useEffect(() => {
    if (!fetching && dogs.length === 0) {
      router.replace("/dog/register")
    }
  }, [fetching, dogs, router])

  if (!initialized || loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-2xl text-orange-400">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            OTAYORIタイムライン
          </h1>
          {dogs.length > 1 && (
            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <p className="text-sm text-orange-700">
                🐕 {dogs.length}匹のわんちゃんからのOTAYORI記録をまとめて表示中
              </p>
            </div>
          )}
        </div>
        <DogTimeline dogs={dogs} />
      </div>
    </div>
  )
} 