// app/community/page.tsx
import { CommunityFeed } from "@/components/community/CommunityFeed"
const mockPosts = [
  { 
    id: "1", 
    dogId: "dog1", 
    userId: "user1", 
    type: "meal" as const, 
    content: "今日も完食！", 
    datetime: new Date().toISOString(), 
    photoUrl: "meal/sample.jpg" 
  },
]
export default function CommunityPage() {
  return <CommunityFeed posts={mockPosts} birthday="2021-06-01" />
}