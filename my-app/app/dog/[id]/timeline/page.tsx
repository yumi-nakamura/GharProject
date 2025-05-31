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
  const { data: dog, error } = await supabase.from("dogs").select("birthday").eq("id", params.id).single()
  if (!dog) {
    redirect("/dog/register")
  }
  return <DogTimeline dogId={params.id} birthday={dog.birthday || ""} />
}