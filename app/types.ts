export type Person = 'AILA' | 'TRINH'
export type PersonFilter = Person | 'ALL'
export type Bag = string
export type BagFilter = string

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
