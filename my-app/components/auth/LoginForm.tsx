// auth/LoginForm.tsx
"use client"
import { useState, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { TextInput } from "@/components/common/TextInput"
import { Button } from "@/components/common/Button"

const supabase = createClient()

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(`ログイン失敗: ${error.message}`)
      return
    }
    // サインイン成功時、犬プロフィール有無を確認
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) {
      setMessage("ユーザー情報の取得に失敗しました")
      return
    }
    // dogsテーブルに該当ユーザーの犬プロフィールがあるか確認
    const { data: dogs } = await supabase.from("dogs").select("id").eq("owner_id", userId)
    if (!dogs || dogs.length === 0) {
      router.replace("/dog/register")
    } else {
      router.replace("/")
    }
  }

  return (
    <form onSubmit={handleLogin} className="p-4 space-y-4">
      <TextInput type="email" placeholder="メールアドレス" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
      <TextInput type="password" placeholder="パスワード" value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
      <Button type="submit">ログイン</Button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </form>
  )
}