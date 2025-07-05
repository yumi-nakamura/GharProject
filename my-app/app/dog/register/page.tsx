"use client"
import DogProfileEditForm from "@/components/dog/DogProfileEditForm"

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
      const isFirstDog = localStorage.getItem("dog_profile_skipped") === "1"
      if (isFirstDog) {
        localStorage.removeItem("dog_profile_skipped")
        window.location.href = "/"
      } else {
        window.location.href = "/settings"
      }
    }
  }
  return (
    <main className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 min-h-screen">
      <DogProfileEditForm onComplete={handleComplete} />
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