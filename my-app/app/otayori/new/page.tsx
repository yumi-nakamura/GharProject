"use client"
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/components/layout/AuthProvider'
import EntryForm from '@/components/otayori/EntryForm'
import type { DogProfile } from '@/types/dog'
import { useSearchParams } from 'next/navigation'

// useSearchParamsを使用するコンポーネント
function OtayoriNewContent() {
  const { user: authUser, loading: authLoading, initialized } = useAuth()
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  
  // URLパラメータから初期タイプを取得
  const initialType = searchParams.get('type') as 'meal' | 'poop' | 'emotion' | null

  // 認証が初期化されたら犬の情報を取得
  useEffect(() => {
    if (initialized && !authLoading && authUser) {
      fetchUserDogs(authUser)
    }
  }, [initialized, authLoading, authUser])

  const fetchUserDogs = async (user: { id: string }) => {
    try {
      if (!user) {
        return
      }

      const supabase = createClient()

      // 方法1: 中間テーブルから取得
      const { data: rels } = await supabase.from('dog_user_relations').select('dog_id').eq('user_id', user.id)
      const dogIdsFromRels = rels?.map(r => r.dog_id) || []

      // 方法2: dogsテーブルのowner_idから直接取得 (古いデータ構造へのフォールバック)
      const { data: dogsFromOwnerId } = await supabase.from('dogs').select('id').eq('owner_id', user.id)
      const dogIdsFromOwner = dogsFromOwnerId?.map(d => d.id) || []
      
      // IDを統合し、重複を排除
      const allDogIds = [...new Set([...dogIdsFromRels, ...dogIdsFromOwner])]

      if (allDogIds.length > 0) {
        const { data, error } = await supabase
          .from('dogs')
          .select('*')
          .in('id', allDogIds)
          .or('is_deleted.is.null,is_deleted.eq.false')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('犬の取得エラー:', error)
          return
        }

        setDogs(data || [])
      } else {
        setDogs([])
      }
    } catch (error) {
      console.error('犬の取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">認証が必要です</h2>
          <p className="text-gray-600 mb-6">ログインしておたよりを投稿してください</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">わんちゃんの情報を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (dogs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">わんちゃんが登録されていません</h2>
          <p className="text-gray-600 mb-6">まずはわんちゃんを登録してからおたよりを投稿しましょう</p>
          <Link href="/dog/register">
            <span className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity font-semibold shadow-lg">
              わんちゃんを登録する
            </span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-6">
      <div className="max-w-md mx-auto px-2">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">新しいおたより</h1>
          <p className="text-gray-600 text-sm sm:text-base">愛犬との大切な瞬間を記録しましょう</p>
        </div>
        {/* おたより投稿フォーム */}
        <EntryForm dogs={dogs} initialType={initialType} />
        {/* 戻るリンク */}
        <div className="text-center mt-6">
          <Link href="/" className="text-pink-600 hover:text-pink-700 font-semibold">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

// ローディングフォールバック
function OtayoriNewLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  )
}

export default function OtayoriNewPage() {
  return (
    <Suspense fallback={<OtayoriNewLoading />}>
      <OtayoriNewContent />
    </Suspense>
  )
}
