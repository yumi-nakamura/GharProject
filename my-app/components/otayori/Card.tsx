// otayori/Card.tsx
import { getOtayoriImageUrl, generatePasswordFromBirthday } from "@/utils/otayoriHelpers"
import PoopImageGuard from "@/components/otayori/PoopImageGuard"
import type { OtayoriRecord } from "@/types/otayori"
import { LucideSmile, LucideTag, LucideClock } from "lucide-react"

export function OtayoriCard({ post, birthday }: { post: OtayoriRecord; birthday: string }) {
  const imageUrl = getOtayoriImageUrl(post.photoUrl)
  const password = generatePasswordFromBirthday(birthday)

  return (
    <div className="border rounded-2xl p-4 space-y-2 bg-gradient-to-br from-yellow-50 to-pink-50 shadow-md hover:shadow-lg transition-all">
      <div className="flex items-center text-xs text-gray-500 gap-1 mb-1">
        <LucideClock size={14} className="text-orange-400" />
        {new Date(post.datetime).toLocaleString()}
      </div>
      <div className="flex items-center gap-2 text-md font-semibold">
        {post.type === 'meal' ? '🍚 ごはん' : post.type === 'poop' ? '💩 うんち' : '😊 きもち'}
        {post.mood && (
          <span className="flex items-center gap-1 text-pink-500 text-xs ml-2">
            <LucideSmile size={14} />{post.mood}
          </span>
        )}
      </div>
      {post.type === 'poop' ? (
        <PoopImageGuard imageUrl={imageUrl} expectedPassword={password} />
      ) : (
        <img src={imageUrl} alt="OTAYORI画像" className="w-full max-h-48 object-cover rounded-xl border" />
      )}
      <p className="text-sm text-gray-700 whitespace-pre-wrap min-h-[2em]">{post.content}</p>
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {post.tags.map((tag: string) => (
            <span key={tag} className="inline-flex items-center px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full text-xs">
              <LucideTag size={12} className="mr-1" />{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
