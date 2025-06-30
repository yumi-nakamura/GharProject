// app/settings/page.tsx
"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import { DogListItem } from "@/components/settings/DogListItem"
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { useRouter } from "next/navigation"
import { DogProfile } from "@/types/dog"

export default function SettingsPage() {
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const router = useRouter()

  const fetchDogs = useCallback(async (user: User | null) => {
    if (!user) {
      router.replace("/login")
      return
    }

    setLoading(true)
    const supabase = createClient()

    // リマインダー設定を取得
    // const { data: reminderData } = await supabase.from("reminders").select("meal, poop, mood").eq("user_id", user.id).single()

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
  }, [router])

  useEffect(() => {
    const supabase = createClient()
    
    // 初期認証状態を取得
    const initializeAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('初期認証状態取得エラー:', error)
        } else {
          console.log('初期認証状態:', user)
          setCurrentUser(user)
        }
        setAuthInitialized(true)
      } catch (error) {
        console.error('初期認証状態取得に失敗:', error)
        setAuthInitialized(true)
      }
    }

    initializeAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('認証状態変更:', event, session?.user)
      setCurrentUser(session?.user || null)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // 認証状態が更新されたら犬の情報を再取得
        await fetchDogs(session?.user || null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchDogs])

  // 認証が初期化されたら犬の情報を取得
  useEffect(() => {
    if (authInitialized) {
      fetchDogs(currentUser)
    }
  }, [authInitialized, currentUser, fetchDogs])

  const handleDogDelete = () => {
    // 犬が削除されたら、リストを再取得
    fetchDogs(currentUser)
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