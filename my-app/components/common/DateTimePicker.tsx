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



  // 初期値を設定（一度だけ実行）
  useEffect(() => {
    if (isInitialized.current) return
    
    if (value) {
      const dateObj = new Date(value)
      // UTC時刻を日本時間（JST）に変換
      const japanTime = new Date(dateObj.getTime() + (9 * 60 * 60 * 1000))
      setDate(japanTime.toISOString().split('T')[0])
      setTime(japanTime.toTimeString().split(' ')[0].slice(0, 5))
    } else {
      // デフォルトは現在の日本時間
      const now = new Date()
      setDate(now.toISOString().split('T')[0])
      setTime(now.toTimeString().split(' ')[0].slice(0, 5))
      
      // 初期値として現在の日本時間をUTC形式で親コンポーネントに通知
      onChange(now.toISOString())
    }
    
    isInitialized.current = true
  }, [onChange, value]) // 依存関係を追加

  // 日付変更時の処理
  const handleDateChange = (newDate: string) => {
    setDate(newDate)
    if (newDate && time) {
      // 日本時間の日時文字列を作成
      const japanDateTimeString = `${newDate}T${time}:00+09:00`
      // UTCに変換
      const utcDateTime = new Date(japanDateTimeString)
      onChange(utcDateTime.toISOString())
    }
  }

  // 時刻変更時の処理
  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (date && newTime) {
      // 日本時間の日時文字列を作成
      const japanDateTimeString = `${date}T${newTime}:00+09:00`
      // UTCに変換
      const utcDateTime = new Date(japanDateTimeString)
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px] text-base"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">時刻</label>
          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px] text-base"
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