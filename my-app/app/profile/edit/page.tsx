"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/components/layout/AuthProvider"
import { ProfileEditForm } from "@/components/profile/ProfileEditForm"
import type { UserProfile } from "@/types/user"
import { ArrowLeft, User } from "lucide-react"

export default function ProfileEditPage() {
  const router = useRouter()
  const { user: authUser, loading: authLoading, initialized } = useAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // 認証が初期化されたらプロフィールを取得
  useEffect(() => {
    const fetchUserProfile = async (user: { id: string; user_metadata?: { name?: string; avatar_url?: string }; email?: string; created_at: string }) => {
      try {
        if (!user) {
          return
        }

        const supabase = createClient()
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (error && error.code === 'PGRST116') {
          // プロフィールが存在しない場合は作成
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
          setUser(data)
        }
      } catch (error) {
        console.error("プロフィール取得エラー:", error)
        const fallbackProfile: UserProfile = {
          id: authUser!.id,
          user_id: authUser!.id,
          name: authUser!.user_metadata?.name || authUser!.email?.split('@')[0] || "ユーザー",
          email: authUser!.email || "",
          avatar_url: authUser!.user_metadata?.avatar_url || "",
          comment: "",
          created_at: authUser!.created_at
        }
        setUser(fallbackProfile)
      } finally {
        setLoading(false)
      }
    }

    if (initialized && !authLoading && authUser) {
      fetchUserProfile(authUser)
    }
  }, [initialized, authLoading, authUser])

  const handleSaveSuccess = () => {
    router.push("/profile")
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
          <p className="text-gray-600 mb-6">ログインしてプロフィール編集をご利用ください</p>
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
        <div className="mb-8">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            プロフィールに戻る
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <User className="text-pink-500" size={32} />
              プロフィール編集
              <User className="text-pink-500" size={32} />
            </h1>
            <p className="text-gray-600">プロフィール情報を編集できます</p>
          </div>
        </div>

        {/* 編集フォーム */}
        <div className="max-w-2xl mx-auto">
          <ProfileEditForm 
            user={{
              ...user,
              email: authUser?.email || user.email || ""
            }} 
            onSave={handleSaveSuccess} 
          />
        </div>
      </div>
    </div>
  )
} 