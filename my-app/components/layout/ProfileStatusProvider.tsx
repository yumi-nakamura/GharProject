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
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) {
        setHasDogProfile(false)
        setLoading(false)
        return
      }
      const { data: dogs } = await supabase.from("dogs").select("id").eq("owner_id", userId)
      setHasDogProfile(!!dogs && dogs.length > 0)
      setLoading(false)
    }
    fetchDogProfile()
    // 認証状態が変わったら再取得
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setLoading(true)
      fetchDogProfile()
    })
    return () => {
      listener?.subscription.unsubscribe()
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