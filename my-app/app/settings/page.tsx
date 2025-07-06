"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/components/layout/AuthProvider"
import { DogListItem } from "@/components/settings/DogListItem"
import Link from 'next/link'
import { PlusCircle, User, Heart, PawPrint, Settings, Edit, ArrowRight, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import { DogProfile } from "@/types/dog"
import { UserProfile } from "@/types/user"

export default function SettingsPage() {
  const { user: authUser, loading: authLoading, initialized } = useAuth()
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUserProfile = useCallback(async (user: { id: string } | null) => {
    if (!user) return

    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('プロフィール取得エラー:', error)
    } else {
      setUserProfile(profile)
    }
  }, [])

  const fetchDogs = useCallback(async (user: { id: string } | null) => {
    if (!user) {
      return
    }

    setLoading(true)
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
  }, [])

  // 認証が初期化されたらユーザー情報と犬の情報を取得
  useEffect(() => {
    if (initialized && !authLoading && authUser) {
      fetchUserProfile(authUser)
      fetchDogs(authUser)
    }
  }, [initialized, authLoading, authUser, fetchUserProfile, fetchDogs])

  const handleDogDelete = () => {
    // 犬が削除されたら、リストを再取得
    fetchDogs(authUser)
  }

  if (authLoading || !initialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
        <div className="text-6xl animate-bounce mb-4">🐕</div>
        <div className="text-lg font-semibold text-orange-600">認証状態を確認中...</div>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
        <div className="text-6xl mb-4">🔒</div>
        <div className="text-lg font-semibold text-orange-600 mb-2">認証が必要です</div>
        <div className="text-gray-600">ログインして設定をご利用ください</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
        <div className="text-6xl animate-bounce mb-4">🐕</div>
        <div className="text-lg font-semibold text-orange-600">設定を読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      <div className="p-4 space-y-6 max-w-xl mx-auto">
        
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full shadow-lg mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">設定</h1>
          <p className="text-gray-600">わんちゃんとの思い出を管理しましょう</p>
        </div>

        {/* 飼い主プロフィールカード */}
        <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            {/* アバター */}
            <div className="relative">
              {userProfile?.avatar_url ? (
                <Image
                  src={userProfile.avatar_url}
                  alt={userProfile.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover border-4 border-pink-200 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 border-4 border-pink-200 shadow-md flex items-center justify-center">
                  <User className="w-8 h-8 text-pink-400" />
                </div>
              )}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
            </div>
            
            {/* ユーザー情報 */}
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {userProfile?.name || authUser.email?.split('@')[0] || '飼い主'} さん
              </h2>
              {userProfile?.comment && (
                <p className="text-sm text-gray-600 mb-3 italic">&ldquo;{userProfile.comment}&rdquo;</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <User className="w-4 h-4" />
                  プロフィールを見る
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="flex items-center gap-2 px-3 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold hover:bg-pink-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  編集
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 統計情報カード */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">わんちゃん情報</h3>
              <p className="text-sm text-gray-600">登録されているわんちゃんの数</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">{dogs.length}</div>
            <div className="text-sm text-gray-500">わんちゃん</div>
          </div>
        </div>

        {/* わんちゃん管理セクション */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">わんちゃん管理</h3>
              <p className="text-sm text-gray-600">プロフィールの編集や削除</p>
            </div>
          </div>
          
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
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 text-center border-2 border-dashed border-orange-200">
                <div className="text-4xl mb-3">🐕</div>
                <p className="text-gray-600 mb-4">まだわんちゃんが登録されていません</p>
                <Link href="/dog/register">
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <PlusCircle size={20} />
                    わんちゃんを登録
                  </span>
                </Link>
              </div>
            )}
            {dogs.length > 0 && (
              <Link href="/dog/register">
                <span className="flex items-center justify-center gap-2 w-full px-6 py-4 mt-4 bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 font-semibold">
                  <PlusCircle size={20} />
                  新しいわんちゃんを登録
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* フッター装飾 */}
        <div className="text-center py-6">
          <div className="flex justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-xs text-gray-500 mb-4">わんちゃんとの毎日を大切に</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
            <Link href="/howto">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-pink-100 text-pink-600 rounded-full font-semibold shadow hover:bg-pink-200 transition-all duration-200">
                使い方ガイド
              </span>
            </Link>
            <Link href="/terms">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-orange-100 text-orange-600 rounded-full font-semibold shadow hover:bg-orange-200 transition-all duration-200">
                利用規約
              </span>
            </Link>
            <Link href="/about">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-100 text-yellow-600 rounded-full font-semibold shadow hover:bg-yellow-200 transition-all duration-200">
                運営者情報
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 