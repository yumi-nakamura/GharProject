// app/otayori/new/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import EntryForm from "@/components/otayori/EntryForm"

export default async function OtayoriNewPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data?.user) {
    redirect("/login")
  }
  // ユーザーの犬情報を取得
  const { data: dogs, error } = await supabase.from("dogs").select("id, birthday").eq("owner_id", data.user.id)
  if (!dogs || dogs.length === 0) {
    redirect("/dog/register")
  }
  // ひとまず最初の犬を使う
  const dog = dogs[0]
  return (
    <main className="p-4">
      <EntryForm dogId={dog.id} birthday={dog.birthday || ""} />
    </main>
  )
}
