"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "@/utils/supabase/client"

const ProfileStatusContext = createContext<{ hasDogProfile: boolean; loading: boolean }>({ hasDogProfile: false, loading: true })

export function ProfileStatusProvider({ children }: { children: ReactNode }) {
  const [hasDogProfile, setHasDogProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    async function fetchDogProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setHasDogProfile(false)
          setLoading(false)
          return
        }
        
        const { data: dogs, error } = await supabase.from("dogs").select("id").eq("owner_id", user.id)
        if (error) {
          console.error('犬プロフィール取得エラー:', error)
          setHasDogProfile(false)
        } else {
          setHasDogProfile(!!dogs && dogs.length > 0)
        }
        setLoading(false)
      } catch (error) {
        console.error('プロフィール状態取得エラー:', error)
        setHasDogProfile(false)
        setLoading(false)
      }
    }

    fetchDogProfile()
    
    // 認証状態が変わったら再取得
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true)
      if (session?.user) {
        try {
          const { data: dogs, error } = await supabase.from("dogs").select("id").eq("owner_id", session.user.id)
          if (error) {
            console.error('犬プロフィール取得エラー:', error)
            setHasDogProfile(false)
          } else {
            setHasDogProfile(!!dogs && dogs.length > 0)
          }
        } catch (error) {
          console.error('プロフィール状態取得エラー:', error)
          setHasDogProfile(false)
        }
      } else {
        setHasDogProfile(false)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <ProfileStatusContext.Provider value={{ hasDogProfile, loading }}>
      {children}
    </ProfileStatusContext.Provider>
  )
}

export function useProfileStatus() {
  return useContext(ProfileStatusContext)
} 