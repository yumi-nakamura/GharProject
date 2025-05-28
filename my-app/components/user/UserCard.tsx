// components/user/UserCard.tsx
export function UserCard({ name, email, avatarUrl }: { name: string; email: string; avatarUrl: string }) {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded">
      <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-600">{email}</p>
      </div>
    </div>
  )
}
