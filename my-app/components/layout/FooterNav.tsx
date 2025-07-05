"use client"
// 2. layout/FooterNav.tsx
import { type ReactElement } from "react"
import { Home, PawPrint, Camera, Bell, Settings } from "lucide-react"
import { useProfileStatus } from "@/components/layout/ProfileStatusProvider"
import { useAuth } from "@/components/layout/AuthProvider"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function FooterNav() {
  const { hasDogProfile, loading } = useProfileStatus()
  const { user } = useAuth()
  const pathname = usePathname()

  // 認証されていない場合は何も表示しない
  if (!user) {
    return null
  }

  // ローディング中は何も描画しない
  if (loading) return null

  const disabled = !hasDogProfile
  const tooltip = disabled ? "プロフィール登録後に利用できます" : undefined
  const isOtayoriNewPage = pathname === '/otayori/new'

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around items-end py-1 z-40">
      <NavIcon icon={<Home />} href="/" disabled={disabled} tooltip={tooltip} />
      <NavIcon icon={<PawPrint />} href="/timeline" disabled={disabled} tooltip={tooltip} />
      <NavIcon icon={<Camera />} href="/otayori/new" highlight disabled={disabled || isOtayoriNewPage} tooltip={isOtayoriNewPage ? "現在のページです" : tooltip} />
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
            className={`flex items-center justify-center w-16 h-16 rounded-full shadow-2xl border-4 border-white transition-all transform hover:scale-110
              ${disabled 
                ? 'bg-orange-100 text-orange-300 pointer-events-none cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-400 to-pink-400 text-white hover:from-orange-500 hover:to-pink-500'
              }
            `}
            style={{ marginTop: '-40px' }}
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
        className={`flex items-center justify-center w-12 h-12 text-center transition-all touch-manipulation ${disabled ? 'text-orange-200 pointer-events-none cursor-not-allowed' : 'text-gray-600 hover:text-orange-500'}`}
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