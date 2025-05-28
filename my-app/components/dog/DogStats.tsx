// components/dog/DogStats.tsx
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