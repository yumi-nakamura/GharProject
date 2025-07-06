"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/components/layout/AuthProvider"
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
  AlertTriangle,
  Info,
  Star,
  Smile,
  Utensils,
  Leaf
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import AIAnalysisCard from "@/components/otayori/AIAnalysisCard"
import type { DogImageAnalysisWithOtayori } from '@/types/ai-analysis'

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
  photo_url?: string
  tags?: string[]
  [key: string]: unknown
}

// nullをundefinedに変換するユーティリティ
const nullToUndefined = (v: string | null | undefined): string | undefined => v == null ? undefined : v;

export default function HealthReportPage() {
  const { user, loading: authLoading, initialized } = useAuth()
  const [selectedDog, setSelectedDog] = useState<DogProfile | null>(null)
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week')
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<'poop' | 'meal' | 'emotion'>('meal')
  const [recentPosts, setRecentPosts] = useState<OtayoriPost[]>([])
  const [analysisHistory, setAnalysisHistory] = useState<DogImageAnalysisWithOtayori[]>([])
  const [selectedOtayoriId, setSelectedOtayoriId] = useState<string | undefined>(undefined)
  const [deletedAnalysisOtayoriIds, setDeletedAnalysisOtayoriIds] = useState<Set<string>>(new Set())
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState<string>('')
  const [modalImageAlt, setModalImageAlt] = useState<string>('')

  const fetchRecentPosts = useCallback(async (dogId: string) => {
    try {
      // 分析済みのotayori_idを取得
      const { data: analyzedOtayori, error: analysisError } = await supabase
        .from('ai_analysis')
        .select('otayori_id')
        .not('otayori_id', 'is', null)
      
      if (analysisError) {
        console.error('分析済み投稿ID取得エラー:', analysisError)
        return
      }
      
      const analyzedIds = analyzedOtayori?.map(a => a.otayori_id).filter((id): id is string => id !== null) || []
      console.log('分析済み投稿ID:', analyzedIds)
      
      // 削除された分析結果のotayori_idを除外（再度分析可能にする）
      const activeAnalyzedIds = analyzedIds.filter(id => !deletedAnalysisOtayoriIds.has(id))
      console.log('削除された分析結果を除外後の投稿ID:', activeAnalyzedIds)
      
      // 分析済みでない投稿のみを取得
      let query = supabase
        .from('otayori')
        .select('*')
        .eq('dog_id', dogId)
        .not('photo_url', 'is', null)
        .order('datetime', { ascending: false })
        .limit(20)
      
      if (activeAnalyzedIds.length > 0) {
        query = query.not('id', 'in', `(${activeAnalyzedIds.join(',')})`)
      }
      
      const { data: posts, error } = await query

      if (error) {
        console.error('最近の投稿取得エラー:', error)
        return
      }

      setRecentPosts(posts || [])
    } catch (error) {
      console.error('最近の投稿取得エラー:', error)
    }
  }, [deletedAnalysisOtayoriIds])

  const fetchAnalysisHistory = useCallback(async (dogId: string) => {
    try {
      // まず、この犬に関連するotayori投稿のIDを取得
      const { data: otayoriPosts, error: otayoriError } = await supabase
        .from('otayori')
        .select('id')
        .eq('dog_id', dogId)
      
      if (otayoriError) {
        console.error('otayori投稿取得エラー:', otayoriError)
        return
      }
      
      const otayoriIds = otayoriPosts?.map(post => post.id) || []
      
      if (otayoriIds.length === 0) {
        setAnalysisHistory([])
        return
      }
      
      // AI分析履歴を取得（otayori_idでフィルタリング）
      const { data: history, error } = await supabase
        .from('ai_analysis')
        .select(`
          *,
          otayori:otayori_id (
            id,
            type,
            datetime,
            content,
            photo_url,
            dog_id
          )
        `)
        .in('otayori_id', otayoriIds)
        .not('otayori_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('分析履歴取得エラー:', error)
        setAnalysisHistory([])
        return
      }

      setAnalysisHistory(history || [])
    } catch (error) {
      console.error('分析履歴取得中にエラー:', error)
      setAnalysisHistory([])
    }
  }, [])

  // 分析履歴を即座に更新する関数
  const refreshAnalysisHistory = useCallback(async () => {
    console.log('分析履歴更新開始:', { selectedDog: selectedDog?.id })
    if (selectedDog) {
      await fetchAnalysisHistory(selectedDog.id)
    }
  }, [selectedDog, fetchAnalysisHistory])

  // 画像モーダルを開く関数
  const openImageModal = useCallback((imageUrl: string, analysisType: string) => {
    setModalImageUrl(imageUrl)
    setModalImageAlt(`${analysisType} analysis image`)
    setShowImageModal(true)
  }, [])

  // 画像モーダルを閉じる関数
  const closeImageModal = useCallback(() => {
    setShowImageModal(false)
    setModalImageUrl('')
    setModalImageAlt('')
  }, [])

  // 分析結果を削除する関数
  const deleteAnalysis = useCallback(async (analysisId: string) => {
    try {
      // 削除前にotayori_idを取得
      const { data: analysisData, error: fetchError } = await supabase
        .from('ai_analysis')
        .select('otayori_id')
        .eq('id', analysisId)
        .single()
      
      if (fetchError) {
        console.error('分析結果取得エラー:', fetchError)
        return
      }
      
      const otayoriId = analysisData?.otayori_id
      
      // 分析結果を削除
      const { error } = await supabase
        .from('ai_analysis')
        .delete()
        .eq('id', analysisId)
      
      if (error) {
        console.error('分析結果削除エラー:', error)
        return
      }
      
      // 削除されたotayori_idを記録
      if (otayoriId) {
        setDeletedAnalysisOtayoriIds(prev => new Set([...prev, otayoriId]))
        console.log('削除されたotayori_idを記録:', otayoriId)
      }
      
      // 履歴を更新
      await refreshAnalysisHistory()
      
      // 最近の投稿を再取得（削除された画像が再度表示される）
      if (selectedDog) {
        await fetchRecentPosts(selectedDog.id)
      }
      
      console.log('分析結果を削除しました:', analysisId)
    } catch (error) {
      console.error('分析結果削除エラー:', error)
    }
  }, [refreshAnalysisHistory, selectedDog, fetchRecentPosts])

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

  const fetchHealthData = useCallback(async (dogId: string, period: string) => {
    try {
      const { data: posts, error } = await supabase
        .from('otayori')
        .select('*')
        .eq('dog_id', dogId)
        .gte('datetime', new Date(Date.now() - (period === 'week' ? 7 : period === 'month' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString())
        .order('datetime', { ascending: false })

      if (error) {
        console.error('健康データ取得エラー:', error)
        return
      }

      const healthData = analyzeHealthData(posts || [], period)
      setHealthData(healthData)
    } catch (error) {
      console.error('健康データ取得エラー:', error)
    }
  }, [analyzeHealthData])

  const fetchDogs = useCallback(async () => {
    try {
      if (!user) {
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
          fetchRecentPosts(data[0].id)
        }
      }
    } catch (error) {
      console.error('犬の取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [user, fetchRecentPosts])

  useEffect(() => {
    if (initialized && !authLoading && user) {
      fetchDogs()
    }
  }, [initialized, authLoading, user, fetchDogs])

  useEffect(() => {
    if (selectedDog) {
      fetchHealthData(selectedDog.id, selectedPeriod)
      fetchRecentPosts(selectedDog.id)
      fetchAnalysisHistory(selectedDog.id)
    }
  }, [selectedDog, selectedPeriod, fetchHealthData, fetchRecentPosts, fetchAnalysisHistory])

  const generateRecommendations = (mealPosts: OtayoriPost[], poopPosts: OtayoriPost[], emotionPosts: OtayoriPost[], avgMeals: number, avgPoops: number): string[] => {
    const recommendations = []

    if (avgMeals < 1) {
      recommendations.push("ごはん記録を増やして、栄養管理を改善しましょう")
    }
    if (avgPoops < 1) {
      recommendations.push("うんち記録を増やして、健康状態を把握しましょう")
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
      alerts.push("ごはん回数が多すぎる可能性があります")
    }
    if (avgPoops > 6) {
      alerts.push("うんち回数が多すぎる可能性があります")
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

  const getScoreBarColor = (type: string) => {
    if (type === 'meal') return 'bg-orange-400';
    if (type === 'poop') return 'bg-green-400';
    if (type === 'emotion') return 'bg-pink-400';
    return 'bg-blue-400';
  };

  if (authLoading || !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">認証が必要です</h2>
          <p className="text-gray-600 mb-6">ログインして健康レポートをご利用ください</p>
        </div>
      </div>
    )
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
              <Image 
                src={selectedDog.image_url || '/images/default-avatar.png'} 
                alt={selectedDog.name} 
                width={64}
                height={64}
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
                onClick={() => setSelectedPeriod(period.key as 'week' | 'month' | 'quarter')}
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
                  <h4 className="font-semibold text-gray-800">ごはん記録</h4>
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">{healthData.mealCount}</div>
                <div className="text-sm text-gray-500">
                  1日平均: {healthData.averageMealsPerDay.toFixed(1)}回
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <Bubbles className="text-green-500" size={20} />
                  <h4 className="font-semibold text-gray-800">うんち記録</h4>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Brain className="text-white" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">AI健康アドバイス</h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedAnalysisType('meal')
                      setShowImageSelector(true)
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Brain size={16} />
                    ごはん分析
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAnalysisType('poop')
                      setShowImageSelector(true)
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Brain size={16} />
                    うんち分析
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAnalysisType('emotion')
                      setShowImageSelector(true)
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Brain size={16} />
                    きもち分析
                  </button>
                </div>
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

            {/* AI分析履歴 */}
            {analysisHistory.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-200 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Brain className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">AI分析履歴</h3>
                    <p className="text-sm text-blue-600">わんちゃんの健康管理の記録です 🐕</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {analysisHistory.slice(0, 6).map((analysis) => {
                    const imageUrl = String((nullToUndefined(analysis.image_url) ?? nullToUndefined(analysis.otayori?.photo_url as string | null | undefined)) || '');
                    return (
                      <div key={analysis.id} className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                          {/* 画像＋詳細情報 横並び */}
                          <div className="relative flex-shrink-0">
                            <div className="relative">
                              {imageUrl && (
                                <Image
                                  src={imageUrl}
                                  alt={`${analysis.analysis_type} analysis image`}
                                  width={112}
                                  height={112}
                                  className="w-28 h-28 object-cover rounded-lg border"
                                  style={{ background: "#eee", display: "block" }}
                                  onError={() => {
                                    // Next.js ImageコンポーネントではonErrorは使用できないため、
                                    // エラーハンドリングは別途実装が必要
                                  }}
                                />
                              )}
                              
                              {/* うんち画像の時はBubbleアイコンで大きく隠す */}
                              {analysis.analysis_type === 'poop' && (
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-100/90 via-pink-50/90 to-yellow-50/90 rounded-lg flex flex-col items-center justify-center">
                                  <Bubbles className="text-white/80 w-20 h-20" strokeWidth={1.5} />
                                </div>
                              )}
                              
                              {/* 画像確認ボタン（写真に重ならない位置に配置） */}
                              <button
                                onClick={() => openImageModal(imageUrl, analysis.analysis_type)}
                                className="absolute -top-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-colors z-10"
                                title="画像を確認する"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {/* 詳細情報 */}
                          <div className="flex-1 min-w-0">
                            {/* 健康スコアの視覚的表示 */}
                            <div className="mb-2">
                              <div className="flex items-center gap-2 mb-1">
                                <Star className="text-yellow-400 w-4 h-4" />
                                <span className="text-xs font-medium text-gray-600">健康スコア</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${getScoreBarColor(analysis.analysis_type)}`}
                                    style={{ width: `${analysis.health_score * 10}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm font-bold text-gray-700">{analysis.health_score}/10</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {analysis.health_score >= 8 ? '🌟 優秀' : analysis.health_score >= 6 ? '👍 良好' : '⚠️ 要改善'}
                              </div>
                            </div>
                            {/* 詳細情報 */}
                            {analysis.details && (
                              <div className="mb-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <Info className="text-blue-400 w-4 h-4" />
                                  <span className="text-sm font-medium text-gray-700">詳細情報</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {analysis.details.color && (
                                    <div className="flex items-center gap-1">
                                      <Leaf className="text-green-400 w-3 h-3" />
                                      <span className="text-gray-500">色:</span>
                                      <span className="text-gray-700">{analysis.details.color}</span>
                                    </div>
                                  )}
                                  {analysis.details.consistency && (
                                    <div className="flex items-center gap-1">
                                      <Utensils className="text-orange-400 w-3 h-3" />
                                      <span className="text-gray-500">状態:</span>
                                      <span className="text-gray-700">{analysis.details.consistency}</span>
                                    </div>
                                  )}
                                  {analysis.details.amount && (
                                    <div className="flex items-center gap-1">
                                      <Star className="text-yellow-400 w-3 h-3" />
                                      <span className="text-gray-500">量:</span>
                                      <span className="text-gray-700">{analysis.details.amount}</span>
                                    </div>
                                  )}
                                  {analysis.details.appetite && (
                                    <div className="flex items-center gap-1">
                                      <Utensils className="text-orange-400 w-3 h-3" />
                                      <span className="text-gray-500">食欲:</span>
                                      <span className="text-gray-700">{analysis.details.appetite}</span>
                                    </div>
                                  )}
                                  {analysis.details.mood && (
                                    <div className="flex items-center gap-1">
                                      <Smile className="text-pink-400 w-3 h-3" />
                                      <span className="text-gray-500">機嫌:</span>
                                      <span className="text-gray-700">{analysis.details.mood}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 観察結果 */}
                        {analysis.observations && analysis.observations.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-green-500">🔍</span>
                              <span className="text-sm font-medium text-gray-700">観察結果</span>
                            </div>
                            <div className="space-y-1">
                              {analysis.observations.map((observation: string, index: number) => (
                                <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-green-400 mt-1">•</span>
                                  <span>{observation}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 推奨事項 */}
                        {analysis.recommendations && analysis.recommendations.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-blue-500">💡</span>
                              <span className="text-sm font-medium text-gray-700">推奨事項</span>
                            </div>
                            <div className="space-y-1">
                              {analysis.recommendations.slice(0, 2).map((recommendation: string, index: number) => (
                                <div key={index} className="text-sm text-blue-600 flex items-start gap-2">
                                  <span className="text-blue-400 mt-1">•</span>
                                  <span>{recommendation}</span>
                                </div>
                              ))}
                              {analysis.recommendations.length > 2 && (
                                <div className="text-xs text-blue-400 italic">
                                  他 {analysis.recommendations.length - 2} 件の推奨があります
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 注意事項 */}
                        {analysis.warnings && analysis.warnings.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-orange-500">⚠️</span>
                              <span className="text-sm font-medium text-gray-700">注意事項</span>
                            </div>
                            <div className="space-y-1">
                              {analysis.warnings.slice(0, 2).map((warning: string, index: number) => (
                                <div key={index} className="text-sm text-orange-600 flex items-start gap-2">
                                  <span className="text-orange-400 mt-1">•</span>
                                  <span>{warning}</span>
                                </div>
                              ))}
                              {analysis.warnings.length > 2 && (
                                <div className="text-xs text-orange-400 italic">
                                  他 {analysis.warnings.length - 2} 件の注意事項があります
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 励ましの言葉 */}
                        {analysis.encouragement && (
                          <div className="border-t pt-3">
                            <div className="flex items-start gap-2">
                              <span className="text-pink-400 text-lg">💝</span>
                              <div className="flex-1">
                                <div className="text-xs font-medium text-pink-600 mb-1">メッセージ</div>
                                <div className="text-sm text-pink-700 leading-relaxed">
                                  {analysis.encouragement}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 記録日と分析日 */}
                        <div className="border-t pt-3 mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <span className="text-pink-400">📝</span>
                              <span className="text-gray-400 mr-1">{selectedDog?.name}</span>
                              <span>記録日: {analysis.otayori?.datetime ? new Date(analysis.otayori.datetime).toLocaleDateString('ja-JP', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '不明'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-blue-400">🤖</span>
                              <span>分析日: {new Date(analysis.created_at).toLocaleDateString('ja-JP', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                        </div>

                        {/* 削除ボタン */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => deleteAnalysis(analysis.id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                            title="この分析結果を削除"
                          >
                            <span>🗑️</span>
                            <span>削除</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* 履歴の統計情報 */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{analysisHistory.length}</div>
                      <div className="text-xs text-gray-500">総分析回数</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(analysisHistory.reduce((sum, a) => sum + a.health_score, 0) / analysisHistory.length)}
                      </div>
                      <div className="text-xs text-gray-500">平均スコア</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        {analysisHistory.filter(a => a.health_score >= 8).length}
                      </div>
                      <div className="text-xs text-gray-500">優秀回数</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI分析履歴が空の場合 */}
            {analysisHistory.length === 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-200 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Brain className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">AI分析履歴</h3>
                    <p className="text-sm text-blue-600">わんちゃんの健康管理の記録です 🐕</p>
                  </div>
                </div>
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-gray-600 mb-4">まだAI分析の履歴がありません</p>
                  <p className="text-sm text-gray-500">上記の分析ボタンから分析を開始してください</p>
                </div>
              </div>
            )}

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
                  <div className="text-2xl mb-2">🏥</div>
                  <h4 className="font-semibold text-purple-700 mb-2">獣医師連携</h4>
                  <p className="text-sm text-gray-600">専門医による詳細アドバイス</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-semibold text-purple-700 mb-2">詳細レポート</h4>
                  <p className="text-sm text-gray-600">より詳細な健康分析レポート</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl mb-2">🔔</div>
                  <h4 className="font-semibold text-purple-700 mb-2">緊急アラート</h4>
                  <p className="text-sm text-gray-600">異常値検出時の通知機能</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 画像選択モーダル */}
      {showImageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedAnalysisType === 'meal' ? 'ごはん' : selectedAnalysisType === 'poop' ? 'うんち' : 'きもち'}画像を選択
              </h3>
              <button
                onClick={() => setShowImageSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📷</div>
                <p className="text-gray-600 mb-4">画像付きの投稿がありません</p>
                <p className="text-sm text-gray-500">まずは投稿に画像を追加してください</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {recentPosts
                  .filter(post => post.type === selectedAnalysisType)
                  .map((post) => (
                    <div
                      key={post.id}
                      onClick={() => {
                        setSelectedImageUrl(String(nullToUndefined(post.photo_url as string | null | undefined) || ''));
                        setSelectedOtayoriId(post.id ?? undefined);
                        setShowImageSelector(false);
                        setShowAIAnalysis(true);
                      }}
                      className="cursor-pointer group"
                    >
                      <Image
                        src={post.photo_url || ''}
                        alt={`${post.type} image`}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded border"
                        style={{ background: "#eee", display: "block" }}
                      />
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        {new Date(post.datetime).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI分析モーダル */}
      {showAIAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">AI健康分析</h3>
              <button
                onClick={() => setShowAIAnalysis(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <AIAnalysisCard
              imageUrl={selectedImageUrl}
              analysisType={selectedAnalysisType}
              otayoriId={selectedOtayoriId}
              onAnalysisComplete={async () => {
                // health-reportページでは保存ボタン押下時に直接保存されるため、
                // ここでは何もしない（重複を防ぐため）
              }}
            />
          </div>
        </div>
      )}

      {/* 画像確認モーダル */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">画像確認</h3>
              <button
                onClick={closeImageModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src={modalImageUrl}
                  alt={modalImageAlt}
                  width={800}
                  height={600}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  style={{ background: "#f8f9fa" }}
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={closeImageModal}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 