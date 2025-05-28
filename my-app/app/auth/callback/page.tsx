"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    let tries = 0
    const supabase = createClient()
    const checkProfile = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      if (!userId) {
        // まだセッションがセットされていない場合はリトライ
        if (tries < 10) {
          tries++
          setTimeout(checkProfile, 500)
        } else {
          router.replace("/login")
        }
        return
      }

      // 犬プロフィール有無を確認
      const { data: dogs } = await supabase.from("dogs").select("id").eq("owner_id", userId)
      if (!dogs || dogs.length === 0) {
        router.replace("/dog/register")
      } else {
        router.replace("/")
      }
    }
    checkProfile()
    // eslint-disable-next-line
  }, [router])

  return <p className="p-4">ログイン処理中です...</p>
}
