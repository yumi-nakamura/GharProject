"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'checking' | 'redirecting'>('loading')

  useEffect(() => {
    const supabase = createClient()
    
    const checkProfile = async () => {
      try {
        setStatus('checking')
        
        // セッションが確立されるまで少し待つ
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('認証エラー:', error)
          router.replace("/login")
          return
        }

        if (!user) {
          console.log('ユーザーが見つかりません')
          router.replace("/login")
          return
        }

        setStatus('redirecting')
        
        // 犬プロフィール有無を確認
        const { data: dogs, error: dogsError } = await supabase
          .from("dogs")
          .select("id")
          .eq("owner_id", user.id)
          .limit(1)
        
        if (dogsError) {
          console.error('犬プロフィール確認エラー:', dogsError)
          router.replace("/dog/register")
          return
        }

        if (!dogs || dogs.length === 0) {
          console.log('犬プロフィールがありません')
          router.replace("/dog/register")
        } else {
          console.log('犬プロフィールが見つかりました')
          router.replace("/")
        }
      } catch (error) {
        console.error('コールバック処理エラー:', error)
        router.replace("/login")
      }
    }

    checkProfile()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl animate-bounce mb-4">🐾</div>
        <div className="text-lg font-semibold text-orange-600 mb-2">
          {status === 'loading' && '認証処理中...'}
          {status === 'checking' && 'プロフィール確認中...'}
          {status === 'redirecting' && 'リダイレクト中...'}
        </div>
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  )
}
