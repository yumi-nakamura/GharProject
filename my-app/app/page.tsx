"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { DogProfile } from "@/types/dog"
import { ChevronLeft, ChevronRight, Heart, BarChart2, MessageSquare, Bone, Bubbles, Activity, Plus, Clock } from "lucide-react"
import Link from "next/link"

const supabase = createClient()

interface DogStats {
  lastPostTime: string | null
  todayPosts: number
  weeklyPosts: number
  monthlyPosts: number
  streakDays: number
  mealCount: number
  poopCount: number
  emotionCount: number
}

export default function HomePage() {
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [selectedDogIndex, setSelectedDogIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dogStats, setDogStats] = useState<DogStats | null>(null)

  const selectedDog = dogs[selectedDogIndex] || null

  useEffect(() => {
    const fetchDogs = async () => {
      setLoading(true)
      const { data: session } = await supabase.auth.getUser()
      const userId = session?.user?.id
      if (!userId) {
        setLoading(false)
        return
      }

      const { data: rels } = await supabase.from('dog_user_relations').select('dog_id').eq('user_id', userId)
      const dogIdsFromRels = rels?.map(r => r.dog_id) || []
      const { data: dogsFromOwnerId } = await supabase.from('dogs').select('id').eq('owner_id', userId)
      const dogIdsFromOwner = dogsFromOwnerId?.map(d => d.id) || []
      const allDogIds = [...new Set([...dogIdsFromRels, ...dogIdsFromOwner])]

      if (allDogIds.length > 0) {
        const { data, error } = await supabase.from("dogs").select("*").in('id', allDogIds).or('is_deleted.is.null,is_deleted.eq.false').order('created_at', { ascending: false })
        if (error) console.error('犬の取得エラー:', error)
        else if (data) {
          setDogs(data)
          if (data.length > 0) {
            await fetchDogStats(data[0].id)
          }
        }
      }
      setLoading(false)
    }
    fetchDogs()
  }, [])

  const fetchDogStats = async (dogId: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // 今日の投稿
    const { data: todayData } = await supabase
      .from('otayori')
      .select('*')
      .eq('dog_id', dogId)
      .gte('datetime', today.toISOString())

    // 今週の投稿
    const { data: weeklyData } = await supabase
      .from('otayori')
      .select('*')
      .eq('dog_id', dogId)
      .gte('datetime', weekAgo.toISOString())

    // 今月の投稿
    const { data: monthlyData } = await supabase
      .from('otayori')
      .select('*')
      .eq('dog_id', dogId)
      .gte('datetime', monthAgo.toISOString())

    // 最後の投稿
    const { data: lastPost } = await supabase
      .from('otayori')
      .select('datetime')
      .eq('dog_id', dogId)
      .order('datetime', { ascending: false })
      .limit(1)

    // 連続記録日数を計算（簡易版）
    let streakDays = 0
    if (weeklyData) {
      const dates = [...new Set(weeklyData.map(post => new Date(post.datetime).toDateString()))]
      streakDays = dates.length
    }

    // タイプ別カウント
    const mealCount = todayData?.filter(post => post.type === 'meal').length || 0
    const poopCount = todayData?.filter(post => post.type === 'poop').length || 0
    const emotionCount = todayData?.filter(post => post.type === 'emotion').length || 0

    setDogStats({
      lastPostTime: lastPost?.[0]?.datetime || null,
      todayPosts: todayData?.length || 0,
      weeklyPosts: weeklyData?.length || 0,
      monthlyPosts: monthlyData?.length || 0,
      streakDays,
      mealCount,
      poopCount,
      emotionCount
    })
  }

  const handleDogChange = async (direction: 'prev' | 'next') => {
    if (dogs.length <= 1) return
    const newIndex = direction === 'prev'
      ? (selectedDogIndex - 1 + dogs.length) % dogs.length
      : (selectedDogIndex + 1) % dogs.length
    setSelectedDogIndex(newIndex)
    await fetchDogStats(dogs[newIndex].id)
  }

  const formatTimeAgo = (datetime: string) => {
    const now = new Date()
    const postTime = new Date(datetime)
    const diffMs = now.getTime() - postTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays > 0) return `${diffDays}日前`
    if (diffHours > 0) return `${diffHours}時間前`
    return '数分前'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-6xl animate-bounce mb-4">🐾</div>
        <div className="text-lg font-semibold text-orange-600">わんちゃん情報を読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="p-4 max-w-lg mx-auto space-y-6">
        {/* --- ヘッダーエリア --- */}
        <header className="text-center py-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">OTAYORI</h1>
          <p className="text-sm text-gray-600">愛犬との大切な毎日を記録しよう</p>
        </header>
        
        {selectedDog ? (
          <>
            {/* --- 犬選択カード --- */}
            <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => handleDogChange('prev')} 
                  className="p-2 rounded-full hover:bg-orange-100 transition-colors disabled:opacity-50" 
                  disabled={dogs.length <= 1}
                >
                  <ChevronLeft className="text-orange-600" />
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800">{selectedDog.name}</h2>
                  <p className="text-sm text-gray-500">{selectedDog.breed}</p>
                </div>
                <button 
                  onClick={() => handleDogChange('next')} 
                  className="p-2 rounded-full hover:bg-orange-100 transition-colors disabled:opacity-50" 
                  disabled={dogs.length <= 1}
                >
                  <ChevronRight className="text-orange-600" />
                </button>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src={selectedDog.image_url || '/images/default-avatar.png'} 
                    alt={selectedDog.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-200 shadow-lg" 
                  />
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white rounded-full p-2">
                    <Heart size={16} fill="white" />
                  </div>
                </div>
              </div>
            </div>

            {/* --- 今日の状態と記録（統合版） --- */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="text-orange-500" />
                  今日の状態
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>最後: {dogStats?.lastPostTime ? formatTimeAgo(dogStats.lastPostTime) : 'なし'}</span>
                </div>
              </div>
              
              {/* 状態サマリー */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard 
                  icon={<Bone />} 
                  label="ごはん" 
                  value={dogStats?.mealCount || 0} 
                />
                <StatCard 
                  icon={<Bubbles />} 
                  label="うんち" 
                  value={dogStats?.poopCount || 0} 
                />
                <StatCard 
                  icon={<Heart />} 
                  label="きもち" 
                  value={dogStats?.emotionCount || 0} 
                />
              </div>

              {/* 今日の記録ボタン */}
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Plus size={16} className="text-orange-500" />
                    今日の記録を追加
                  </h4>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                    今日: {dogStats?.todayPosts || 0}回
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <QuickLogButton 
                    icon={<Bone />} 
                    label="ごはん" 
                    href={`/otayori/new?dog_id=${selectedDog.id}&type=meal`} 
                  />
                  <QuickLogButton 
                    icon={<Bubbles />} 
                    label="うんち" 
                    href={`/otayori/new?dog_id=${selectedDog.id}&type=poop`} 
                  />
                  <QuickLogButton 
                    icon={<Heart />} 
                    label="きもち" 
                    href={`/otayori/new?dog_id=${selectedDog.id}&type=emotion`} 
                  />
                </div>
              </div>
            </div>

            {/* --- 統計情報 --- */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart2 />
                今週の記録
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">{dogStats?.weeklyPosts || 0}</div>
                  <div className="text-sm text-gray-600">今週の記録</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-xl">
                  <div className="text-2xl font-bold text-pink-600">{dogStats?.streakDays || 0}</div>
                  <div className="text-sm text-gray-600">連続記録日</div>
                </div>
              </div>
            </div>

            {/* --- AIからのアドバイス --- */}
            <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-6 rounded-2xl shadow-lg border border-cyan-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <h3 className="font-bold text-cyan-800">今日のアドバイス</h3>
              </div>
              <p className="text-sm text-gray-700">
                {dogStats?.todayPosts === 0 
                  ? "今日はまだ記録がないね！愛犬の様子を記録してみよう！" 
                  : "素晴らしい記録だね！愛犬の健康管理がしっかりできています。"}
              </p>
            </div>

            {/* --- アクションリンク --- */}
            <div className="grid grid-cols-2 gap-4">
              <ActionLink 
                icon={<BarChart2 />} 
                label="健康レポート" 
                href="/health-report" 
                gradient="from-blue-400 to-cyan-400"
              />
              <ActionLink 
                icon={<MessageSquare />} 
                label="タイムライン" 
                href={`/dog/${selectedDog.id}/timeline`} 
                gradient="from-purple-400 to-pink-400"
              />
            </div>
          </>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-orange-100">
            <div className="text-6xl mb-4">🐕</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">おかえりなさい！</h2>
            <p className="text-gray-600 mb-6">さっそく愛犬のプロフィールを登録して、<br/>おたより記録を始めましょう。</p>
            <Link href="/dog/register">
              <span className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity font-semibold shadow-lg">
                わんちゃんを登録する
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// 統計カードコンポーネント
const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
  <div className="text-center p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-center mb-2">{icon}</div>
    <div className="text-xl font-bold text-gray-800 mb-1">{value}</div>
    <div className="text-xs text-gray-500 font-medium">{label}</div>
  </div>
)

// クイック記録ボタンコンポーネント
const QuickLogButton = ({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) => (
  <Link href={href}>
    <span className="flex flex-col items-center justify-center bg-white p-3 rounded-xl hover:shadow-md transition-all cursor-pointer border border-gray-100 hover:border-orange-200 group">
      <div className="w-8 h-8 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <span className="font-medium text-xs text-gray-700">{label}</span>
    </span>
  </Link>
)

// アクションリンクコンポーネント
const ActionLink = ({ icon, label, href, gradient }: { icon: React.ReactNode, label: string, href: string, gradient: string }) => (
  <Link href={href}>
    <span className={`flex items-center justify-center gap-3 bg-gradient-to-r ${gradient} text-white p-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity cursor-pointer`}>
      {icon}
      <span className="font-semibold">{label}</span>
    </span>
  </Link>
)