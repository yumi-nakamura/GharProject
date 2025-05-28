// notifications/NotificationList.tsx
import type { NotificationItemData } from "@/types/notification"
import { NotificationItem } from "./NotificationItem"

export function NotificationList({ items }: { items: NotificationItemData[] }) {
  return (
    <div className="space-y-2 p-4">
      {items.map((item, i) => (
        <NotificationItem key={i} title={item.title} message={item.message} />
      ))}
    </div>
  )
}