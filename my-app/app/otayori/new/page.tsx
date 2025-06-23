"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import EntryForm from '@/components/otayori/EntryForm'
import type { DogProfile } from '@/types/dog'

const supabase = createClient()

export default function OtayoriNewPage() {
  const [dogs, setDogs] = useState<DogProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserDogs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: rels } = await supabase.from('dog_user_relations').select('dog_id').eq('user_id', user.id)
      const dogIdsFromRels = rels?.map(r => r.dog_id) || []
      const { data: dogsFromOwnerId } = await supabase.from('dogs').select('id').eq('owner_id', user.id)
      const dogIdsFromOwner = dogsFromOwnerId?.map(d => d.id) || []
      const allDogIds = [...new Set([...dogIdsFromRels, ...dogIdsFromOwner])]

      if (allDogIds.length > 0) {
        const { data: dogData } = await supabase
          .from('dogs')
          .select('*')
          .in('id', allDogIds)
          .or('is_deleted.is.null,is_deleted.eq.false')
          .order('created_at', { ascending: false })
        if (dogData) setDogs(dogData)
      }
      setLoading(false)
    }

    fetchUserDogs()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50">
        <div className="text-6xl animate-bounce mb-4">🐾</div>
        <div className="text-lg font-semibold text-orange-600">準備をしています...</div>
      </div>
    )
  }

  if (dogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 text-center p-4">
        <div className="text-6xl mb-4">🐕</div>
        <div className="text-lg font-semibold text-gray-700 mb-2">わんちゃんがいません</div>
        <p className="text-gray-500 mb-6">先にご自身のわんちゃんを登録してください。</p>
        <Link href="/dog/register" className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors font-semibold">
          わんちゃんを登録する
        </Link>
      </div>
    )
  }

  return <EntryForm />
}
