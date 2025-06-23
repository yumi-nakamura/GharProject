// profile/UserCard.tsx
import type { UserProfile } from "@/types/user"
import { User, Heart, Calendar } from "lucide-react"

export function UserCard({ user }: { user: UserProfile }) {
  const hasAvatar = user.avatar_url && user.avatar_url.trim() !== ""
  const isBase64 = hasAvatar && user.avatar_url!.startsWith('data:image')
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
      <div className="text-center">
        {/* アバター画像 */}
        <div className="relative mx-auto mb-4">
          {hasAvatar ? (
            <img 
              src={user.avatar_url} 
              alt={user.name} 
              className="w-20 h-20 rounded-full object-cover border-4 border-orange-200 shadow-lg"
              onError={(e) => {
                // 画像読み込みエラー時のフォールバック
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          {(!hasAvatar || isBase64) && (
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 border-4 border-orange-200 shadow-lg flex items-center justify-center ${hasAvatar ? 'hidden' : ''}`}>
              <User size={32} className="text-orange-400" />
            </div>
          )}
        </div>

        {/* ユーザー情報 */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-1">{user.name}</h2>
          <p className="text-sm text-gray-600 mb-2">{user.email}</p>
          {user.comment && (
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 italic">&quot;{user.comment}&quot;</p>
            </div>
          )}
        </div>

        {/* 登録日 */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Calendar size={14} />
          <span>
            登録日: {user.created_at ? new Date(user.created_at).toLocaleDateString('ja-JP') : '不明'}
          </span>
        </div>

        {/* ハートアイコン */}
        <div className="mt-4 flex justify-center">
          <div className="bg-gradient-to-r from-orange-400 to-pink-400 text-white p-2 rounded-full">
            <Heart size={16} />
          </div>
        </div>
      </div>
    </div>
  )
}