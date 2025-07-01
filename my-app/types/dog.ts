export interface DogProfile {
  id: string
  name: string
  breed: string | null
  birthday: string | null
  gender: string | null
  weight: number | null
  color: string | null
  size: string | null
  character: string | null
  charm_point: string | null
  vaccine_info: string[] | null
  caution: string | null
  medical_history: string[] | null
  likes: string[] | null
  dislikes: string[] | null
  image_url: string | null
  owner_id: string
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
} 