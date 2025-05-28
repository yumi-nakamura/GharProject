// community/CommunityFeed.tsx
import { OtayoriCard } from "@/components/otayori/Card"

export function CommunityFeed({ posts, birthday }: { posts: any[]; birthday: string }) {
  return (
    <div className="p-4 space-y-4">
      {posts.map(post => (
        <OtayoriCard key={post.id} post={post} birthday={birthday} />
      ))}
    </div>
  )
}