"use client"
import { useState } from 'react'
import { X } from 'lucide-react'

interface TagSelectorProps {
  type: 'meal' | 'poop' | 'emotion' | null
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export default function TagSelector({ type, selectedTags, onTagsChange }: TagSelectorProps) {
  const [customTag, setCustomTag] = useState('')

  // 投稿タイプ別のタグオプション
  const tagOptions = {
    meal: [
      '完食', '残食', 'おいしそう', '食欲旺盛', 'ゆっくり食べた', 
      '早食い', 'おやつも食べた', 'ドッグフード', '手作りごはん'
    ],
    poop: [
      '良い状態', 'やや軟便', '下痢', '便秘', '量が多い', '量が少ない',
      '色が良い', '色が悪い', '臭いが強い', '臭いが弱い'
    ],
    emotion: [
      '元気', '嬉しい', '楽しい', 'リラックス', '興奮', '不安',
      '寂しい', '怒っている', '悲しい', '満足', '疲れている'
    ]
  }

  const currentOptions = type ? tagOptions[type] : []

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const handleCustomTagAdd = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      onTagsChange([...selectedTags, customTag.trim()])
      setCustomTag('')
    }
  }

  const handleCustomTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCustomTagAdd()
    }
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove))
  }

  if (!type) return null

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">タグを選択</h4>
        <div className="flex flex-wrap gap-2">
          {currentOptions.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* カスタムタグ入力 */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">カスタムタグを追加</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={handleCustomTagKeyPress}
            placeholder="新しいタグを入力"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleCustomTagAdd}
            disabled={!customTag.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            追加
          </button>
        </div>
      </div>

      {/* 選択されたタグ表示 */}
      {selectedTags.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">選択されたタグ</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-orange-900"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
