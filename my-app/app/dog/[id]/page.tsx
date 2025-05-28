// app/dog/[id]/page.tsx
import { DogProfile } from "@/components/dog/DogProfile"
import { DogStats } from "@/components/dog/DogStats"
export default function DogProfilePage({ params }: { params: { id: string } }) {
  const dog = {
    name: "モコ",
    breed: "トイプードル",
    avatarUrl: "/images/default-avatar.png",
    birthday: "2021-06-01",
  }
  const stats = {
    weight: "4.2kg",
    height: "28cm",
    neck: "22cm",
  }
  return (
    <div className="p-4 space-y-4">
      <DogProfile dog={dog} />
      <DogStats stats={stats} />
    </div>
  )
}