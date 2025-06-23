"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import type { DogProfile } from "@/types/dog"
import {
  Calendar,
  TrendingUp,
  Heart,
  Activity,
  Clock,
  Target,
  Award,
  Eye,
  Brain,
  Bone,
  Bubbles,
  BarChart3,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"

const supabase = createClient()

interface HealthData {
  period: string
  mealCount: number
  poopCount: number
  emotionCount: number
  averageMealsPerDay: number
  averagePoopsPerDay: number
  consistency: number
  moodTrend: string
  healthScore: number
  recommendations: string[]
  alerts: string[]
}

interface OtayoriPost {
  id: string
  type: string
  datetime: string
  content?: string
  image_url?: string
  tags?: string[]
  [key: string]: any
}

export default function HealthReportPage() {
  const [selectedDog, setSelectedDog] = useState<DogProfile | null>(null)
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week')

  const fetchHealthData = useCallback(async (dogId: string, period: 'week' | 'month' | 'quarter') => {
    try {
      const now = new Date()
      let startDate: Date

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
      }

      const { data: posts, error } = await supabase
        .from('otayori')
        .select('*')
        .eq('dog_id', dogId)
        .gte('datetime', startDate.toISOString())
        .order('datetime', { ascending: true })

      if (error) {
        console.error('健康データ取得エラー:', error)
        return
      }

      const healthData = analyzeHealthData(posts || [], period)
      setHealthData(healthData)
    } catch (error) {
      console.error('健康データ取得エラー:', error)
    }
  }, [])

  useEffect(() => {
    fetchDogs()
  }, [])

  useEffect(() => {
    if (selectedDog) {
      fetchHealthData(selectedDog.id, selectedPeriod)
    }
  }, [selectedDog, selectedPeriod, fetchHealthData])

  const fetchDogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/login"
        return
      }

      const { data: rels } = await supabase.from('dog_user_relations').select('dog_id').eq('user_id', user.id)
      const dogIdsFromRels = rels?.map(r => r.dog_id) || []
      const { data: dogsFromOwnerId } = await supabase.from('dogs').select('id').eq('owner_id', user.id)
      const dogIdsFromOwner = dogsFromOwnerId?.map(d => d.id) || []
      const allDogIds = [...new Set([...dogIdsFromRels, ...dogIdsFromOwner])]

      if (allDogIds.length > 0) {
        const { data, error } = await supabase
          .from("dogs")
          .select("*")
          .in('id', allDogIds)
          .or('is_deleted.is.null,is_deleted.eq.false')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('犬の取得エラー:', error)
          return
        }

        setDogs(data || [])
        if (data && data.length > 0) {
          setSelectedDog(data[0])
        }
      }
    } catch (error) {
      console.error('犬の取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeHealthData = useCallback((posts: OtayoriPost[], period: string): HealthData => {
    const mealPosts = posts.filter(post => post.type === 'meal')
    const poopPosts = posts.filter(post => post.type === 'poop')
    const emotionPosts = posts.filter(post => post.type === 'emotion')

    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90
    const averageMealsPerDay = mealPosts.length / days
    const averagePoopsPerDay = poopPosts.length / days

    // 健康スコアの計算（簡易版）
    let healthScore = 70 // ベーススコア

    // 食事の一貫性
    if (averageMealsPerDay >= 1 && averageMealsPerDay <= 3) healthScore += 10
    if (mealPosts.length > 0) healthScore += 5

    // 排泄の一貫性
    if (averagePoopsPerDay >= 1 && averagePoopsPerDay <= 4) healthScore += 10
    if (poopPosts.length > 0) healthScore += 5

    // 感情記録の充実度
    if (emotionPosts.length > 0) healthScore += 10

    healthScore = Math.min(100, healthScore)

    // アドバイスの生成
    const recommendations = generateRecommendations(mealPosts, poopPosts, emotionPosts, averageMealsPerDay, averagePoopsPerDay)
    const alerts = generateAlerts(mealPosts, poopPosts, emotionPosts, averageMealsPerDay, averagePoopsPerDay)

    return {
      period: period === 'week' ? '1週間' : period === 'month' ? '1ヶ月' : '3ヶ月',
      mealCount: mealPosts.length,
      poopCount: poopPosts.length,
      emotionCount: emotionPosts.length,
      averageMealsPerDay,
      averagePoopsPerDay,
      consistency: Math.round((posts.length / days) * 100),
      moodTrend: analyzeMoodTrend(emotionPosts),
      healthScore,
      recommendations,
      alerts
    }
  }, [])

  const generateRecommendations = (mealPosts: OtayoriPost[], poopPosts: OtayoriPost[], emotionPosts: OtayoriPost[], avgMeals: number, avgPoops: number): string[] => {
    const recommendations = []

    if (avgMeals < 1) {
      recommendations.push("食事記録を増やして、栄養管理を改善しましょう")
    }
    if (avgPoops < 1) {
      recommendations.push("排泄記録を増やして、健康状態を把握しましょう")
    }
    if (emotionPosts.length === 0) {
      recommendations.push("感情記録を追加して、精神状態を把握しましょう")
    }
    if (mealPosts.length > 0 && poopPosts.length > 0) {
      recommendations.push("記録が充実しています！継続して健康管理を続けましょう")
    }

    return recommendations
  }

  const generateAlerts = (mealPosts: OtayoriPost[], poopPosts: OtayoriPost[], emotionPosts: OtayoriPost[], avgMeals: number, avgPoops: number): string[] => {
    const alerts = []

    if (avgMeals > 5) {
      alerts.push("食事回数が多すぎる可能性があります")
    }
    if (avgPoops > 6) {
      alerts.push("排泄回数が多すぎる可能性があります")
    }

    return alerts
  }

  const analyzeMoodTrend = (emotionPosts: OtayoriPost[]): string => {
    if (emotionPosts.length === 0) return "データ不足"
    
    // 簡易的な感情分析（実際の実装ではより詳細な分析が必要）
    const positiveEmotions = emotionPosts.filter(post => 
      post.content?.includes('楽しい') || 
      post.content?.includes('嬉しい') || 
      post.content?.includes('元気')
    )
    
    const negativeEmotions = emotionPosts.filter(post => 
      post.content?.includes('悲しい') || 
      post.content?.includes('心配') || 
      post.content?.includes('疲れ')
    )
    
    if (positiveEmotions.length > negativeEmotions.length) {
      return "良好"
    } else if (negativeEmotions.length > positiveEmotions.length) {
      return "注意が必要"
    } else {
      return "安定"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">健康レポートを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!selectedDog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏥</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">健康レポート</h2>
          <p className="text-gray-600 mb-6">まずは愛犬を登録して健康管理を始めましょう</p>
          <Link href="/dog/register">
            <span className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity font-semibold shadow-lg">
              わんちゃんを登録する
            </span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Activity className="text-blue-500" size={32} />
            健康レポート
            <Activity className="text-blue-500" size={32} />
          </h1>
          <p className="text-gray-600 mb-4">
            {selectedDog.name}の健康状態をAIが分析します
          </p>
        </div>

        {/* 犬選択 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={selectedDog.image_url || '/images/default-avatar.png'} 
                alt={selectedDog.name} 
                className="w-16 h-16 rounded-full object-cover border-4 border-blue-200" 
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedDog.name}</h2>
                <p className="text-gray-600">{selectedDog.breed}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {dogs.map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => setSelectedDog(dog)}
                  className={`p-2 rounded-full transition-colors ${
                    selectedDog.id === dog.id 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dog.name.charAt(0)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 期間選択 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-500" size={20} />
            分析期間
          </h3>
          <div className="flex gap-4">
            {[
              { key: 'week', label: '1週間', icon: <Clock size={16} /> },
              { key: 'month', label: '1ヶ月', icon: <Calendar size={16} /> },
              { key: 'quarter', label: '3ヶ月', icon: <TrendingUp size={16} /> }
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedPeriod === period.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period.icon}
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {healthData && (
          <>
            {/* 健康スコア */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="text-blue-500" size={20} />
                健康スコア
              </h3>
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{healthData.healthScore}</div>
                      <div className="text-sm text-gray-500">/ 100</div>
                    </div>
                  </div>
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-blue-500"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((healthData.healthScore / 100) * 2 * Math.PI - Math.PI / 2)}% ${50 + 50 * Math.sin((healthData.healthScore / 100) * 2 * Math.PI - Math.PI / 2)}%, 50% 50%)`
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  {healthData.healthScore >= 80 ? '優秀' : 
                   healthData.healthScore >= 60 ? '良好' : 
                   healthData.healthScore >= 40 ? '注意' : '要改善'}
                </p>
              </div>
            </div>

            {/* 統計サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
                <div className="flex items-center gap-3 mb-3">
                  <Bone className="text-orange-500" size={20} />
                  <h4 className="font-semibold text-gray-800">食事記録</h4>
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">{healthData.mealCount}</div>
                <div className="text-sm text-gray-500">
                  1日平均: {healthData.averageMealsPerDay.toFixed(1)}回
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <Bubbles className="text-green-500" size={20} />
                  <h4 className="font-semibold text-gray-800">排泄記録</h4>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">{healthData.poopCount}</div>
                <div className="text-sm text-gray-500">
                  1日平均: {healthData.averagePoopsPerDay.toFixed(1)}回
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="text-pink-500" size={20} />
                  <h4 className="font-semibold text-gray-800">感情記録</h4>
                </div>
                <div className="text-2xl font-bold text-pink-600 mb-1">{healthData.emotionCount}</div>
                <div className="text-sm text-gray-500">
                  気分傾向: {healthData.moodTrend}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="text-purple-500" size={20} />
                  <h4 className="font-semibold text-gray-800">記録一貫性</h4>
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">{healthData.consistency}%</div>
                <div className="text-sm text-gray-500">
                  {healthData.period}の記録率
                </div>
              </div>
            </div>

            {/* AIアドバイス */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 shadow-sm border border-blue-200 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-blue-800">AI健康アドバイス</h3>
              </div>
              
              {healthData.recommendations.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <Award className="text-blue-500" size={16} />
                    推奨事項
                  </h4>
                  <ul className="space-y-2">
                    {healthData.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {healthData.alerts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="text-orange-500" size={16} />
                    注意事項
                  </h4>
                  <ul className="space-y-2">
                    {healthData.alerts.map((alert, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-orange-700">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 今後の機能予告 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Eye className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-purple-800">今後の機能</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl mb-2">🤖</div>
                  <h4 className="font-semibold text-purple-700 mb-2">AI画像分析</h4>
                  <p className="text-sm text-gray-600">写真から健康状態を自動分析</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl mb-2">🏥</div>
                  <h4 className="font-semibold text-purple-700 mb-2">獣医師連携</h4>
                  <p className="text-sm text-gray-600">専門医による詳細アドバイス</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-semibold text-purple-700 mb-2">詳細レポート</h4>
                  <p className="text-sm text-gray-600">より詳細な健康分析レポート</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 