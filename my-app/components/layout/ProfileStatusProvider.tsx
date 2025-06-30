"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/components/layout/AuthProvider"

interface ProfileStatusContextType {
  hasDogProfile: boolean
  loading: boolean
}

const ProfileStatusContext = createContext<ProfileStatusContextType | undefined>(undefined)

export function ProfileStatusProvider({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuth()
  const [hasDogProfile, setHasDogProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileStatus = async () => {
      if (!initialized) return
      
      setLoading(true)
      if (user) {
        try {
          const supabase = createClient()
          const { data: dogs, error } = await supabase.from("dogs").select("id").eq("owner_id", user.id)
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
    }

    fetchProfileStatus()
  }, [user, initialized])

  return (
    <ProfileStatusContext.Provider value={{ hasDogProfile, loading }}>
      {children}
    </ProfileStatusContext.Provider>
  )
}

export function useProfileStatus() {
  const context = useContext(ProfileStatusContext)
  if (context === undefined) {
    throw new Error('useProfileStatus must be used within a ProfileStatusProvider')
  }
  return context
} 