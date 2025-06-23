import { createClient } from "@/utils/supabase/client"
import type { UserStats } from "@/types/user"

const supabase = createClient()

export async function calculateUserStats(userId: string): Promise<UserStats> {
  try {
    // ユーザーの投稿を取得
    const { data: posts, error: postsError } = await supabase
      .from('otayori')
      .select('*')
      .eq('user_id', userId)
      .order('datetime', { ascending: true })

    if (postsError) {
      console.error('投稿データ取得エラー:', postsError)
      return getDefaultStats()
    }

    // ユーザーの犬を取得
    const { data: dogs, error: dogsError } = await supabase
      .from('dogs')
      .select('id')
      .eq('owner_id', userId)
      .or('is_deleted.is.null,is_deleted.eq.false')

    if (dogsError) {
      console.error('犬データ取得エラー:', dogsError)
    }

    // 統計情報を計算
    const totalPosts = posts?.length || 0
    const mealCount = posts?.filter(post => post.type === 'meal').length || 0
    const poopCount = posts?.filter(post => post.type === 'poop').length || 0
    const emotionCount = posts?.filter(post => post.type === 'emotion').length || 0
    const totalDogs = dogs?.length || 0

    // 日付関連の計算
    const dates = posts?.map(post => new Date(post.datetime).toDateString()) || []
    const uniqueDates = [...new Set(dates)]
    const usageDays = uniqueDates.length

    // 連続記録日数の計算
    const streakDays = calculateStreakDays(uniqueDates)

    // 最初と最後の投稿日
    const firstPostDate = posts && posts.length > 0 ? posts[0].datetime : null
    const lastPostDate = posts && posts.length > 0 ? posts[posts.length - 1].datetime : null

    // いいね数（現在は実装されていないので0）
    const totalLikes = 0

    return {
      totalPosts,
      totalLikes,
      streakDays,
      usageDays,
      mealCount,
      poopCount,
      emotionCount,
      totalDogs,
      firstPostDate,
      lastPostDate
    }
  } catch (error) {
    console.error('統計情報計算エラー:', error)
    return getDefaultStats()
  }
}

function calculateStreakDays(dates: string[]): number {
  if (dates.length === 0) return 0

  // 日付をソート
  const sortedDates = dates.sort()
  let currentStreak = 1
  let maxStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])
    const previousDate = new Date(sortedDates[i - 1])
    
    // 1日の差があるかチェック
    const diffTime = currentDate.getTime() - previousDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    
    if (diffDays === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return maxStreak
}

function getDefaultStats(): UserStats {
  return {
    totalPosts: 0,
    totalLikes: 0,
    streakDays: 0,
    usageDays: 0,
    mealCount: 0,
    poopCount: 0,
    emotionCount: 0,
    totalDogs: 0,
    firstPostDate: null,
    lastPostDate: null
  }
} 