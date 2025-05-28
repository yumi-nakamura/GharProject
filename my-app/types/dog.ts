export interface DogProfile {
  id: string
  name: string
  breed: string
  avatarUrl?: string
  birthday?: string
  color?: string
  size?: string
  charmPoint?: string
  vaccineInfo?: string[]
  caution?: string
  medicalHistory?: string[]
  likes?: string[]
  dislikes?: string[]
  ownerId: string
  familyIds?: string[]
  vetIds?: string[]
  weight?: number
  gender?: string
  character?: string
  image_url?: string
} 