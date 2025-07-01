// community/CommunityFeed.tsx
import { OtayoriCard } from "@/components/otayori/Card"
import type { OtayoriRecord } from '@/types/otayori'
import type { DogProfile } from '@/types/dog'

export function CommunityFeed({ posts, dog }: { posts: OtayoriRecord[]; dog: DogProfile | null }) {
  return (
    <div className="p-4 space-y-4">
      {posts.map(post => (
        <OtayoriCard key={post.id} post={post} dog={dog} />
      ))}
    </div>
  )
}