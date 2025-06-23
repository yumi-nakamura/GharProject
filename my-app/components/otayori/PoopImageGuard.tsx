// components/otayori/PoopImageGuard.tsx
"use client"

import React, { useState, ChangeEvent } from "react"
import { Lock, Eye, AlertCircle, Gift } from "lucide-react"

export default function PoopImageGuard({
  imageUrl,
  expectedPassword,
}: {
  imageUrl: string
  expectedPassword: string
}) {
  const [input, setInput] = useState("")
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const handleUnlock = () => {
    if (input === expectedPassword) {
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      setTimeout(() => setError(false), 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock()
    }
  }

  if (unlocked) {
    return (
      <div className="relative">
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 z-10">
          <Eye size={12} />
          解除済み
        </div>
        <img
          src={imageUrl}
          alt="うんち写真"
          className="w-full max-h-64 object-contain rounded-lg border shadow-sm"
        />
      </div>
    )
  }

  return (
    <div className={`relative p-6 border-2 border-dashed border-yellow-300 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 text-center transition-all ${isShaking ? 'animate-gift-shake' : ''}`}>
      {/* プープバッグのリボン */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <div className="bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
          <Gift size={12} />
          プープバッグ
        </div>
      </div>
      
      {/* プープバッグのアイコン */}
      <div className="flex justify-center mb-4 mt-2">
        <div className="relative animate-gift-bounce gift-hover">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <div className="text-4xl">🎁</div>
          </div>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
            !
          </div>
        </div>
      </div>
      
      <h3 className="font-bold text-yellow-800 mb-2 text-lg">プープバッグで保護されています</h3>
      <p className="text-sm text-yellow-700 mb-4">
        この画像を確認するには、<br/>
        <span className="font-semibold">西暦のお誕生日</span>を入力してください
      </p>
      
      <div className="space-y-3 max-w-xs mx-auto">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="例: 20200415"
            className={`w-full border p-3 rounded-lg text-center transition-all ${
              error 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500'
            }`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Lock size={16} className="text-gray-400" />
          </div>
        </div>
        
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-600 text-sm animate-bounce">
            <AlertCircle size={14} />
            <span>パスワードが違います</span>
          </div>
        )}
        
        <button
          onClick={handleUnlock}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
        >
          <Gift size={16} />
          プープバッグを開く
        </button>
      </div>
      
      <div className="mt-4 p-2 bg-yellow-100 rounded-lg">
        <p className="text-xs text-yellow-700">
          💡 <strong>ヒント:</strong> 西暦のお誕生日を8桁で入力してください
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          例：2020年4月15日 → 20200415
        </p>
      </div>
    </div>
  )
}
