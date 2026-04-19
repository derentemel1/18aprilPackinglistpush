export type Person = 'AILA' | 'TRINH'
export type PersonFilter = Person | 'ALL'
export type Bag = string
export type BagFilter = string
export type TravelerStatus = 'baby' | 'minor' | 'adult'
export type AppTab = 'packing' | 'travelers'

export interface Category {
  id: string
  person: Person
  name: string
  position: number
}

export interface Item {
  id: string
  category_id: string
  name: string
  bag: Bag | null
  position: number
}

export interface Traveler {
  id: string
  user_id: string
  emoji: string
  nickname: string
  status: TravelerStatus
  position: number
}
