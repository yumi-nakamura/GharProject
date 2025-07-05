"use client"
import Link from "next/link"
import { PawPrint, BookOpen, ChevronLeft } from "lucide-react"
import { useAuth } from "@/components/layout/AuthProvider"

export default function HowToPage() {
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
            <BookOpen className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">使い方ガイド</h1>
        </div>
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-orange-600 mb-2">🐾 OTAYORIって？</h2>
            <p className="text-gray-700">OTAYORIは、愛犬の健康や日々の記録を楽しく管理できるアプリです。写真やメモで思い出を残したり、AI分析で健康チェックもできます。</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-orange-600 mb-2">🌟 主な機能</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>わんちゃんプロフィール登録・編集</li>
              <li>食事・うんち・きもち記録</li>
              <li>写真付き投稿＆タイムライン</li>
              <li>AIによる健康分析</li>
              <li>リマインダー通知</li>
              <li>コミュニティで交流</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-orange-600 mb-2">❓ よくある質問</h2>
            <ul className="space-y-2">
              <li>
                <span className="font-bold text-orange-500">Q.</span> 登録は無料ですか？<br/>
                <span className="ml-6 text-gray-700">A. はい、基本機能は無料でご利用いただけます。</span>
              </li>
              <li>
                <span className="font-bold text-orange-500">Q.</span> データは安全ですか？<br/>
                <span className="ml-6 text-gray-700">A. Supabaseのセキュアなストレージで管理しています。</span>
              </li>
              <li>
                <span className="font-bold text-orange-500">Q.</span> 退会はできますか？<br/>
                <span className="ml-6 text-gray-700">A. 設定ページからいつでも退会申請が可能です。</span>
              </li>
            </ul>
          </section>
        </div>
        <div className="text-center mt-8">
          <PawPrint className="mx-auto text-orange-400" size={32} />
          <p className="text-xs text-gray-400 mt-2">わんちゃんとの毎日をもっと楽しく！</p>
        </div>
      </div>
    </div>
  )
} 