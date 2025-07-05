// otayori/Card.tsx
import PoopImageGuard from "@/components/otayori/PoopImageGuard"
import type { OtayoriRecord } from "@/types/otayori"
import type { DogProfile } from "@/types/dog"
import { LucideSmile, LucideTag, LucideClock, Brain, X } from "lucide-react"
import { useState } from "react"
import AIAnalysisCard from "./AIAnalysisCard"
import Image from "next/image"

interface OtayoriCardProps {
  post: OtayoriRecord
  dog: DogProfile | null
  isAnalyzed?: boolean // 分析済みかどうかのフラグ
}

export function OtayoriCard({ post, dog, isAnalyzed = false }: OtayoriCardProps) {
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  
  // プープバッグのパスワードを決定
  // 投稿時に設定されたパスワードがある場合はそれを使用、なければ誕生日から生成
  const getPassword = () => {
    if (post.poopGuardPassword) {
      return post.poopGuardPassword
    }
    // 誕生日からパスワードを生成（例：2020年4月15日 → 20200415）
    if (dog?.birthday) {
      const birthDate = new Date(dog.birthday)
      const password = birthDate.getFullYear().toString() + 
             String(birthDate.getMonth() + 1).padStart(2, '0') + 
             String(birthDate.getDate()).padStart(2, '0')
      return password
    }
    return ""
  }

  // 表示する日時を決定（カスタム日時があればそれを使用、なければ投稿日時）
  const displayDatetime = post.customDatetime || post.datetime

  // 日本時間に変換して表示
  const formatJapanTime = (isoString: string) => {
    const date = new Date(isoString)
    // UTC時刻を日本時間（JST）に変換
    const japanTime = new Date(date.getTime() + (9 * 60 * 60 * 1000))
    return japanTime.toLocaleString('ja-JP')
  }

  // カスタム日時かどうかを判定（未来の日時で現在時刻との差が5分以上の場合を予約投稿とする）
  const isScheduledPost = () => {
    if (!post.customDatetime) return false
    const customTime = new Date(post.customDatetime)
    const currentTime = new Date()
    // 未来の日時で、現在時刻との差が5分以上の場合のみ予約投稿とする
    return customTime > currentTime && (customTime.getTime() - currentTime.getTime()) > 5 * 60 * 1000
  }

  // AI分析ボタンを表示するかどうかを判定
  const shouldShowAnalysisButton = () => {
    return post.photo_url && post.photo_url.trim() !== '' && !isAnalyzed
  }

  // 有効な画像URLかどうかを判定
  const isValidImageUrl = (url: string) => {
    if (!url || url.trim() === '') return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="border rounded-2xl p-4 space-y-2 bg-gradient-to-br from-yellow-50 to-pink-50 shadow-md hover:shadow-lg transition-all">
      <div className="flex items-center justify-between text-xs text-gray-500 gap-1 mb-1">
        <div className="flex items-center gap-1">
          <LucideClock size={14} className="text-orange-400" />
          {formatJapanTime(displayDatetime)}
          {isScheduledPost() && (
            <span className="text-orange-600 font-medium">（予約投稿）</span>
          )}
        </div>
        {dog?.name && (
          <div className="text-orange-600 font-medium">
            🐕 {dog.name}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-md font-semibold">
        {post.type === 'meal' ? '🍚 ごはん' : post.type === 'poop' ? (
          <span className="flex items-center gap-1">
            <span className="text-lg">🎁</span>
            <span>うんち（プープバッグ）</span>
          </span>
        ) : '😊 きもち'}
        {post.mood && (
          <span className="flex items-center gap-1 text-pink-500 text-xs ml-2">
            <LucideSmile size={14} />{post.mood}
          </span>
        )}
      </div>
      {post.type === 'poop' && post.isPoopGuarded && post.photo_url && isValidImageUrl(post.photo_url) ? (
        <div className="relative">
          <PoopImageGuard imageUrl={post.photo_url} expectedPassword={getPassword()} dogName={dog?.name || "わんちゃん"} />
          {/* プープバッグ画像にもAI分析ボタンを追加 */}
          {shouldShowAnalysisButton() && (
            <button
              onClick={() => setShowAIAnalysis(true)}
              className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors z-10"
              title="AI健康分析"
            >
              <Brain size={16} />
            </button>
          )}
        </div>
      ) : post.type === 'poop' ? (
        // うんち投稿でプープバッグが設定されていない場合も保護
        post.photo_url && isValidImageUrl(post.photo_url) ? (
          <div className="relative">
            <PoopImageGuard imageUrl={post.photo_url} expectedPassword={getPassword()} dogName={dog?.name || "わんちゃん"} />
            {/* プープバッグ画像にもAI分析ボタンを追加 */}
            {shouldShowAnalysisButton() && (
              <button
                onClick={() => setShowAIAnalysis(true)}
                className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors z-10"
                title="AI健康分析"
              >
                <Brain size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 border-2 border-dashed border-yellow-300 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 text-center">
            <div className="text-4xl mb-2">💩</div>
            <p className="text-sm text-yellow-700">うんちの記録（画像なし）</p>
          </div>
        )
      ) : post.photo_url && isValidImageUrl(post.photo_url) ? (
        <div className="relative">
          <Image 
            src={post.photo_url} 
            alt="OTAYORI画像" 
            width={400}
            height={200}
            className="w-full max-h-48 object-cover rounded-xl border" 
          />
          {/* AI分析ボタン（分析済みでない場合のみ表示） */}
          {shouldShowAnalysisButton() && (
            <button
              onClick={() => setShowAIAnalysis(true)}
              className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
              title="AI健康分析"
            >
              <Brain size={16} />
            </button>
          )}
        </div>
      ) : null}
      <p className="text-sm text-gray-700 whitespace-pre-wrap min-h-[2em]">{post.content}</p>
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {post.tags.map((tag: string) => (
            <span key={tag} className="inline-flex items-center px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
              <LucideTag size={12} className="mr-1" />{tag}
            </span>
          ))}
        </div>
      )}

      {/* AI分析モーダル */}
      {showAIAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🤖 AI健康分析</h3>
              <button
                onClick={() => setShowAIAnalysis(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X size={20} />
              </button>
            </div>
            <AIAnalysisCard
              imageUrl={post.photo_url || ''}
              analysisType={post.type}
              otayoriId={post.id}
              onAnalysisComplete={() => {
                setShowAIAnalysis(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
