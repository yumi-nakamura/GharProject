"use client"
import DogForm from "@/components/dog/DogForm"

export default function DogRegisterPage() {
  // スキップ時の処理
  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dog_profile_skipped", "1")
      window.location.href = "/"
    }
  }
  // 登録完了時の処理
  const handleComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("dog_profile_skipped")
      window.location.href = "/"
    }
  }
  return (
    <main className="p-4">
      <DogForm onComplete={handleComplete} />
      <div className="mt-6 text-center">
        <button
          className="text-sm text-gray-500 underline hover:text-orange-500"
          onClick={handleSkip}
        >
          スキップして後で登録する
        </button>
      </div>
    </main>
  )
}