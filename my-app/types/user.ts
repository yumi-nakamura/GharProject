export interface UserProfile {
  id: string
  user_id: string
  name: string
  email: string
  avatar_url: string
  comment: string
  created_at: string
}

export interface UserStats {
  totalPosts: number
  totalLikes: number
  streakDays: number
  usageDays: number
  mealCount: number
  poopCount: number
  emotionCount: number
  totalDogs: number
  firstPostDate: string | null
  lastPostDate: string | null
} 