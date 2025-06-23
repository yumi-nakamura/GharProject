// community/CommunityFeed.tsx
import { OtayoriCard } from "@/components/otayori/Card"
import type { OtayoriRecord } from '@/types/otayori'

export function CommunityFeed({ posts, birthday }: { posts: OtayoriRecord[]; birthday: string }) {
  return (
    <div className="p-4 space-y-4">
      {posts.map(post => (
        <OtayoriCard key={post.id} post={post} birthday={birthday} />
      ))}
    </div>
  )
}