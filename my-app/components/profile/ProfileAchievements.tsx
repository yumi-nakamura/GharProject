"use client"

import type { UserStats } from "@/types/user"
import { Trophy, Star, Heart, Camera, Calendar, Award, PawPrint, Target } from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  unlocked: boolean
  condition: (stats: UserStats) => boolean
}

interface ProfileAchievementsProps {
  userStats?: UserStats
}

export function ProfileAchievements({ userStats }: ProfileAchievementsProps) {
  // 実績の定義
  const achievements: Achievement[] = [
    {
      id: "first_dog",
      name: "初めてのわんちゃん",
      description: "最初のわんちゃんを登録しました",
      icon: <Heart size={20} />,
      color: "bg-red-100 text-red-600",
      unlocked: false,
      condition: (stats) => stats.totalDogs >= 1
    },
    {
      id: "first_otayori",
      name: "初めてのおたより",
      description: "最初のおたよりを記録しました",
      icon: <Camera size={20} />,
      color: "bg-blue-100 text-blue-600",
      unlocked: false,
      condition: (stats) => stats.totalPosts >= 1
    },
    {
      id: "weekly_streak",
      name: "週間継続",
      description: "1週間連続でおたよりを記録しました",
      icon: <Calendar size={20} />,
      color: "bg-green-100 text-green-600",
      unlocked: false,
      condition: (stats) => stats.streakDays >= 7
    },
    {
      id: "monthly_streak",
      name: "月間継続",
      description: "1ヶ月連続でおたよりを記録しました",
      icon: <Calendar size={20} />,
      color: "bg-green-100 text-green-600",
      unlocked: false,
      condition: (stats) => stats.streakDays >= 30
    },
    {
      id: "multiple_dogs",
      name: "多頭飼い",
      description: "複数のわんちゃんを登録しました",
      icon: <Heart size={20} />,
      color: "bg-purple-100 text-purple-600",
      unlocked: false,
      condition: (stats) => stats.totalDogs >= 2
    },
    {
      id: "photo_master",
      name: "写真マスター",
      description: "50枚以上の写真をアップロードしました",
      icon: <Camera size={20} />,
      color: "bg-yellow-100 text-yellow-600",
      unlocked: false,
      condition: (stats) => stats.totalPosts >= 50
    },
    {
      id: "community_leader",
      name: "コミュニティリーダー",
      description: "100件以上のおたよりを投稿しました",
      icon: <Award size={20} />,
      color: "bg-pink-100 text-pink-600",
      unlocked: false,
      condition: (stats) => stats.totalPosts >= 100
    },
    {
      id: "meal_tracker",
      name: "ごはん記録マスター",
      description: "30回以上のごはん記録をしました",
      icon: <PawPrint size={20} />,
      color: "bg-orange-100 text-orange-600",
      unlocked: false,
      condition: (stats) => stats.mealCount >= 30
    },
    {
      id: "poop_tracker",
      name: "うんち記録マスター",
      description: "30回以上のうんち記録をしました",
      icon: <Target size={20} />,
      color: "bg-brown-100 text-brown-600",
      unlocked: false,
      condition: (stats) => stats.poopCount >= 30
    },
    {
      id: "emotion_tracker",
      name: "きもち記録マスター",
      description: "20回以上のきもち記録をしました",
      icon: <Heart size={20} />,
      color: "bg-pink-100 text-pink-600",
      unlocked: false,
      condition: (stats) => stats.emotionCount >= 20
    },
    {
      id: "long_term_user",
      name: "長期利用者",
      description: "30日以上アプリを利用しました",
      icon: <Calendar size={20} />,
      color: "bg-indigo-100 text-indigo-600",
      unlocked: false,
      condition: (stats) => stats.usageDays >= 30
    },
    {
      id: "dedicated_owner",
      name: "献身的な飼い主",
      description: "100日以上アプリを利用しました",
      icon: <Trophy size={20} />,
      color: "bg-gold-100 text-gold-600",
      unlocked: false,
      condition: (stats) => stats.usageDays >= 100
    }
  ]

  // 統計情報に基づいて実績の解除状態を判定
  const evaluatedAchievements = achievements.map(achievement => ({
    ...achievement,
    unlocked: userStats ? achievement.condition(userStats) : false
  }))

  const unlockedCount = evaluatedAchievements.filter(a => a.unlocked).length

  return (
    <div className="space-y-4">
      {/* 実績サマリー */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-yellow-600">{unlockedCount}</div>
            <div className="text-sm text-gray-600">獲得実績</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">{achievements.length}</div>
            <div className="text-sm text-gray-600">総実績数</div>
          </div>
        </div>
        <div className="mt-3 bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Trophy size={16} className="text-yellow-500" />
            <span>進捗: {unlockedCount}/{achievements.length}</span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 実績一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evaluatedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              achievement.unlocked
                ? 'bg-white border-yellow-200 shadow-md hover:shadow-lg'
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${achievement.color} ${
                !achievement.unlocked && 'grayscale'
              }`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-semibold ${
                    achievement.unlocked ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {achievement.name}
                  </h4>
                  {achievement.unlocked && (
                    <Star size={14} className="text-yellow-500 fill-current" />
                  )}
                </div>
                <p className={`text-sm ${
                  achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {achievement.description}
                </p>
                {achievement.unlocked && (
                  <div className="mt-2 text-xs text-yellow-600 font-medium">
                    ✓ 獲得済み
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* バッジ一覧（ユーザーのバッジがある場合） */}
      {/* 現在はバッジ機能は実装されていないため、コメントアウト */}
      {/*
      {user?.badges && user.badges.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Award size={18} className="text-yellow-500" />
            獲得バッジ
          </h4>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badge, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm"
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      )}
      */}
    </div>
  )
} 