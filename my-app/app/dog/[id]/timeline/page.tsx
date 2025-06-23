// app/dog/[id]/timeline/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { DogTimeline } from "@/components/otayori/DogTimeline"

export default async function DogTimelinePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data?.user) {
    redirect("/login")
  }
  
  // dogIdから犬情報を取得
  const { data: dog } = await supabase.from("dogs").select("birthday").eq("id", params.id).single()
  if (!dog) {
    redirect("/dog/register")
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">タイムライン</h1>
          <p className="text-gray-600">愛犬との思い出を振り返りましょう</p>
        </div>
        <DogTimeline dogId={params.id} birthday={dog.birthday || ""} />
      </div>
    </div>
  )
}