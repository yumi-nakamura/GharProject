// otayori/DogTimeline.tsx
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { OtayoriCard } from "./Card"
import type { OtayoriRecord } from "@/types/otayori"

const supabase = createClient()

export function DogTimeline({ dogId, birthday }: { dogId: string; birthday: string }) {
  const [posts, setPosts] = useState<OtayoriRecord[]>([])

  useEffect(() => {
    supabase
      .from("otayori")
      .select("*")
      .eq("dog_id", dogId)
      .order("datetime", { ascending: false })
      .then(({ data }) => setPosts((data as OtayoriRecord[]) || []))
  }, [dogId])

  return (
    <div className="p-4 space-y-4">
      {posts.map((post) => (
        <OtayoriCard key={post.id} post={post} birthday={birthday} />
      ))}
    </div>
  )
}
