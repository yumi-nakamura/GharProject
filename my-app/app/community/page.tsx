"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { OtayoriRecord } from '@/types/otayori'
import { DogProfile } from '@/types/dog'
import { UserProfile } from '@/types/user'
import { User } from '@supabase/supabase-js'
import LikeButton from '@/components/community/LikeButton'
import { Utensils, Heart, Search, Filter, X, PawPrint } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CommunityPost extends OtayoriRecord {
  dog: DogProfile;
  user: UserProfile;
  likes_count: number;
}

interface AdvancedSearchFilters {
  weightRange: { min: number | null; max: number | null };
  ageRange: { min: number | null; max: number | null };
  dateRange: { from: string | null; to: string | null };
  tags: string[];
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'meal' | 'emotion'>('all')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 18;
  const router = useRouter()
  
  // 検索関連のstate
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>({
    weightRange: { min: null, max: null },
    ageRange: { min: null, max: null },
    dateRange: { from: null, to: null },
    tags: []
  })

  useEffect(() => {
    const supabase = createClient()
    
    // 初期認証状態を取得
    const initializeAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('初期認証状態取得エラー:', error)
        } else {
          console.log('初期認証状態:', user)
          setCurrentUser(user)
        }
        setAuthInitialized(true)
      } catch (error) {
        console.error('初期認証状態取得に失敗:', error)
        setAuthInitialized(true)
      }
    }

    initializeAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('認証状態変更:', event, session?.user)
      setCurrentUser(session?.user || null)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // 認証状態が更新されたら投稿を再取得
        await fetchCommunityPosts(session?.user || null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 認証が初期化されたら投稿を取得
  useEffect(() => {
    if (authInitialized) {
      fetchCommunityPosts(currentUser)
    }
  }, [authInitialized, currentUser])

  const fetchCommunityPosts = async (user: User | null) => {
    // 未認証時はログインページにリダイレクト
    if (!user) {
      router.replace("/login")
      return
    }

    try {
      console.log('コミュニティ投稿取得開始')
      const supabase = createClient()
      
      // 現在のユーザー情報を取得
      const { data: { user: currentAuthUser }, error: authError } = await supabase.auth.getUser()
      console.log('現在の認証ユーザー:', currentAuthUser)
      console.log('認証エラー:', authError)
      
      // 引数で渡されたユーザー情報を使用
      const authUser = user || currentAuthUser
      console.log('使用する認証ユーザー:', authUser)
      
      // おたよりデータを取得（RLSポリシーを考慮）
      console.log('otayoriテーブルからデータ取得中...')
      const { data: otayoriData, error: otayoriError } = await supabase
        .from('otayori')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('otayoriData:', otayoriData)
      console.log('otayoriError:', otayoriError)

      if (otayoriError) {
        console.error('otayori取得エラー:', otayoriError)
        throw otayoriError
      }

      if (!otayoriData || otayoriData.length === 0) {
        console.log('otayoriデータが空です')
        setPosts([])
        setLoading(false)
        return
      }

      // 犬とユーザー情報を取得
      const dogIds = [...new Set(otayoriData.map(post => post.dog_id))]
      const userIds = [...new Set(otayoriData.map(post => post.user_id))]
      
      console.log('dogIds:', dogIds)
      console.log('userIds:', userIds)

      console.log('dogsテーブルからデータ取得中...')
      const { data: dogsData, error: dogsError } = await supabase
        .from('dogs')
        .select('*')
        .in('id', dogIds)

      console.log('dogsData:', dogsData)
      console.log('dogsError:', dogsError)

      if (dogsError) {
        console.error('dogs取得エラー:', dogsError)
        throw dogsError
      }

      console.log('user_profilesテーブルからデータ取得中...')
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('user_id', userIds)

      console.log('usersData:', usersData)
      console.log('userIds:', userIds)
      console.log('usersError:', usersError)

      if (usersError) {
        console.error('user_profiles取得エラー:', usersError)
        throw usersError
      }

      // いいね数を取得
      console.log('likesテーブルからデータ取得中...')
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('otayori_id')
        .in('otayori_id', otayoriData.map(post => post.id))

      console.log('likesData:', likesData)
      console.log('likesError:', likesError)

      if (likesError) {
        console.error('likes取得エラー:', likesError)
        throw likesError
      }

      // いいね数をカウント
      const likesCountMap = new Map<string, number>()
      likesData?.forEach(like => {
        const count = likesCountMap.get(like.otayori_id) || 0
        likesCountMap.set(like.otayori_id, count + 1)
      })

      console.log('likesCountMap:', likesCountMap)

      // データをキャメルケースにマッピング
      const combinedPosts: CommunityPost[] = otayoriData.map(post => {
        const dog = dogsData?.find(d => d.id === post.dog_id)
        const user = usersData?.find(u => u.user_id === post.user_id)
        const likes_count = likesCountMap.get(post.id) || 0

        return {
          id: post.id,
          dogId: post.dog_id,
          userId: post.user_id,
          type: post.type,
          content: post.content,
          datetime: post.datetime,
          photoUrl: post.photo_url,
          mood: post.mood,
          tags: post.tags,
          customDatetime: post.custom_datetime,
          poopGuardPassword: post.poop_guard_password,
          isPoopGuarded: post.is_poop_guarded,
          dog,
          user,
          likes_count
        }
      })

      console.log('結合後の投稿データ:', combinedPosts)
      setPosts(combinedPosts)
      setLoading(false)
    } catch (error) {
      console.error('コミュニティ投稿取得エラー:', error)
      setLoading(false)
    }
  }

  // 認証が初期化され、未認証の場合はローディング表示
  if (!authInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-6xl animate-bounce mb-4">🐾</div>
        <div className="text-lg font-semibold text-blue-600">認証確認中...</div>
      </div>
    )
  }

  // ページング用の投稿リスト
  const filteredPosts = posts.filter(post => {
    // poopタイプの投稿は常に除外
    if (post.type === 'poop') return false
    
    // フィルター条件
    if (filter === 'all') {
      // すべての投稿を対象
    } else if (filter === 'meal' && post.type !== 'meal') return false
    else if (filter === 'emotion' && post.type !== 'emotion') return false
    
    // メイン検索（テキストベース）
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchesContent = post.content?.toLowerCase().includes(query)
      const matchesUserName = post.user.name?.toLowerCase().includes(query)
      const matchesDogName = post.dog.name?.toLowerCase().includes(query)
      const matchesBreed = post.dog.breed?.toLowerCase().includes(query)
      const matchesTags = post.tags?.some(tag => tag.toLowerCase().includes(query))
      
      if (!matchesContent && !matchesUserName && !matchesDogName && !matchesBreed && !matchesTags) {
        return false
      }
    }
    
    // 詳細検索フィルター
    if (showAdvancedSearch) {
      // 体重フィルター
      if (advancedFilters.weightRange.min !== null && post.dog.weight) {
        const weight = parseFloat(post.dog.weight.toString())
        if (weight < advancedFilters.weightRange.min) return false
      }
      if (advancedFilters.weightRange.max !== null && post.dog.weight) {
        const weight = parseFloat(post.dog.weight.toString())
        if (weight > advancedFilters.weightRange.max) return false
      }
      
      // 年齢フィルター
      if (advancedFilters.ageRange.min !== null && post.dog.birthday) {
        const age = calculateAge(post.dog.birthday)
        if (age < advancedFilters.ageRange.min) return false
      }
      if (advancedFilters.ageRange.max !== null && post.dog.birthday) {
        const age = calculateAge(post.dog.birthday)
        if (age > advancedFilters.ageRange.max) return false
      }
      
      // 日付フィルター
      if (advancedFilters.dateRange.from && new Date(post.datetime) < new Date(advancedFilters.dateRange.from)) {
        return false
      }
      if (advancedFilters.dateRange.to && new Date(post.datetime) > new Date(advancedFilters.dateRange.to)) {
        return false
      }
      
      // タグフィルター
      if (advancedFilters.tags.length > 0) {
        const hasMatchingTag = advancedFilters.tags.some(filterTag => 
          post.tags?.some(postTag => postTag.toLowerCase().includes(filterTag.toLowerCase()))
        )
        if (!hasMatchingTag) return false
      }
    }
    
    return true
  })
  
  // 年齢計算ヘルパー関数
  const calculateAge = (birthday: string): number => {
    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }
  
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const pagedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return <Utensils className="w-4 h-4 text-orange-500" />
      case 'emotion':
        return <Heart className="w-4 h-4 text-pink-500" />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'meal':
        return 'ごはん'
      case 'emotion':
        return 'きもち'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🐕 わんわんコミュニティ</h1>
          <p className="text-gray-600">みんなの愛犬の様子を見てみよう！</p>
        </div>

        {/* 検索セクション */}
        <div className="mb-8">
          {/* メイン検索ボックス */}
          <div className="relative max-w-md mx-auto mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="🐾 投稿内容、ユーザー名、犬の名前、犬種、タグで検索..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-12 py-3 border border-pink-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm"
              />
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                  showAdvancedSearch 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-pink-100'
                }`}
                title="詳細検索"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 詳細検索パネル */}
          {showAdvancedSearch && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-pink-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-pink-500" />
                  詳細検索
                </h3>
                <button
                  onClick={() => setShowAdvancedSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 体重範囲 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">体重 (kg)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="最小"
                      value={advancedFilters.weightRange.min || ''}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({
                          ...prev,
                          weightRange: { ...prev.weightRange, min: e.target.value ? parseFloat(e.target.value) : null }
                        }))
                        setCurrentPage(1)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <span className="flex items-center text-gray-500">〜</span>
                    <input
                      type="number"
                      placeholder="最大"
                      value={advancedFilters.weightRange.max || ''}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({
                          ...prev,
                          weightRange: { ...prev.weightRange, max: e.target.value ? parseFloat(e.target.value) : null }
                        }))
                        setCurrentPage(1)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* 年齢範囲 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年齢 (歳)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="最小"
                      value={advancedFilters.ageRange.min || ''}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({
                          ...prev,
                          ageRange: { ...prev.ageRange, min: e.target.value ? parseInt(e.target.value) : null }
                        }))
                        setCurrentPage(1)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <span className="flex items-center text-gray-500">〜</span>
                    <input
                      type="number"
                      placeholder="最大"
                      value={advancedFilters.ageRange.max || ''}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({
                          ...prev,
                          ageRange: { ...prev.ageRange, max: e.target.value ? parseInt(e.target.value) : null }
                        }))
                        setCurrentPage(1)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* 投稿日範囲 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">投稿日</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={advancedFilters.dateRange.from || ''}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, from: e.target.value || null }
                        }))
                        setCurrentPage(1)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <span className="flex items-center text-gray-500">〜</span>
                    <input
                      type="date"
                      value={advancedFilters.dateRange.to || ''}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, to: e.target.value || null }
                        }))
                        setCurrentPage(1)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* タグ検索 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
                  <input
                    type="text"
                    placeholder="タグをカンマ区切りで入力"
                    value={advancedFilters.tags.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      setAdvancedFilters(prev => ({ ...prev, tags }))
                      setCurrentPage(1)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* 検索条件クリアボタン */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setAdvancedFilters({
                      weightRange: { min: null, max: null },
                      ageRange: { min: null, max: null },
                      dateRange: { from: null, to: null },
                      tags: []
                    })
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  条件をクリア
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 絞り込みボタン */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => {
              setFilter('all')
              setCurrentPage(1)
            }}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-200'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => {
              setFilter('meal')
              setCurrentPage(1)
            }}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
              filter === 'meal'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-orange-50 border border-orange-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            ごはん
          </button>
          <button
            onClick={() => {
              setFilter('emotion')
              setCurrentPage(1)
            }}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
              filter === 'emotion'
                ? 'bg-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            きもち
          </button>
        </div>

        {/* 検索結果表示 */}
        {(searchQuery || showAdvancedSearch) && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm">
              <Search className="w-4 h-4" />
              <span>
                検索結果: {filteredPosts.length}件
                {searchQuery && ` (キーワード: "${searchQuery}")`}
              </span>
              {(searchQuery || showAdvancedSearch) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowAdvancedSearch(false)
                    setAdvancedFilters({
                      weightRange: { min: null, max: null },
                      ageRange: { min: null, max: null },
                      dateRange: { from: null, to: null },
                      tags: []
                    })
                    setCurrentPage(1)
                  }}
                  className="ml-2 text-pink-500 hover:text-pink-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 投稿一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagedPosts.map((post) => {
            const isOwnPost = currentUser && post.userId === currentUser.id
            return (
              <div
                key={post.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border ${
                  isOwnPost 
                    ? 'border-blue-200 shadow-blue-100' 
                    : 'border-gray-100'
                }`}
              >
                {/* 画像 */}
                {post.photoUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.photoUrl}
                      alt="投稿画像"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      {getTypeIcon(post.type)}
                    </div>
                  </div>
                )}

                {/* コンテンツ */}
                <div className="p-6">
                  {/* ユーザー情報 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {post.user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {post.user.name || '名前未設定'}
                        </p>
                        <p className="text-xs text-gray-500">{post.dog.name}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-400">
                        {new Date(post.datetime).toLocaleDateString('ja-JP')}
                      </span>
                      {currentUser && post.userId === currentUser.id && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          うちのコ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 投稿内容 */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {getTypeLabel(post.type)}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{post.content}</p>
                  </div>

                  {/* タグ */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* いいねボタン */}
                  <div className="flex justify-end">
                    <LikeButton 
                      otayoriId={post.id}
                      initialLikesCount={post.likes_count}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ページング */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >前へ</button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-2 rounded ${currentPage === idx + 1 ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >{idx + 1}</button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >次へ</button>
          </div>
        )}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐕</div>
            <p className="text-gray-600 text-lg">
              {filter === 'all' 
                ? 'まだ投稿がありません' 
                : `まだ${filter === 'meal' ? 'ごはん' : 'きもち'}の投稿がありません`
              }
            </p>
            <p className="text-gray-500 mt-2">最初の投稿をしてみませんか？</p>
          </div>
        )}
      </div>
    </div>
  )
}