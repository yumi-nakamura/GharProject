"use client"
import { useState, useEffect, useRef } from 'react'
import { Calendar, Clock } from 'lucide-react'

interface DateTimePickerProps {
  value: string
  onChange: (datetime: string) => void
  label?: string
}

export default function DateTimePicker({ value, onChange, label = "投稿日時" }: DateTimePickerProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const isInitialized = useRef(false)

  // 日本時間を取得する関数
  const getJapanTime = () => {
    const now = new Date()
    // ブラウザのローカルタイムゾーンを考慮して日本時間を取得
    const japanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}))
    return japanTime
  }

  // 初期値を設定（一度だけ実行）
  useEffect(() => {
    if (isInitialized.current) return
    
    if (value) {
      const dateObj = new Date(value)
      // 日本時間に変換
      const japanTime = new Date(dateObj.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}))
      setDate(japanTime.toISOString().split('T')[0])
      setTime(japanTime.toTimeString().split(' ')[0].slice(0, 5))
    } else {
      // デフォルトは現在の日本時間
      const japanNow = getJapanTime()
      setDate(japanNow.toISOString().split('T')[0])
      setTime(japanNow.toTimeString().split(' ')[0].slice(0, 5))
      
      // 初期値として現在のUTC時刻を親コンポーネントに通知
      onChange(new Date().toISOString())
    }
    
    isInitialized.current = true
  }, []) // 空の依存配列で初期化のみ実行

  // 日付変更時の処理
  const handleDateChange = (newDate: string) => {
    setDate(newDate)
    if (newDate && time) {
      // 日本時間をUTCに変換して保存
      const japanDateTime = new Date(`${newDate}T${time}:00+09:00`)
      const utcDateTime = new Date(japanDateTime.getTime() - (9 * 60 * 60 * 1000))
      onChange(utcDateTime.toISOString())
    }
  }

  // 時刻変更時の処理
  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (date && newTime) {
      // 日本時間をUTCに変換して保存
      const japanDateTime = new Date(`${date}T${newTime}:00+09:00`)
      const utcDateTime = new Date(japanDateTime.getTime() - (9 * 60 * 60 * 1000))
      onChange(utcDateTime.toISOString())
    }
  }

  return (
    <div className="space-y-3">
      <label className="font-semibold text-gray-700 flex items-center gap-2">
        <Calendar size={18} />
        {label}
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">時刻</label>
          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {date && time && (
        <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            投稿日時: {new Date(`${date}T${time}:00+09:00`).toLocaleString('ja-JP')}
          </div>
        </div>
      )}
    </div>
  )
} 