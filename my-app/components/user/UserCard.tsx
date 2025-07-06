// components/user/UserCard.tsx
import Image from 'next/image';

export function UserCard({ name, email, avatarUrl }: { name: string; email: string; avatarUrl: string }) {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded">
      <Image src={avatarUrl} alt={name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-600">{email}</p>
      </div>
    </div>
  )
}
