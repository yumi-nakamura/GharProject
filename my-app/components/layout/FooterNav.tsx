"use client"
// 2. layout/FooterNav.tsx
import { type ReactElement, useEffect, useState } from "react"
import { Home, PawPrint, Camera, Bell, Settings } from "lucide-react"
import { useProfileStatus } from "@/components/layout/ProfileStatusProvider"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"

export function FooterNav() {
  const { hasDogProfile, loading } = useProfileStatus()
  const [dogId, setDogId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    
    // 認証状態を確認
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      
      if (user) {
        // 犬のIDを取得
        const { data: dogs } = await supabase.from("dogs").select("id").eq("owner_id", user.id)
        if (dogs && dogs.length > 0) {
          setDogId(dogs[0].id)
        }
      }
    }

    checkAuth()

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session?.user)
      if (session?.user) {
        const { data: dogs } = await supabase.from("dogs").select("id").eq("owner_id", session.user.id)
        if (dogs && dogs.length > 0) {
          setDogId(dogs[0].id)
        }
      } else {
        setDogId(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 認証されていない場合は何も表示しない
  if (!isAuthenticated) {
    return null
  }

  // ローディング中は何も描画しない
  if (loading) return null

  const disabled = !hasDogProfile
  const tooltip = disabled ? "プロフィール登録後に利用できます" : undefined

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around items-end py-2 z-40">
      <NavIcon icon={<Home />} href="/" disabled={disabled} tooltip={tooltip} />
      <NavIcon icon={<PawPrint />} href={dogId ? `/dog/${dogId}/timeline` : "/dog/register"} disabled={disabled} tooltip={tooltip} />
      <NavIcon icon={<Camera />} href="/otayori/new" highlight disabled={disabled} tooltip={tooltip} />
      <NavIcon icon={<Bell />} href="/notifications" disabled={disabled} tooltip={tooltip} />
      <NavIcon icon={<Settings />} href="/settings" disabled={disabled} tooltip={tooltip} />
    </nav>
  )
}

function NavIcon({ icon, href, highlight, disabled, tooltip }: { icon: ReactElement; href: string; highlight?: boolean; disabled?: boolean; tooltip?: string }) {
  if (highlight) {
    // 中央ボタンだけ特別なラップで浮かせる
    return (
      <span className="relative flex flex-col items-center flex-1">
        <span className="z-10">
          <Link
            href={disabled ? "#" : href}
            className={`flex items-center justify-center w-14 h-14 rounded-full bg-orange-400 text-white shadow-lg border-4 border-white transition-all
              ${disabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : 'hover:bg-orange-500'}
            `}
            style={{ marginTop: '-28px' }}
            onClick={e => { if (disabled) e.preventDefault() }}
          >
            {icon}
          </Link>
        </span>
        {disabled && tooltip && (
          <span className="absolute left-1/2 -translate-x-1/2 bottom-16 bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30">
            {tooltip}
          </span>
        )}
      </span>
    )
  }
  // 通常アイコン
  return (
    <span className="relative group flex-1 flex justify-center">
      <Link
        href={disabled ? "#" : href}
        className={`flex items-center justify-center w-10 h-10 text-center transition-all ${disabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : 'text-gray-600 hover:text-orange-500'}`}
        onClick={e => { if (disabled) e.preventDefault() }}
      >
        {icon}
      </Link>
      {disabled && tooltip && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-10 bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30">
          {tooltip}
        </span>
      )}
    </span>
  )
}