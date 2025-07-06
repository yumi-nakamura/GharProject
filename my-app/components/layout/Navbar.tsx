// components/layout/Navbar.tsx
"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/components/layout/AuthProvider"
import Link from "next/link"
import { PawPrint, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from 'next/image'

const supabase = createClient()

export function Navbar() {
  const { user, signOut } = useAuth()
  const [email, setEmail] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
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
            <Link href="/profile" className="flex items-center space-x-2 hover:opacity-80 transition">
              {avatarUrl ? (
                <Image 
                  src={avatarUrl} 
                  alt="アバター" 
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 border-2 border-orange-200 flex items-center justify-center">
                  <User size={16} className="text-orange-400" />
                </div>
              )}
              <span className="text-sm text-gray-700 hidden sm:block">{email}</span>
            </Link>
            <button 
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
            >
              ログアウト
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Link href="/login" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
              ログイン
            </Link>
            <Link href="/signup" className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600 transition-colors">
              新規登録
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
