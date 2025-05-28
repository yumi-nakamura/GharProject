// otayori/WeeklySummaryCard.tsx
export function WeeklySummaryCard({ summary }: { summary: { meals: number; poops: number; mood: string } }) {
  return (
    <div className="bg-orange-100 border rounded p-4 space-y-2">
      <h3 className="font-semibold text-lg">今週のまとめ</h3>
      <p>🍚 食事回数: {summary.meals} 回</p>
      <p>💩 排泄回数: {summary.poops} 回</p>
      <p>😊 感情傾向: {summary.mood}</p>
    </div>
  )
}