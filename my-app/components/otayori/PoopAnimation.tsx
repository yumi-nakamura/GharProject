// components/otayori/PoopAnimation.tsx
"use client"

import { useEffect } from "react"

export default function PoopAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 1800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center space-y-4 animate-fade-out">
      <p className="text-2xl font-semibold">💩 封筒に投函中...</p>
      <div className="text-5xl animate-bounce">📩</div>
    </div>
  )
}

/*
Tailwind拡張CSS例（globals.cssなどに追加）：
@keyframes fade-out {
  0% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
.animate-fade-out {
  animation: fade-out 2s ease-out forwards;
}
*/
