// otayori/Card.tsx
import { getOtayoriImageUrl } from "@/utils/otayoriHelpers"
import PoopImageGuard from "@/components/otayori/PoopImageGuard"
import type { OtayoriRecord } from "@/types/otayori"
import type { DogProfile } from "@/types/dog"
import { LucideSmile, LucideTag, LucideClock } from "lucide-react"

export function OtayoriCard({ post, dog }: { post: OtayoriRecord; dog: DogProfile | null }) {
  const imageUrl = getOtayoriImageUrl(post.photoUrl)
  
  // プープバッグのパスワードを決定
  // 投稿時に設定されたパスワードがある場合はそれを使用、なければ誕生日から生成
  const getPassword = () => {
    if (post.poopGuardPassword) {
      console.log('OtayoriCard: 投稿時設定パスワード使用', { 
        postId: post.id, 
        password: post.poopGuardPassword 
      })
      return post.poopGuardPassword
    }
    // 誕生日からパスワードを生成（例：2020年4月15日 → 20200415）
    if (dog?.birthday) {
      const birthDate = new Date(dog.birthday)
      const password = birthDate.getFullYear().toString() + 
             String(birthDate.getMonth() + 1).padStart(2, '0') + 
             String(birthDate.getDate()).padStart(2, '0')
      console.log('OtayoriCard: 誕生日からパスワード生成', { 
        postId: post.id, 
        dogName: dog.name,
        birthday: dog.birthday,
        password 
      })
      return password
    }
    console.log('OtayoriCard: パスワード生成失敗', { 
      postId: post.id, 
      dogName: dog?.name,
      hasBirthday: !!dog?.birthday 
    })
    return ""
  }

  // 表示する日時を決定（カスタム日時があればそれを使用、なければ投稿日時）
  const displayDatetime = post.customDatetime || post.datetime

  // 日本時間に変換して表示
  const formatJapanTime = (isoString: string) => {
    const date = new Date(isoString)
    const japanTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}))
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
      {post.type === 'poop' && post.isPoopGuarded && imageUrl ? (
        <PoopImageGuard imageUrl={imageUrl} expectedPassword={getPassword()} dogName={dog?.name || "わんちゃん"} />
      ) : post.type === 'poop' ? (
        // うんち投稿でプープバッグが設定されていない場合も保護
        imageUrl ? (
          <PoopImageGuard imageUrl={imageUrl} expectedPassword={getPassword()} dogName={dog?.name || "わんちゃん"} />
        ) : (
          <div className="p-4 border-2 border-dashed border-yellow-300 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 text-center">
            <div className="text-4xl mb-2">💩</div>
            <p className="text-sm text-yellow-700">うんちの記録（画像なし）</p>
          </div>
        )
      ) : imageUrl ? (
        <img src={imageUrl} alt="OTAYORI画像" className="w-full max-h-48 object-cover rounded-xl border" />
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
    </div>
  )
}
