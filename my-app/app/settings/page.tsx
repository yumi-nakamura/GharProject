// app/settings/page.tsx
"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { ReminderSettings } from "@/components/settings/ReminderSettings"
import type { ReminderSettingsData } from "@/types/settings"
import type { DogProfile } from "@/types/dog"
import { useRouter } from "next/navigation"
import { DogListItem } from "@/components/settings/DogListItem"
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

const supabase = createClient()

export default function SettingsPage() {
  const [reminders, setReminders] = useState<ReminderSettingsData>({ meal: true, poop: true, mood: false })
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchDogs = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace("/login")
      return
    }

    // リマインダー設定を取得
    const { data: reminderData } = await supabase.from("reminders").select("meal, poop, mood").eq("user_id", user.id).single()
    if (reminderData) setReminders(reminderData)

    // ----------------- 犬の情報の取得ロジックを修正 -----------------

    // 方法1: 中間テーブルから取得
    const { data: rels } = await supabase.from('dog_user_relations').select('dog_id').eq('user_id', user.id)
    const dogIdsFromRels = rels?.map(r => r.dog_id) || []

    // 方法2: dogsテーブルのowner_idから直接取得 (古いデータ構造へのフォールバック)
    const { data: dogsFromOwnerId } = await supabase.from('dogs').select('id').eq('owner_id', user.id)
    const dogIdsFromOwner = dogsFromOwnerId?.map(d => d.id) || []
    
    // IDを統合し、重複を排除
    const allDogIds = [...new Set([...dogIdsFromRels, ...dogIdsFromOwner])]

    if (allDogIds.length > 0) {
      const { data: dogData, error } = await supabase
        .from('dogs')
        .select('*')
        .in('id', allDogIds)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error("Failed to fetch dogs:", error)
      } else {
        setDogs(dogData || [])
      }
    } else {
      setDogs([])
    }
    setLoading(false)
    // ----------------------------------------------------------------
  }

  useEffect(() => {
    fetchDogs()
  }, [router])

  const handleChange = async (key: keyof ReminderSettingsData, value: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("reminders").upsert({
      user_id: user.id,
      ...reminders,
      [key]: value,
    })
    setReminders(prev => ({ ...prev, [key]: value }))
  }

  const handleDogDelete = () => {
    // 犬が削除されたら、リストを再取得
    fetchDogs()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50">
        <div className="text-6xl animate-bounce mb-4">🐕</div>
        <div className="text-lg font-semibold text-orange-600">設定を読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-8 max-w-xl mx-auto bg-orange-50 min-h-screen">
      {/* プロフィール編集セクション　　一旦見せない
      <section>
        <h2 className="font-bold text-lg mb-4 text-orange-600">プロフィール管理</h2>
        <div className="space-y-4">
            <Link href="/profile" className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <span className="font-semibold text-gray-700">飼い主プロフィール</span>
              <span className="px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors">編集</span>
            </Link>
        </div>
      </section>
      */}
      {/* 犬のプロフィールセクション */}
      <section>
        <h2 className="font-bold text-lg mb-4 text-orange-600">わんちゃん管理</h2>
        <div className="space-y-3">
          {dogs.length > 0 ? (
            dogs.map(dog => (
              <DogListItem 
                key={dog.id} 
                dog={dog} 
                onDelete={handleDogDelete}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-4xl mb-3">🐕</div>
              <p className="text-gray-500 mb-4">まだわんちゃんが登録されていません。</p>
              <Link href="/dog/register">
                <span className="inline-flex items-center gap-2 px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors font-semibold">
                  <PlusCircle size={20} />
                  わんちゃんを登録
                </span>
              </Link>
            </div>
          )}
          {dogs.length > 0 && (
            <Link href="/dog/register">
              <span className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-4 text-white bg-orange-500 rounded-lg shadow hover:bg-orange-600 transition-colors font-semibold">
                <PlusCircle size={20} />
                新しいわんちゃんを登録
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* リマインダー設定セクション　一旦見せない
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="font-bold text-lg mb-2 text-orange-600">リマインダー設定</h2>
        <ReminderSettings reminders={reminders} onChange={handleChange} />
      </section>
       */}
    </div>
  )
}