// components/otayori/PoopImageGuard.tsx
"use client"

import React, { useState, ChangeEvent } from "react"

export default function PoopImageGuard({
  imageUrl,
  expectedPassword,
}: {
  imageUrl: string
  expectedPassword: string
}) {
  const [input, setInput] = useState("")
  const [unlocked, setUnlocked] = useState(false)

  const handleUnlock = () => {
    if (input === expectedPassword) {
      setUnlocked(true)
    } else {
      alert("パスワードが違います")
    }
  }

  if (unlocked) {
    return (
      <img
        src={imageUrl}
        alt="うんち写真"
        className="w-full max-h-64 object-contain rounded border"
      />
    )
  }

  return (
    <div className="p-4 border rounded bg-yellow-50 text-center">
      <p className="text-sm text-gray-700 mb-2">この画像はパスワードで保護されています。</p>
      <input
        type="password"
        value={input}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
        placeholder="パスワード（例：誕生日）"
        className="border p-1 text-sm rounded"
      />
      <button
        onClick={handleUnlock}
        className="ml-2 px-3 py-1 text-sm bg-blue-500 text-white rounded"
      >
        表示
      </button>
    </div>
  )
}
