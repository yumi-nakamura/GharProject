"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/components/layout/AuthProvider"
import { ProfileAchievements } from "@/components/profile/ProfileAchievements"
import { ProfileTimeline } from "@/components/profile/ProfileTimeline"
import { UserCard } from "@/components/profile/UserCard"
import type { UserProfile, UserStats } from "@/types/user"
import { calculateUserStats } from "@/utils/userStats"
import { Trophy, Calendar, User } from "lucide-react"

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, initialized } = useAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  // 認証が初期化されたらプロフィールを取得
  useEffect(() => {
    if (initialized && !authLoading && authUser) {
      fetchUserProfile(authUser)
    }
  }, [initialized, authLoading, authUser])

  const fetchUserProfile = async (user: { id: string; user_metadata?: { name?: string; avatar_url?: string }; email?: string; created_at: string }) => {
    try {
      if (!user) {
        return
      }

      // まず既存のプロフィールを取得
      const supabase = createClient()
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // プロフィールが存在しない場合は作成
        console.log("プロフィールが存在しません。新規作成します。")
        const newProfile = {
          user_id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || "ユーザー",
          email: user.email || "",
          avatar_url: user.user_metadata?.avatar_url || "",
          comment: "",
          created_at: new Date().toISOString()
        }

        const { data: createdProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert([newProfile])
          .select()
          .single()

        if (createError) {
          console.error("プロフィール作成エラー:", createError)
          // 作成に失敗した場合は、認証ユーザーの情報からプロフィールを構築
          const fallbackProfile: UserProfile = {
            id: user.id,
            user_id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || "ユーザー",
            email: user.email || "",
            avatar_url: user.user_metadata?.avatar_url || "",
            comment: "",
            created_at: user.created_at
          }
          setUser(fallbackProfile)
        } else {
          setUser(createdProfile)
        }
      } else if (error) {
        console.error("プロフィール取得エラー:", error)
        // その他のエラーの場合も、認証ユーザーの情報からプロフィールを構築
        const fallbackProfile: UserProfile = {
          id: user.id,
          user_id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || "ユーザー",
          email: user.email || "",
          avatar_url: user.user_metadata?.avatar_url || "",
          comment: "",
          created_at: user.created_at
        }
        setUser(fallbackProfile)
        
        // 統計情報も取得
        const stats = await calculateUserStats(user.id)
        setUserStats(stats)
      } else {
        setUser(data)
      }

      // 統計情報を取得
      const stats = await calculateUserStats(user.id)
      setUserStats(stats)
    } catch (error) {
      console.error("プロフィール取得エラー:", error)
      // エラーの場合も、認証ユーザーの情報からプロフィールを構築
      const fallbackProfile: UserProfile = {
        id: user.id,
        user_id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || "ユーザー",
        email: user.email || "",
        avatar_url: user.user_metadata?.avatar_url || "",
        comment: "",
        created_at: user.created_at
      }
      setUser(fallbackProfile)
      
      // 統計情報も取得
      const stats = await calculateUserStats(user.id)
      setUserStats(stats)
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
          <p className="text-gray-600 mb-6">ログインしてプロフィールをご利用ください</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">プロフィールを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">プロフィールが見つかりません</h2>
          <p className="text-gray-600 mb-6">プロフィールの取得に失敗しました</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <User className="text-pink-500" size={32} />
            プロフィール
            <User className="text-pink-500" size={32} />
          </h1>
          <p className="text-gray-600">あなたの愛犬との記録を管理しましょう</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム: ユーザーカード */}
          <div className="lg:col-span-1">
            <UserCard user={user} />
          </div>

          {/* 右カラム: 統計とタイムライン */}
          <div className="lg:col-span-2 space-y-6">
            {/* 統計カード */}
            {userStats && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="text-pink-500" size={24} />
                  統計情報
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">{userStats.totalPosts}</div>
                    <div className="text-sm text-gray-600">総投稿数</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{userStats.usageDays}</div>
                    <div className="text-sm text-gray-600">利用日数</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{userStats.streakDays}</div>
                    <div className="text-sm text-gray-600">連続記録</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{userStats.totalDogs}</div>
                    <div className="text-sm text-gray-600">登録犬数</div>
                  </div>
                </div>
              </div>
            )}

            {/* 実績カード */}
            <ProfileAchievements user={user} userStats={userStats || undefined} />

            {/* タイムライン */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-pink-500" size={24} />
                最近の記録
              </h2>
              <ProfileTimeline />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 