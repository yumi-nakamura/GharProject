export type OtayoriType = 'meal' | 'poop' | 'emotion'

export interface OtayoriRecord {
  id: string
  dogId: string
  userId: string
  type: OtayoriType
  content: string
  datetime: string
  photoUrl: string
  mood?: string
  tags?: string[]
} 