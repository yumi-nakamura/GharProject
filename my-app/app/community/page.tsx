// app/community/page.tsx
import { CommunityFeed } from "@/components/community/CommunityFeed"
const mockPosts = [
  { id: 1, type: "meal", content: "今日も完食！", datetime: new Date().toISOString(), photo_url: "meal/sample.jpg" },
]
export default function CommunityPage() {
  return <CommunityFeed posts={mockPosts} birthday="2021-06-01" />
}