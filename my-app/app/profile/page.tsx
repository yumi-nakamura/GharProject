import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { UserCard } from "@/components/profile/UserCard"
import { ProfileEditForm } from "@/components/profile/ProfileEditForm"
import type { UserProfile } from "@/types/user"
import { revalidatePath } from "next/cache"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) {
    redirect("/login")
  }
  // profilesテーブルからユーザー情報を取得
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, name, email, avatar_url, comment, rank, badges")
    .eq("id", authData.user.id)
    .single()

  let user: UserProfile = {
    id: authData.user.id,
    name: authData.user.user_metadata?.name || "未登録",
    email: authData.user.email || "",
    avatarUrl: authData.user.user_metadata?.avatar_url || "/images/default-avatar.png",
    comment: "",
    rank: undefined,
    badges: [],
  }
  if (profile) {
    user = {
      id: profile.id,
      name: profile.name || "未登録",
      email: profile.email || "",
      avatarUrl: profile.avatar_url || "/images/default-avatar.png",
      comment: profile.comment || "",
      rank: profile.rank || undefined,
      badges: profile.badges || [],
    }
  }

  // 編集/表示切り替え（サーバーコンポーネントなのでクライアントで分岐推奨）
  // ここでは例として編集フォームを常に表示
  async function handleSave(updated: Partial<UserProfile>) {
    "use server"
    await supabase.from("profiles").upsert({
      id: user.id,
      name: updated.name,
      avatar_url: updated.avatarUrl,
      comment: updated.comment,
      email: user.email,
    })
    revalidatePath("/profile")
  }

  return <ProfileEditForm user={user} onSave={handleSave} />
}
