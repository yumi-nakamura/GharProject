// otayori/Card.tsx
import { getOtayoriImageUrl, generatePasswordFromBirthday } from "@/utils/otayoriHelpers"
import PoopImageGuard from "@/components/otayori/PoopImageGuard"
import type { OtayoriRecord } from "@/types/otayori"

export function OtayoriCard({ post, birthday }: { post: OtayoriRecord; birthday: string }) {
  const imageUrl = getOtayoriImageUrl(post.photoUrl)
  const password = generatePasswordFromBirthday(birthday)

  return (
    <div className="border rounded-lg p-4 space-y-2 bg-white">
      <div className="text-xs text-gray-500">{new Date(post.datetime).toLocaleString()}</div>
      <div className="text-md font-semibold">
        {post.type === 'meal' ? '🍚 ごはん' : post.type === 'poop' ? '💩 うんち' : '😊 きもち'}
      </div>
      {post.type === 'poop' ? (
        <PoopImageGuard imageUrl={imageUrl} expectedPassword={password} />
      ) : (
        <img src={imageUrl} alt="OTAYORI画像" className="w-full max-h-64 object-cover rounded border" />
      )}
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
    </div>
  )
}
