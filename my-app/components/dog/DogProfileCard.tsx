"use client"
import type { DogProfile } from "@/types/dog"
import { PawPrint, Heart, Calendar, Weight, Star, Shield, AlertTriangle, ThumbsUp, ThumbsDown, Edit } from "lucide-react"
import Image from 'next/image'

interface DogProfileCardProps {
  dog: DogProfile
  showEditButton?: boolean
  onEdit?: () => void
}

export default function DogProfileCard({ dog, showEditButton = false, onEdit }: DogProfileCardProps) {
  const hasImage = dog.image_url && dog.image_url.trim() !== ""
  
  // 年齢計算
  const calculateAge = (birthday: string | null) => {
    if (!birthday) return null
    const birthDate = new Date(birthday)
    const today = new Date()
    const ageInMs = today.getTime() - birthDate.getTime()
    const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365.25))
    const ageInMonths = Math.floor((ageInMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44))
    
    if (ageInYears > 0) {
      return `${ageInYears}歳${ageInMonths > 0 ? `${ageInMonths}ヶ月` : ''}`
    } else {
      return `${ageInMonths}ヶ月`
    }
  }

  const age = calculateAge(dog.birthday)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100 hover:shadow-xl transition-shadow">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
          <PawPrint className="text-orange-400" size={24} />
          {dog.name}
        </h2>
        {showEditButton && onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
          >
            <Edit size={14} />
            編集
          </button>
        )}
      </div>

      {/* メイン情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左カラム: 画像と基本情報 */}
        <div className="md:col-span-1">
          <div className="flex flex-col items-center space-y-4">
            {/* プロフィール画像 */}
            <div className="relative">
              {hasImage ? (
                <Image
                  src={dog.image_url!}
                  alt={`${dog.name}の写真`}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover border-4 border-orange-200 shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              {!hasImage && (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 border-4 border-orange-200 shadow-lg flex items-center justify-center">
                  <PawPrint size={48} className="text-orange-300" />
                </div>
              )}
            </div>

            {/* 基本情報 */}
            <div className="text-center space-y-2">
              {dog.breed && (
                <div className="bg-orange-50 rounded-lg px-3 py-1">
                  <span className="text-sm font-semibold text-orange-700">{dog.breed}</span>
                </div>
              )}
              {age && (
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{age}</span>
                </div>
              )}
              {dog.gender && (
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  dog.gender === 'オス' ? 'bg-blue-100 text-blue-700' : 
                  dog.gender === 'メス' ? 'bg-pink-100 text-pink-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  <Heart size={12} />
                  {dog.gender}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右カラム: 詳細情報 */}
        <div className="md:col-span-2 space-y-4">
          {/* 身体情報 */}
          <div className="grid grid-cols-2 gap-4">
            {dog.weight && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-1">
                  <Weight size={14} />
                  体重
                </div>
                <div className="text-lg font-bold text-blue-800">{dog.weight}kg</div>
              </div>
            )}
            {dog.size && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-1">
                  <PawPrint size={14} />
                  サイズ
                </div>
                <div className="text-lg font-bold text-green-800">{dog.size}</div>
              </div>
            )}
            {dog.color && (
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 mb-1">
                  <Star size={14} />
                  毛色
                </div>
                <div className="text-lg font-bold text-purple-800">{dog.color}</div>
              </div>
            )}
            {dog.charm_point && (
              <div className="bg-pink-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-pink-700 mb-1">
                  <Heart size={14} />
                  チャームポイント
                </div>
                <div className="text-sm text-pink-800">{dog.charm_point}</div>
              </div>
            )}
          </div>

          {/* 性格・特徴 */}
          {dog.character && (
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-700 mb-2">
                <PawPrint size={16} />
                性格・特徴
              </div>
              <p className="text-gray-800 italic">&quot;{dog.character}&quot;</p>
            </div>
          )}

          {/* 好きなもの・嫌いなもの */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dog.likes && dog.likes.length > 0 && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-2">
                  <ThumbsUp size={14} />
                  好きなもの
                </div>
                <div className="flex flex-wrap gap-1">
                  {dog.likes.map((like, index) => (
                    <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {like}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {dog.dislikes && dog.dislikes.length > 0 && (
              <div className="bg-red-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700 mb-2">
                  <ThumbsDown size={14} />
                  嫌いなもの
                </div>
                <div className="flex flex-wrap gap-1">
                  {dog.dislikes.map((dislike, index) => (
                    <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {dislike}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 健康情報 */}
          <div className="space-y-3">
            {dog.vaccine_info && dog.vaccine_info.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-2">
                  <Shield size={14} />
                  ワクチン情報
                </div>
                <div className="flex flex-wrap gap-1">
                  {dog.vaccine_info.map((vaccine, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {vaccine}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {dog.medical_history && dog.medical_history.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-yellow-700 mb-2">
                  <AlertTriangle size={14} />
                  病歴
                </div>
                <div className="flex flex-wrap gap-1">
                  {dog.medical_history.map((history, index) => (
                    <span key={index} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      {history}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {dog.caution && (
              <div className="bg-red-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700 mb-2">
                  <AlertTriangle size={14} />
                  注意事項
                </div>
                <p className="text-red-800 text-sm">{dog.caution}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* フッター */}
      <div className="mt-6 pt-4 border-t border-orange-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar size={12} />
            <span>登録日: {dog.created_at ? new Date(dog.created_at).toLocaleDateString('ja-JP') : '不明'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={12} className="text-pink-400" />
            <span>愛犬ID: {dog.id.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  )
} 