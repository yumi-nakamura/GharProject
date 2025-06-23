// components/layout/Navbar.tsx
"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { PawPrint, User } from "lucide-react"

const supabase = createClient()

export function Navbar() {
  const [email, setEmail] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初回取得
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setEmail(user.email ?? null)
          // user_profilesテーブルから取得
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("avatar_url")
            .eq("user_id", user.id)
            .single()
          
          if (error && error.code !== 'PGRST116') {
            console.error('プロフィール取得エラー:', error)
          }
          
          if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url)
          } else {
            setAvatarUrl(user.user_metadata?.avatar_url ?? null)
          }
        } else {
          setEmail(null)
          setAvatarUrl(null)
        }
      } catch (error) {
        console.error('ユーザーデータ取得エラー:', error)
        setEmail(null)
        setAvatarUrl(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
    
    // セッション変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          setEmail(session.user.email ?? null)
          // user_profilesテーブルから取得
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("avatar_url")
            .eq("user_id", session.user.id)
            .single()
          
          if (error && error.code !== 'PGRST116') {
            console.error('プロフィール取得エラー:', error)
          }
          
          if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url)
          } else {
            setAvatarUrl(session.user.user_metadata?.avatar_url ?? null)
          }
        } else {
          setEmail(null)
          setAvatarUrl(null)
        }
      } catch (error) {
        console.error('認証状態変更エラー:', error)
        setEmail(null)
        setAvatarUrl(null)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.reload()
    } catch (error) {
      console.error('サインアウトエラー:', error)
    }
  }

  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-2 border-b shadow-sm bg-white z-50">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
          <PawPrint className="h-6 w-6 text-orange-500" />
          <span className="font-bold text-lg">OTAYORI</span>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-2 border-b shadow-sm bg-white z-50">
      <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
        <PawPrint className="h-6 w-6 text-orange-500" />
        <span className="font-bold text-lg">OTAYORI</span>
      </Link>
      <div className="flex items-center space-x-4">
        {email ? (
          <>
            <Link href="/profile">
              <span className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors cursor-pointer">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                )}
                <span>Owner</span>
              </span>
            </Link>
            <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-orange-600 transition-colors">サインアウト</button>
          </>
        ) : (
          <>
            <Link href="/login">
              <span className="px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors">ログイン</span>
            </Link>
            <Link href="/signup">
               <span className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors">サインアップ</span>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
