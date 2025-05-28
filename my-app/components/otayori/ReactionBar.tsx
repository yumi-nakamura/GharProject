// otayori/ReactionBar.tsx
import { useState } from "react"
import { Heart, MessageCircle } from "lucide-react"

export function ReactionBar() {
  const [liked, setLiked] = useState(false)
  return (
    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
      <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1 ${liked ? 'text-red-500' : ''}`}>
        <Heart className="w-4 h-4" /> {liked ? 'いいね済み' : 'いいね'}
      </button>
      <button className="flex items-center gap-1">
        <MessageCircle className="w-4 h-4" /> コメント
      </button>
    </div>
  )
}