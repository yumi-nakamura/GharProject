export type OtayoriType = 'meal' | 'poop' | 'emotion'

export interface OtayoriRecord {
  id: string
  dogId: string
  userId: string
  type: OtayoriType
  content: string
  datetime: string
  photo_url?: string
  mood?: string
  tags?: string[]
  poopGuardPassword?: string
  isPoopGuarded?: boolean
  customDatetime?: string
}

export interface Like {
  id: string;
  user_id: string;
  otayori_id: string;
  created_at: string;
}

// 投稿タイプ別のタグオプション
export const TAG_OPTIONS = {
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
} as const

export type OtayoriPost = OtayoriRecord; 