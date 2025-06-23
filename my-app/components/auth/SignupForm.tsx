// auth/SignupForm.tsx
"use client"
import { useState, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { TextInput } from "@/components/common/TextInput"
import { Button } from "@/components/common/Button"

const supabase = createClient()

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // メール認証を使う場合は下記のコメントアウトを有効化してください
    // const { error } = await supabase.auth.signUp({
    //   email,
    //   password,
    //   options: {
    //     emailRedirectTo: "http://localhost:3000/auth/callback"
    //   }
    // })
    // setMessage(error ? `登録失敗: ${error.message}` : "確認メールを送信しました")
    // return

    // メール認証なしで即サインイン状態にする場合はこちら
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      setMessage(`登録失敗: ${error.message}`)
      return
    }

    // サインアップ直後はセッションがnullの場合があるので、ポーリングでセッションを取得
    let tries = 0
    const maxTries = 10
    const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

    while (tries < maxTries) {
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session) {
        router.replace("/dog/register")
        return
      }
      await wait(500) // 0.5秒待つ
      tries++
    }
    setMessage("サインアップ後に自動ログインできませんでした。")
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <TextInput type="email" placeholder="メールアドレス" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
      <TextInput type="password" placeholder="パスワード" value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
      <Button type="submit">新規登録</Button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </form>
  )
}
