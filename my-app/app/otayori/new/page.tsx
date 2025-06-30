"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import EntryForm from '@/components/otayori/EntryForm'
import type { DogProfile } from '@/types/dog'
import { useRouter } from 'next/navigation'

export default function OtayoriNewPage() {
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const router = useRouter()

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
        await fetchUserDogs(session?.user || null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 認証が初期化されたら犬の情報を取得
  useEffect(() => {
    if (authInitialized) {
      fetchUserDogs(currentUser)
    }
  }, [authInitialized, currentUser])

  const fetchUserDogs = async (user: User | null) => {
    if (!user) {
      // 未認証時はログインページにリダイレクト
      router.replace("/login")
      return
    }

    const supabase = createClient()
    const { data: rels } = await supabase.from('dog_user_relations').select('dog_id').eq('user_id', user.id)
    const dogIdsFromRels = rels?.map(r => r.dog_id) || []
    const { data: dogsFromOwnerId } = await supabase.from('dogs').select('id').eq('owner_id', user.id)
    const dogIdsFromOwner = dogsFromOwnerId?.map(d => d.id) || []
    const allDogIds = [...new Set([...dogIdsFromRels, ...dogIdsFromOwner])]

    if (allDogIds.length > 0) {
      const { data: dogData } = await supabase
        .from('dogs')
        .select('*')
        .in('id', allDogIds)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('created_at', { ascending: false })
      if (dogData) setDogs(dogData)
    }
    setLoading(false)
  }

  // 認証が初期化され、未認証の場合はローディング表示
  if (!authInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50">
        <div className="text-6xl animate-bounce mb-4">🐾</div>
        <div className="text-lg font-semibold text-orange-600">認証確認中...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50">
        <div className="text-6xl animate-bounce mb-4">🐾</div>
        <div className="text-lg font-semibold text-orange-600">準備をしています...</div>
      </div>
    )
  }

  if (dogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 text-center p-4">
        <div className="text-6xl mb-4">🐕</div>
        <div className="text-lg font-semibold text-gray-700 mb-2">わんちゃんがいません</div>
        <p className="text-gray-500 mb-6">先にご自身のわんちゃんを登録してください。</p>
        <Link href="/dog/register" className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors font-semibold">
          わんちゃんを登録する
        </Link>
      </div>
    )
  }

  return <EntryForm />
}
