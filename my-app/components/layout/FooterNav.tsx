"use client"
// 2. layout/FooterNav.tsx
import { type ReactElement } from "react"
import { Home, PawPrint, Camera, Bell, Settings } from "lucide-react"
import { useProfileStatus } from "@/components/layout/ProfileStatusProvider"

export function FooterNav() {
  const { hasDogProfile, loading } = useProfileStatus()
  // ローディング中は何も描画しない
  if (loading) return null
  const disabled = !hasDogProfile
  const tooltip = disabled ? "プロフィール登録後に利用できます" : undefined
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around items-end py-2 z-50">
      <NavIcon icon={<Home />} href="/" disabled={disabled} tooltip={tooltip} />
      <NavIcon icon={<PawPrint />} href="/dog/1" disabled={disabled} tooltip={tooltip} />
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
          <a
            href={disabled ? undefined : href}
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            className={`flex items-center justify-center w-14 h-14 rounded-full bg-orange-400 text-white shadow-lg border-4 border-white transition-all
              ${disabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''}
            `}
            style={{ marginTop: '-28px' }}
            onClick={e => { if (disabled) e.preventDefault() }}
          >
            {icon}
          </a>
        </span>
        {disabled && tooltip && (
          <span className="absolute left-1/2 -translate-x-1/2 bottom-16 bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {tooltip}
          </span>
        )}
      </span>
    )
  }
  // 通常アイコン
  return (
    <span className="relative group flex-1 flex justify-center">
      <a
        href={disabled ? undefined : href}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={`flex items-center justify-center w-10 h-10 text-center transition-all ${disabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : 'text-gray-600'}`}
        onClick={e => { if (disabled) e.preventDefault() }}
      >
        {icon}
      </a>
      {disabled && tooltip && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-10 bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
          {tooltip}
        </span>
      )}
    </span>
  )
}