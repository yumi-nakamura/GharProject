// components/layout/Navbar.tsx
"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

export function Navbar() {
  const [email, setEmail] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    // 初回取得
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setEmail(data.user.email ?? null)
        setAvatarUrl(data.user.user_metadata?.avatar_url ?? null)
      } else {
        setEmail(null)
        setAvatarUrl(null)
      }
    })
    // セッション変化を監視
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setEmail(session.user.email ?? null)
        setAvatarUrl(session.user.user_metadata?.avatar_url ?? null)
      } else {
        setEmail(null)
        setAvatarUrl(null)
      }
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b shadow-sm bg-white">
      <div className="flex items-center space-x-2">
        <img src="/images/logo.png" alt="OTAYORI" className="h-6 w-6" />
        <span className="font-bold text-lg">OTAYORI</span>
      </div>
      <div className="flex items-center space-x-2">
        {email ? (
          <>
            <span className="text-sm text-gray-600">{email}</span>
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300" />
            )}
            <button onClick={handleSignOut} className="ml-2 text-xs text-orange-500 border border-orange-400 rounded px-2 py-1 hover:bg-orange-50">サインアウト</button>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-400">未ログイン</span>
            <a href="/login" className="ml-2 text-xs text-blue-500 border border-blue-400 rounded px-2 py-1 hover:bg-blue-50">ログイン</a>
            <a href="/signup" className="ml-2 text-xs text-green-500 border border-green-400 rounded px-2 py-1 hover:bg-green-50">サインアップ</a>
          </>
        )}
      </div>
    </header>
  )
}
