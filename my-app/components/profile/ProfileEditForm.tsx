"use client"

import { useState } from "react"
import type { UserProfile } from "@/types/user"

export function ProfileEditForm({ user, onSave }: { user: UserProfile; onSave: (updated: Partial<UserProfile>) => void }) {
  const [name, setName] = useState(user.name)
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "")
  const [comment, setComment] = useState(user.comment || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSave({ name, avatarUrl, comment })
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white max-w-md mx-auto">
      <div>
        <label className="block text-sm font-semibold mb-1">名前</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" required />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">アバター画像URL</label>
        <input type="text" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">ひとことコメント</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full border p-2 rounded" rows={3} />
      </div>
      <button type="submit" className="bg-orange-400 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "保存中..." : "保存する"}
      </button>
    </form>
  )
} 