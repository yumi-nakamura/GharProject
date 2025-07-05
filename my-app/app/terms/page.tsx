"use client"
import Link from "next/link"
import { FileText, ChevronLeft } from "lucide-react"
import { useAuth } from "@/components/layout/AuthProvider"

export default function TermsPage() {
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
            <FileText className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">利用規約</h1>
        </div>
        <div className="space-y-6 text-gray-700 text-sm">
          <section>
            <h2 className="font-semibold text-orange-600 mb-2">第1条（適用）</h2>
            <p>本規約は、OTAYORI（以下「本サービス」）の利用条件を定めるものです。ユーザーは本規約に同意の上、本サービスを利用するものとします。</p>
          </section>
          <section>
            <h2 className="font-semibold text-orange-600 mb-2">第2条（禁止事項）</h2>
            <ul className="list-disc pl-6">
              <li>法令または公序良俗に違反する行為</li>
              <li>他のユーザーまたは第三者の権利を侵害する行為</li>
              <li>本サービスの運営を妨害する行為</li>
            </ul>
          </section>
          <section>
            <h2 className="font-semibold text-orange-600 mb-2">第3条（免責事項）</h2>
            <p>本サービスの利用により生じた損害について、運営者は一切の責任を負いません。</p>
          </section>
          <section>
            <h2 className="font-semibold text-orange-600 mb-2">第4条（規約の変更）</h2>
            <p>運営者は、必要と判断した場合には、ユーザーに通知することなく本規約を変更できるものとします。</p>
          </section>
          <section>
            <h2 className="font-semibold text-orange-600 mb-2">第5条（準拠法・裁判管轄）</h2>
            <p>本規約の解釈には日本法を準拠法とし、本サービスに関して紛争が生じた場合には運営者の所在地を管轄する裁判所を専属的合意管轄とします。</p>
          </section>
        </div>
        <div className="text-center mt-8 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} OTAYORI
        </div>
      </div>
    </div>
  )
} 