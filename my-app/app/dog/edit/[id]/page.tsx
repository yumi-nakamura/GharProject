"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { DogProfile } from '@/types/dog'
import DogForm from '@/components/dog/DogForm'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const supabase = createClient()

export default function EditDogPage({ params }: { params: Promise<{ id: string }> }) {
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

  const handleComplete = () => {
    router.push('/settings')
  }

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>読み込み中...</p>
        </div>
    )
  }

  if (error) {
    return (
        <div className="flex flex-col justify-center items-center h-screen text-center">
            <p className="text-red-500">{error}</p>
            <Link href="/settings">
                <span className="mt-4 px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                    設定画面に戻る
                </span>
            </Link>
        </div>
    )
  }

  return (
    <main className="p-4 bg-orange-50 min-h-screen">
      <div className="max-w-md mx-auto">
        <Link href="/settings" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4">
          <ArrowLeft size={18} />
          <span>設定に戻る</span>
        </Link>
        {dog && <DogForm initialDogData={dog} onComplete={handleComplete} />}
      </div>
    </main>
  )
} 