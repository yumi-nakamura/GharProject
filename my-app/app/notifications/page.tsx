"use client"

import { useAuth } from "@/components/layout/AuthProvider"
import { NotificationList } from "@/components/notifications/NotificationList"
import type { NotificationItemData } from "@/types/notification"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NotificationsPage() {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, initialized, router])

  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // リダイレクト中
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