"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { OtayoriRecord } from '@/types/otayori'
import { DogProfile } from '@/types/dog'
import { UserProfile } from '@/types/user'
import LikeButton from '@/components/community/LikeButton'
import { Utensils, Heart } from 'lucide-react'

interface CommunityPost extends OtayoriRecord {
  dog: DogProfile;
  user: UserProfile;
  likes_count: number;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'meal' | 'emotion'>('all')

  useEffect(() => {
    fetchCommunityPosts()
  }, [])

  const fetchCommunityPosts = async () => {
    try {
      console.log('コミュニティ投稿取得開始')
      const supabase = createClient()
      
      // おたよりデータを取得
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
        .in('id', userIds)

      console.log('usersData:', usersData)
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
        const user = usersData?.find(u => u.id === post.user_id)
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
          poopGuardPassword: post.poop_guard_password,
          isPoopGuarded: post.is_poop_guarded,
          customDatetime: post.custom_datetime,
          dog: dog || { id: '', name: '', breed: '', ownerId: '', avatarUrl: '', birthday: '' },
          user: user || { id: '', user_id: '', name: '', email: '', avatar_url: '', comment: '', created_at: '' },
          likes_count
        }
      })

      console.log('combinedPosts:', combinedPosts)
      setPosts(combinedPosts)
      console.log('投稿設定完了')
    } catch (error) {
      console.error('コミュニティ投稿の取得に失敗しました:', error)
    } finally {
      console.log('loadingをfalseに設定')
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true
    if (filter === 'meal') return post.type === 'meal'
    if (filter === 'emotion') return post.type === 'emotion'
    return true
  })

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

        {/* 絞り込みボタン */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-200'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('meal')}
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
            onClick={() => setFilter('emotion')}
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

        {/* 投稿一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
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
                      <p className="font-medium text-gray-800">{post.user.name || '匿名ユーザー'}</p>
                      <p className="text-xs text-gray-500">{post.dog.name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(post.datetime).toLocaleDateString('ja-JP')}
                  </span>
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
          ))}
        </div>

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