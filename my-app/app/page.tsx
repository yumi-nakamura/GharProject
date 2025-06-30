"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import { ChevronLeft, ChevronRight, Heart, Bone, Bubbles, Activity, Plus, Shield, Users, Zap, Award, Star, HeartPulse, PawPrint, LayoutDashboard, Dog } from "lucide-react"
import Link from "next/link"

const supabase = createClient()

interface DogProfile {
  id: string
  name: string
  breed: string
  image_url?: string
  birthday?: string
}

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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('認証チェック開始...')
        const result = await supabase.auth.getUser()
        console.log('getUser返り値:', result)
        const { data: { user } } = result
        console.log('認証結果:', { user: !!user })
        setIsLoggedIn(!!user)
        setCurrentUser(user)
      } catch (error) {
        console.error('認証チェックでエラーが発生:', error)
        setIsLoggedIn(false)
      } finally {
        console.log('認証チェック完了、ローディング終了')
        setLoading(false)
        setAuthInitialized(true)
      }
    }

    checkAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('認証状態変更:', event, session?.user)
      setCurrentUser(session?.user || null)
      setIsLoggedIn(!!session?.user)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // 認証状態が更新されたら投稿を再取得
        await fetchCommunityPosts(session?.user || null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (authInitialized && currentUser) {
      fetchCommunityPosts(currentUser)
    }
  }, [authInitialized, currentUser])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
        <div className="text-6xl animate-bounce mb-4">🐾</div>
        <div className="text-lg font-semibold text-orange-600">読み込み中...</div>
      </div>
    )
  }

  // ログイン済みの場合はダッシュボードにリダイレクト
  if (isLoggedIn) {
    return <Dashboard />
  }

  // 未ログイン時はランディングページを表示
  return <LandingPage />
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      {/* ヘッダー */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-orange-400/20"></div>
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="text-6xl animate-bounce">🐾</div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              OTAYORI
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              愛犬との大切な毎日を、もっと楽しく、もっと深く記録しよう
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="group">
                <button className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  <Plus size={20} />
                  無料で始める
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/login">
                <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200">
                  ログイン
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインビジュアル */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-pink-100 transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">写真で記録</h3>
              <p className="text-gray-600">愛犬の表情や行動を写真と一緒に残そう</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-orange-100 transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">健康管理</h3>
              <p className="text-gray-600">食事や排泄の記録で健康状態を把握</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-yellow-100 transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">💝</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">思い出の宝箱</h3>
              <p className="text-gray-600">大切な瞬間を時系列で振り返り</p>
            </div>
          </div>
        </div>
      </section>

      {/* なぜOTAYORIを使うべきか */}
      <section className="py-16 px-4 bg-white/40">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              すべての飼い主さんが使うべき理由
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              愛犬との関係をより深く、より楽しくするための機能が満載です
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Heart className="text-pink-500" size={24} />}
              title="愛情の記録"
              description="愛犬への想いを形に残し、振り返ることで絆を深めます"
              color="pink"
            />
            <FeatureCard 
              icon={<Shield className="text-blue-500" size={24} />}
              title="健康管理"
              description="食事や排泄の記録で、愛犬の健康状態を把握できます"
              color="blue"
            />
            <FeatureCard 
              icon={<Users className="text-green-500" size={24} />}
              title="AI健康アドバイス"
              description="記録データを分析し、AIが愛犬の健康状態をアドバイスします"
              color="green"
            />
            <FeatureCard 
              icon={<Zap className="text-yellow-500" size={24} />}
              title="簡単操作"
              description="直感的な操作で、忙しい毎日でも簡単に記録できます"
              color="yellow"
            />
            <FeatureCard 
              icon={<Award className="text-purple-500" size={24} />}
              title="実績システム"
              description="記録を続けることで、楽しい実績を獲得できます"
              color="purple"
            />
            <FeatureCard 
              icon={<Star className="text-orange-500" size={24} />}
              title="思い出の宝箱"
              description="時系列で振り返り、愛犬との成長を実感できます"
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              豊富な機能で愛犬との毎日を彩る
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              記録から分析まで、愛犬との生活をサポートする機能をご紹介
            </p>
          </div>

          <div className="space-y-12">
            <FeatureSection 
              title="📝 おたより記録"
              subtitle="愛犬の日常を楽しく記録"
              description="食事、排泄、感情など、愛犬の様子を写真と一緒に記録できます。タグ付け機能で後から検索しやすく、思い出を整理できます。"
              features={[
                "写真付き記録",
                "タグ付け機能", 
                "感情記録",
                "食事・排泄管理"
              ]}
              image="🍖"
              reverse={false}
            />

            <FeatureSection 
              title="🤖 AI健康アドバイス"
              subtitle="AIが愛犬の健康をサポート"
              description="記録したデータを分析し、愛犬の健康状態を可視化します。AIが健康アドバイスを提供し、より良いケアをサポートします。"
              features={[
                "健康スコア算出",
                "AI健康アドバイス",
                "統計分析",
                "傾向グラフ"
              ]}
              image="🤖"
              reverse={false}
            />

            <FeatureSection 
              title="👥 おともだちのOTAYORI"
              subtitle="他のわんちゃんの様子も見てみよう"
              description="他の愛犬家の投稿を見て、愛犬との生活の参考にできます。うんち以外の記録を共有し、愛犬との生活をより豊かにします。"
              features={[
                "投稿閲覧",
                "参考情報",
                "生活のヒント",
                "わんちゃん情報"
              ]}
              image="🐕"
              reverse={true}
            />
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-16 px-4 bg-gradient-to-r from-pink-500 to-orange-500">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            今すぐ始めて、愛犬との思い出を残そう
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            無料で始められるOTAYORIで、愛犬との毎日をより楽しく、より深く記録しませんか？
          </p>
          <Link href="/signup" className="group">
            <button className="bg-white text-pink-600 px-10 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto">
              <Plus size={24} />
              無料でサインアップ
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <p className="text-white/80 mt-4 text-sm">
            登録は3分で完了。今すぐ愛犬との新しい記録を始めましょう！
          </p>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-8 px-4 bg-gray-800 text-white">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">
            © 2025 OTAYORI. 愛犬との思い出を大切に。
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  const colorClasses = {
    pink: 'border-pink-200 hover:border-pink-300',
    blue: 'border-blue-200 hover:border-blue-300',
    green: 'border-green-200 hover:border-green-300',
    yellow: 'border-yellow-200 hover:border-yellow-300',
    purple: 'border-purple-200 hover:border-purple-300',
    orange: 'border-orange-200 hover:border-orange-300'
  }

  return (
    <div className={`bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border-2 ${colorClasses[color as keyof typeof colorClasses]} transform hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function FeatureSection({ title, subtitle, description, features, image, reverse }: {
  title: string
  subtitle: string
  description: string
  features: string[]
  image: string
  reverse: boolean
}) {
  return (
    <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
      <div className="flex-1">
        <h3 className="text-3xl font-bold text-gray-800 mb-2">{title}</h3>
        <h4 className="text-xl text-gray-600 mb-4">{subtitle}</h4>
        <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-gray-700">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="text-8xl animate-pulse">{image}</div>
      </div>
    </div>
  )
}

// ログイン済みユーザー向けのダッシュボード（既存のコードを再利用）
function Dashboard() {
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
      const dogIdsFromRels = rels?.map((r: { dog_id: string }) => r.dog_id) || []
      const { data: dogsFromOwnerId } = await supabase.from('dogs').select('id').eq('owner_id', userId)
      const dogIdsFromOwner = dogsFromOwnerId?.map((d: { id: string }) => d.id) || []
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

    const { data: todayData } = await supabase
      .from('otayori')
      .select('*')
      .eq('dog_id', dogId)
      .gte('datetime', today.toISOString())

    const { data: weeklyData } = await supabase
      .from('otayori')
      .select('*')
      .eq('dog_id', dogId)
      .gte('datetime', weekAgo.toISOString())

    const { data: monthlyData } = await supabase
      .from('otayori')
      .select('*')
      .eq('dog_id', dogId)
      .gte('datetime', monthAgo.toISOString())

    const { data: lastPost } = await supabase
      .from('otayori')
      .select('datetime')
      .eq('dog_id', dogId)
      .order('datetime', { ascending: false })
      .limit(1)

    let streakDays = 0
    if (weeklyData) {
      const dates = [...new Set(weeklyData.map((post: { datetime: string }) => new Date(post.datetime).toDateString()))]
      streakDays = dates.length
    }

    const mealCount = todayData?.filter((post: { type: string }) => post.type === 'meal').length || 0
    const poopCount = todayData?.filter((post: { type: string }) => post.type === 'poop').length || 0
    const emotionCount = todayData?.filter((post: { type: string }) => post.type === 'emotion').length || 0

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
        <div className="text-6xl animate-bounce mb-4">🐾</div>
        <div className="text-lg font-semibold text-orange-600">わんちゃん情報を読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <header className="text-center py-4">
          <div className="flex justify-center mb-2">
            <div className="text-4xl animate-bounce">🐾</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">OTAYORI</h1>
          <p className="text-sm text-gray-600">愛犬との大切な毎日を記録しよう</p>
        </header>
        
        {selectedDog ? (
          <>
            {/* わんちゃん選択カード */}
            <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-pink-200 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => handleDogChange('prev')} 
                  className="p-2 rounded-full hover:bg-pink-100 transition-colors disabled:opacity-50" 
                  disabled={dogs.length <= 1}
                >
                  <ChevronLeft className="text-pink-600" />
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800">{selectedDog.name}</h2>
                  <p className="text-sm text-gray-500">{selectedDog.breed}</p>
                </div>
                <button 
                  onClick={() => handleDogChange('next')} 
                  className="p-2 rounded-full hover:bg-pink-100 transition-colors disabled:opacity-50" 
                  disabled={dogs.length <= 1}
                >
                  <ChevronRight className="text-pink-600" />
                </button>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src={selectedDog.image_url || '/images/default-avatar.png'} 
                    alt={selectedDog.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-pink-200 shadow-lg" 
                  />
                  <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full p-2 animate-pulse">
                    <Heart size={16} fill="white" />
                  </div>
                </div>
              </div>
            </div>

            {/* 今日の記録 */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-orange-200 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="text-orange-500" />
                  今日の記録
                </h3>
                <Link href="/otayori/new" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-2 rounded-full hover:shadow-lg transform hover:scale-110 transition-all duration-300">
                  <Plus size={20} />
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard icon={<Bone className="text-orange-500" />} label="ごはん" value={dogStats?.mealCount || 0} />
                <StatCard icon={<Bubbles className="text-green-500" />} label="うんち" value={dogStats?.poopCount || 0} />
                <StatCard icon={<Heart className="text-pink-500" />} label="きもち" value={dogStats?.emotionCount || 0} />
              </div>

              <div className="space-y-3">
                <QuickLogButton icon={<Bone className="text-orange-500" />} label="ごはんを記録" href="/otayori/new?type=meal" />
                <QuickLogButton icon={<Bubbles className="text-green-500" />} label="うんちを記録" href="/otayori/new?type=poop" />
                <QuickLogButton icon={<Heart className="text-pink-500" />} label="きもちを記録" href="/otayori/new?type=emotion" />
              </div>
            </div>

            {/* アクションリンク */}
            <div className="grid grid-cols-2 gap-4">
              <ActionLink 
                icon={<HeartPulse className="w-6 h-6 text-white" />} 
                label="健康レポート" 
                href="/health-report" 
                gradient="from-blue-500 to-cyan-500" 
              />
              <ActionLink 
                icon={<Dog className="w-6 h-6 text-white" />} 
                label="おともだち" 
                href="/community" 
                gradient="from-green-500 to-emerald-500" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ActionLink 
                icon={<PawPrint className="w-6 h-6 text-white" />} 
                label="タイムライン" 
                href={`/dog/${selectedDog.id}/timeline`} 
                gradient="from-purple-500 to-pink-500" 
              />
              <ActionLink 
                icon={<LayoutDashboard className="w-6 h-6 text-white" />} 
                label="OTAYORI profile" 
                href="/profile" 
                gradient="from-indigo-500 to-blue-500" 
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-bounce">🐕</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">わんちゃんを登録しましょう</h2>
            <p className="text-gray-600 mb-6">愛犬の情報を登録して、OTAYORIを始めましょう</p>
            <Link href="/dog/register">
              <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                わんちゃんを登録
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
  <div className="text-center p-3 bg-gradient-to-br from-white to-pink-50 rounded-xl border-2 border-pink-100 transform hover:scale-105 transition-all duration-300">
    <div className="flex justify-center mb-1">{icon}</div>
    <div className="text-lg font-bold text-gray-800">{value}</div>
    <div className="text-xs text-gray-600">{label}</div>
  </div>
)

const QuickLogButton = ({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) => (
  <Link href={href}>
    <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-white to-orange-50 rounded-xl border-2 border-orange-100 hover:shadow-lg transform hover:scale-105 transition-all duration-300">
      {icon}
      <span className="text-gray-700 font-medium">{label}</span>
    </button>
  </Link>
)

const ActionLink = ({ icon, label, href, gradient }: { icon: React.ReactNode, label: string, href: string, gradient: string }) => (
  <Link href={href}>
    <button className={`w-full p-4 bg-gradient-to-r ${gradient} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3`}>
      {icon}
      {label}
    </button>
  </Link>
)

function fetchCommunityPosts(user: User | null) {
  // 引数で渡されたユーザー情報を使用
  const authUser = user
  // 認証ユーザー情報を確実に使用
  console.log('コミュニティ投稿取得:', authUser)
}