"use client"
import Link from "next/link"
import { User, ChevronLeft, Mail } from "lucide-react"
import { useAuth } from "@/components/layout/AuthProvider"

export default function AboutPage() {
  const { user } = useAuth()
  
  // ログイン状態に応じて戻り先を決定
  const backLink = user ? "/settings" : "/"
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Link href={backLink} className="text-orange-500 hover:text-orange-700 flex items-center gap-1">
            <ChevronLeft size={20} />
            戻る
          </Link>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full flex items-center justify-center">
            <User className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">運営者情報</h1>
        </div>
        <div className="space-y-6 text-gray-700 text-sm">
          <section>
            <h2 className="text-lg font-semibold text-orange-600 mb-2">運営者</h2>
            <p>OTAYORI運営チーム</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-orange-600 mb-2">連絡先</h2>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-orange-400" /> info@otayori.app</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-orange-600 mb-2">メッセージ</h2>
            <p>わんちゃんと飼い主さんの毎日がもっと楽しく、安心できるものになるよう心を込めて運営しています。ご意見・ご要望もお気軽にお寄せください！</p>
          </section>
        </div>
        <div className="text-center mt-8 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} OTAYORI
        </div>
      </div>
    </div>
  )
} 