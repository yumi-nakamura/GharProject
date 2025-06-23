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
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">お知らせ</h1>
          <p className="text-gray-600">重要な情報をお届けします</p>
        </div>
        <NotificationList items={mock} />
      </div>
    </div>
  )
}