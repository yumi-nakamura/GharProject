// dog/DogProfile.tsx
import type { DogProfile as DogProfileType } from "@/types/dog"
import Image from 'next/image';

export function DogProfile({ dog }: { dog: DogProfileType }) {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded">
      <Image src={dog.image_url || "/images/default-avatar.png"} alt={dog.name} width={64} height={64} className="w-16 h-16 rounded-full object-cover" />
      <div>
        <p className="font-bold text-lg">{dog.name}</p>
        <p className="text-sm text-gray-600">{dog.breed}</p>
        <p className="text-xs text-gray-400">誕生日: {dog.birthday || "未登録"}</p>
      </div>
    </div>
  )
}

// dog/DogStats.tsx
export function DogStats({ stats }: { stats: { weight: string; height: string; neck: string } }) {
  return (
    <div className="p-4 border rounded bg-white">
      <h4 className="font-semibold mb-2">体のサイズ</h4>
      <ul className="text-sm text-gray-700 space-y-1">
        <li>体重: {stats.weight}</li>
        <li>身長: {stats.height}</li>
        <li>首まわり: {stats.neck}</li>
      </ul>
    </div>
  )
}