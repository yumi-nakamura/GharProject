// profile/UserCard.tsx
import type { UserProfile } from "@/types/user"

export function UserCard({ user }: { user: UserProfile }) {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded">
      <img src={user.avatarUrl || "/images/default-avatar.png"} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <p className="font-semibold">{user.name}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>
    </div>
  )
}