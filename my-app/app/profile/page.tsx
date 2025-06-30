"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import { ProfileEditForm } from "@/components/profile/ProfileEditForm"
import { ProfileAchievements } from "@/components/profile/ProfileAchievements"
import { ProfileTimeline } from "@/components/profile/ProfileTimeline"
import { UserCard } from "@/components/profile/UserCard"
import type { UserProfile, UserStats } from "@/types/user"
import { calculateUserStats } from "@/utils/userStats"
import { Trophy, Clock, Heart, PawPrint, Star, Calendar } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

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
        // 認証状態が更新されたらプロフィールを再取得
        await fetchUserProfile(session?.user || null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 認証が初期化されたらプロフィールを取得
  useEffect(() => {
    if (authInitialized) {
      fetchUserProfile(currentUser)
    }
  }, [authInitialized, currentUser])

  const fetchUserProfile = async (user: User | null) => {
    try {
      if (!user) {
        window.location.href = "/login"
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
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const fallbackProfile: UserProfile = {
            id: authUser.id,
            user_id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || "ユーザー",
            email: authUser.email || "",
            avatar_url: authUser.user_metadata?.avatar_url || "",
            comment: "",
            created_at: authUser.created_at
          }
          setUser(fallbackProfile)
          
          // 統計情報も取得
          const stats = await calculateUserStats(authUser.id)
          setUserStats(stats)
        }
      } else {
        setUser(data)
      }

      // 統計情報を取得
      const stats = await calculateUserStats(user.id)
      setUserStats(stats)
    } catch (error) {
      console.error("プロフィール取得エラー:", error)
      // エラーの場合も、認証ユーザーの情報からプロフィールを構築
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const fallbackProfile: UserProfile = {
          id: authUser.id,
          user_id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || "ユーザー",
          email: authUser.email || "",
          avatar_url: authUser.user_metadata?.avatar_url || "",
          comment: "",
          created_at: authUser.created_at
        }
        setUser(fallbackProfile)
        
        // 統計情報も取得
        const stats = await calculateUserStats(authUser.id)
        setUserStats(stats)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (updated: Partial<UserProfile>) => {
    if (!user) return

    try {
      console.log('プロフィール更新開始:', updated)
      
      // プロフィールが存在するかチェック
      const supabase = createClient()
      const { data: existingProfile, error: checkError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.user_id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('プロフィール存在チェックエラー:', checkError)
        alert('プロフィールの確認に失敗しました')
        return
      }

      // 更新データを準備（カラム名を明示的に指定）
      const updateData: Partial<UserProfile> = {}
      if (updated.name !== undefined) updateData.name = updated.name
      if (updated.email !== undefined) updateData.email = updated.email
      if (updated.avatar_url !== undefined) updateData.avatar_url = updated.avatar_url
      if (updated.comment !== undefined) updateData.comment = updated.comment

      let result
      if (existingProfile) {
        // 既存のプロフィールを更新
        console.log('既存プロフィールを更新:', existingProfile.id)
        console.log('更新データ:', updateData)
        result = await supabase
          .from("user_profiles")
          .update(updateData)
          .eq("user_id", user.user_id)
      } else {
        // プロフィールが存在しない場合は作成
        console.log('新規プロフィールを作成')
        const newProfile = {
          user_id: user.user_id,
          name: updated.name || user.name,
          email: updated.email || user.email,
          avatar_url: updated.avatar_url || user.avatar_url,
          comment: updated.comment || user.comment,
          created_at: new Date().toISOString()
        }
        console.log('作成するプロフィール:', newProfile)
        result = await supabase
          .from("user_profiles")
          .insert([newProfile])
      }

      if (result.error) {
        console.error("プロフィール更新エラー詳細:", result.error)
        if (result.error.message.includes('duplicate')) {
          alert('プロフィールが重複しています。')
        } else if (result.error.message.includes('permission')) {
          alert('プロフィールの更新権限がありません。')
        } else if (result.error.message.includes('foreign key')) {
          alert('ユーザーIDが無効です。')
        } else if (result.error.message.includes('avatar_url')) {
          alert('アバター画像の保存に失敗しました。スキーマを確認してください。')
        } else {
          alert(`プロフィールの更新に失敗しました: ${result.error.message}`)
        }
        return
      }

      console.log('プロフィール更新成功:', result)
      setUser({ ...user, ...updated })
      alert("プロフィールを更新しました！")
    } catch (error) {
      console.error("プロフィール更新エラー:", error)
      alert("プロフィールの更新に失敗しました。もう一度お試しください。")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">プロフィールを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">プロフィールが見つかりません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="container mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            OTAYORI profile
          </h1>
          <p className="text-gray-600 mb-4">あなたの愛犬との思い出を振り返ってみましょう</p>
          
          {/* クイック統計 */}
          {userStats && (
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-1 text-orange-600">
                <PawPrint size={16} />
                <span>{userStats.totalPosts}件の記録</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <Clock size={16} />
                <span>{userStats.usageDays}日間の利用</span>
              </div>
              <div className="flex items-center gap-1 text-purple-600">
                <Star size={16} />
                <span>最大{userStats.streakDays}日連続</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム */}
          <div className="lg:col-span-1 space-y-6">
            {/* ユーザーカード */}
            <UserCard user={user} />
            
            {/* プロフィール編集フォーム */}
            <ProfileEditForm user={user} onSave={handleSaveProfile} />
          </div>

          {/* 右カラム */}
          <div className="lg:col-span-2 space-y-6">
            {/* 統計情報 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="text-orange-500" size={20} />
                あなたの活動統計
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-1">{userStats?.totalPosts || 0}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <PawPrint size={14} />
                    投稿数
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600 mb-1">{userStats?.totalLikes || 0}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Heart size={14} />
                    いいね
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{userStats?.streakDays || 0}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Star size={14} />
                    連続日数
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">{userStats?.usageDays || 0}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Clock size={14} />
                    利用日数
                  </div>
                </div>
              </div>
              
              {/* 詳細統計 */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-lg font-bold text-blue-600 mb-1">{userStats?.mealCount || 0}</div>
                  <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <span>🍚</span>
                    ごはん記録
                  </div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600 mb-1">{userStats?.poopCount || 0}</div>
                  <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <span>💩</span>
                    うんち記録
                  </div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
                  <div className="text-lg font-bold text-pink-600 mb-1">{userStats?.emotionCount || 0}</div>
                  <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <span>😊</span>
                    きもち記録
                  </div>
                </div>
              </div>
              
              {/* 活動期間 */}
              {userStats?.firstPostDate && (
                <div className="mt-4 p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-indigo-700">
                      <Calendar size={16} />
                      <span>活動期間</span>
                    </div>
                    <div className="text-indigo-600 font-medium">
                      {new Date(userStats.firstPostDate).toLocaleDateString('ja-JP')} 〜 
                      {userStats.lastPostDate ? new Date(userStats.lastPostDate).toLocaleDateString('ja-JP') : '現在'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 実績・バッジ */}
            <ProfileAchievements user={user} userStats={userStats || undefined} />
            
            {/* 最近のおたよりタイムライン */}
            <ProfileTimeline />
          </div>
        </div>
      </div>
    </div>
  )
}
