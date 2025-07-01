"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  initialized: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    
    // 初期認証状態を取得
    const initializeAuth = async () => {
      try {
        console.log('認証初期化開始...')
        
        // セッションを取得
        const { error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('セッション取得エラー:', sessionError)
          // セッションエラーは無視して続行（未ログイン状態として扱う）
        }
        
        // ユーザー情報を取得
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('ユーザー取得エラー:', userError)
          // ユーザー取得エラーも無視して続行
        }
        
        console.log('初期認証状態:', user ? 'ログイン済み' : '未ログイン')
        setUser(user)
        
      } catch (error) {
        console.error('認証初期化エラー:', error)
        // エラーが発生しても初期化は完了させる
      } finally {
        setLoading(false)
        setInitialized(true)
        console.log('認証初期化完了')
      }
    }

    initializeAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('認証状態変更:', event, session?.user ? 'ログイン済み' : '未ログイン')
      setUser(session?.user || null)
      
      // 初回の初期化が完了していない場合は、ここで完了させる
      if (!initialized) {
        setLoading(false)
        setInitialized(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initialized])

  const signOut = async () => {
    const supabase = createClient()
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('サインアウトエラー:', error)
    }
  }

  const value = {
    user,
    loading,
    initialized,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 