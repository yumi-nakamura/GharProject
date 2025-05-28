// notifications/NotificationItem.tsx
export function NotificationItem({ title, message }: { title: string; message: string }) {
  return (
    <div className="border-l-4 border-orange-400 bg-white shadow-sm p-3 rounded">
      <h4 className="font-semibold text-sm text-orange-600">{title}</h4>
      <p className="text-sm text-gray-700">{message}</p>
    </div>
  )
}
