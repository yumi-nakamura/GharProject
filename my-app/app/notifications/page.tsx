// app/notifications/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { NotificationList } from "@/components/notifications/NotificationList"
import type { NotificationItemData } from "@/types/notification"

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data?.user) {
    redirect("/login")
  }
  // TODO: 通知は本来Supabaseから取得
  const mock: NotificationItemData[] = [
    { title: "病院からのお知らせ", message: "次回ワクチンは6月です。" },
    { title: "サービスより", message: "新機能をリリースしました！" },
  ]
  return <NotificationList items={mock} />
}