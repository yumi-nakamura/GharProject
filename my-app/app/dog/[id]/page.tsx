"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { DogProfile } from '@/types/dog'
import DogProfileCard from '@/components/dog/DogProfileCard'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const supabase = createClient()

export default function DogProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [dog, setDog] = useState<DogProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDog = async () => {
      setLoading(true)
      const { id } = await params
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching dog:', error)
        setError('わんちゃんの情報取得に失敗しました。')
        setDog(null)
      } else {
        setDog(data)
      }
      setLoading(false)
    }

    fetchDog()
  }, [params])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">わんちゃんの情報を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !dog) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center bg-gradient-to-br from-orange-50 to-pink-50">
        <p className="text-red-500">{error || 'わんちゃんが見つかりません'}</p>
        <Link href="/settings">
          <span className="mt-4 px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600">
            設定画面に戻る
          </span>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link href="/settings" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4">
          <ArrowLeft size={18} />
          <span>設定に戻る</span>
        </Link>
        <DogProfileCard dog={dog} showEditButton={true} onEdit={() => router.push(`/dog/edit/${dog.id}`)} />
      </div>
    </div>
  )
}