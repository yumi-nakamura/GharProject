'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { toggleLike, getLikesCount, checkUserLiked } from '@/utils/otayoriHelpers'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

interface LikeButtonProps {
  otayoriId: string;
  initialLikesCount?: number;
  initialLiked?: boolean;
}

export default function LikeButton({ 
  otayoriId, 
  initialLikesCount = 0, 
  initialLiked = false 
}: LikeButtonProps) {
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!user) return
      
      try {
        const liked = await checkUserLiked(otayoriId, user.id)
        setIsLiked(liked)
      } catch (error) {
        console.error('いいね状態の取得に失敗しました:', error)
      }
    }

    fetchLikeStatus()
  }, [otayoriId, user])

  const handleLikeClick = async () => {
    if (!user || isLoading) return

    setIsLoading(true)
    try {
      const result = await toggleLike(otayoriId, user.id)
      setIsLiked(result.liked)
      
      // いいね数を更新
      const newCount = await getLikesCount(otayoriId)
      setLikesCount(newCount)
    } catch (error) {
      console.error('いいねの処理に失敗しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <Heart className="w-4 h-4" />
        <span className="text-sm">{likesCount}</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleLikeClick}
      disabled={isLoading}
      className={`flex items-center gap-1 transition-all duration-200 hover:scale-105 ${
        isLiked 
          ? 'text-pink-500' 
          : 'text-gray-400 hover:text-pink-400'
      } ${isLoading ? 'opacity-50' : ''}`}
    >
      <Heart 
        className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} 
      />
      <span className="text-sm font-medium">{likesCount}</span>
    </button>
  )
} 