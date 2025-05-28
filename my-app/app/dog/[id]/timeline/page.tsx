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
  // TODO: birthdayは本来犬情報から取得
  return <DogTimeline dogId={params.id} birthday="2021-06-01" />
}