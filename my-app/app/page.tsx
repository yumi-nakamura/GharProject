"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { WeeklySummaryCard } from "@/components/otayori/WeeklySummaryCard"
import { DogProfile } from "@/components/dog/DogProfile"
import { DogStats } from "@/components/dog/DogStats"
import type { DogProfile as DogProfileType } from "@/types/dog"
import { PawPrint, Camera, Smile, Salad, Bubbles, MessageCircleHeart, Dog, Hospital } from "lucide-react"
import Link from "next/link"

const supabase = createClient()

// 週次サマリー型
interface WeeklySummary {
  meals: number
  poops: number
  mood: string
}

const summary: WeeklySummary = {
  meals: 21,
  poops: 14,
  mood: "ポジティブ中心",
}

export default function HomePage() {
  const [dog, setDog] = useState<DogProfileType | null>(null)
  const [lastMeal, setLastMeal] = useState<string | null>(null)
  const [lastPoop, setLastPoop] = useState<string | null>(null)
  const [lastMood, setLastMood] = useState<string | null>(null)

  useEffect(() => {
    const fetchDog = async () => {
      const { data: session } = await supabase.auth.getUser()
      const userId = session?.user?.id
      if (!userId) return
      const { data, error } = await supabase.from("dogs").select("*", { count: "exact" }).eq("owner_id", userId).single()
      if (data) {
        setDog({
          ...data,
          avatarUrl: data.image_url || "/images/default-avatar.png",
        })
        // Last記録取得
        const { data: otayori } = await supabase.from("otayori").select("type, datetime").eq("dog_id", data.id).order("datetime", { ascending: false })
        if (otayori && otayori.length > 0) {
          setLastMeal(otayori.find((o: any) => o.type === "meal")?.datetime || null)
          setLastPoop(otayori.find((o: any) => o.type === "poop")?.datetime || null)
          setLastMood(otayori.find((o: any) => o.type === "emotion")?.datetime || null)
        }
      }
    }
    fetchDog()
  }, [])

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      {/* 犬プロフィールカード */}
      {dog ? (
        <div className="bg-white rounded-xl shadow p-4 flex items-center mb-4">
          <img src={dog.avatarUrl} alt={dog.name} className="w-20 h-20 rounded-full object-cover border-4 border-orange-200 mr-4" />
          <div className="flex-1">
            <div className="font-bold text-lg mb-1">{dog.name}</div>
            <div className="text-sm text-gray-500 mb-2">{dog.breed}</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Last.ごはん: {lastMeal ? new Date(lastMeal).toLocaleTimeString() : "-"}</div>
              <div>Last.うんち: {lastPoop ? new Date(lastPoop).toLocaleDateString() : "-"}</div>
              <div>Last.きもち: {lastMood ? new Date(lastMood).toLocaleTimeString() : "-"}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">犬プロフィールが登録されていません</div>
      )}
      {/* 記録ショートカット */}
      <div className="flex justify-around mb-4">
        <Link href="/otayori/new?type=meal" className="flex flex-col items-center text-orange-500">
          <Salad className="w-8 h-8 mb-1" />
          <span className="text-xs">ごはん記録</span>
        </Link>
        <Link href="/otayori/new?type=poop" className="flex flex-col items-center text-orange-500">
          <Bubbles className="w-8 h-8 mb-1" />
          <span className="text-xs">うんち記録</span>
        </Link>
        <Link href="/otayori/new?type=emotion" className="flex flex-col items-center text-orange-500">
          <MessageCircleHeart className="w-8 h-8 mb-1" />
          <span className="text-xs">きもち記録</span>
        </Link>
      </div>
      {/* OTAYORIを記録するボタン */}
      <Link href="/otayori/new">
        <button className="w-full bg-orange-400 text-white rounded-full py-3 font-bold text-lg shadow hover:bg-orange-500 transition flex items-center justify-center gap-2">
          <Camera className="w-6 h-6" />
          OTAYORI を記録する
        </button>
      </Link>
      {/* 最近の様子カード */}
      {dog && (
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-2 mb-2">
          <Dog className="w-6 h-6 text-orange-400 mr-2" />
          <div className="font-semibold">最近の{dog.name}の様子</div>
          <div className="text-xs text-gray-500 ml-2">（ダミー）最近、食事時間が不規則かも…</div>
        </div>
      )}
      {/* かかりつけカード */}
      <div className="bg-white rounded-xl shadow p-4 flex items-center gap-2 mb-2">
        <Hospital className="w-6 h-6 text-orange-400 mr-2" />
        <div className="font-semibold">かかりつけ</div>
        <div className="text-xs text-gray-500 ml-2">（ダミー）〇〇動物病院 電話番号: 000-0000-0000</div>
      </div>
      {/* お知らせカード */}
      <div className="bg-white rounded-xl shadow p-4 mb-2">
        <div className="font-semibold mb-1">お知らせ</div>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>今日のごはんはまだかな？（10分前）</li>
          <li>[横浜] 2025年8月開催！わんわんミートアップのご案内（1日前）</li>
          <li>[横浜] 2025年8月開催！わんわんミートアップのご案内（1日前）</li>
        </ul>
      </div>
      {/* おともだちのOTAYORIカード */}
      <div className="bg-white rounded-xl shadow p-4 flex items-center gap-2 mb-2">
        <Dog className="w-6 h-6 text-orange-400 mr-2" />
        <div className="font-semibold">おともだちのOTAYORI</div>
        <div className="text-xs text-gray-500 ml-2">（ダミー）おともだちの投稿がここに並びます</div>
      </div>
    </div>
  )
}