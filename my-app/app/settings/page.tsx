// app/settings/page.tsx
"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { ReminderSettings } from "@/components/settings/ReminderSettings"
import type { ReminderSettingsData } from "@/types/settings"
import { useRouter } from "next/navigation"

const supabase = createClient()

export default function SettingsPage() {
  const [reminders, setReminders] = useState<ReminderSettingsData>({ meal: true, poop: true, mood: false })
  const router = useRouter()

  useEffect(() => {
    const fetchReminders = async () => {
      const { data: session } = await supabase.auth.getUser()
      if (!session?.user) {
        router.replace("/login")
        return
      }
      const { data } = await supabase.from("reminders").select("meal, poop, mood").eq("user_id", session.user.id).single()
      if (data) setReminders(data)
    }
    fetchReminders()
  }, [router])

  const handleChange = async (key: keyof ReminderSettingsData, value: boolean) => {
    const { data: session } = await supabase.auth.getUser()
    if (!session?.user) return
    await supabase.from("reminders").upsert({
      user_id: session.user.id,
      ...reminders,
      [key]: value,
    })
    setReminders(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-4 space-y-8 max-w-xl mx-auto">
      {/* プロフィール編集セクション */}
      <section className="bg-white rounded shadow p-4 mb-6">
        <h2 className="font-bold text-lg mb-2 text-orange-600">プロフィール管理</h2>
        <ul className="space-y-2">
          <li>
            <a href="/profile" className="block px-4 py-2 rounded border border-gray-200 hover:bg-orange-50 transition">
              飼い主プロフィールを編集
            </a>
          </li>
          <li>
            <a href="/dog/register" className="block px-4 py-2 rounded border border-gray-200 hover:bg-orange-50 transition">
              犬のプロフィールを編集
            </a>
          </li>
        </ul>
      </section>

      {/* リマインダー設定セクション */}
      <section className="bg-white rounded shadow p-4">
        <h2 className="font-bold text-lg mb-2 text-orange-600">リマインダー設定</h2>
        <ReminderSettings reminders={reminders} onChange={handleChange} />
      </section>
    </div>
  )
}