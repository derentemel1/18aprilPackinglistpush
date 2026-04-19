export type Person = 'AILA' | 'TRINH'
export type PersonFilter = Person | 'ALL'
export type Bag = string
export type BagFilter = string
export type TravelerStatus = 'baby' | 'minor' | 'adult'
export type AppTab = 'packing' | 'travelers' | 'journeys'

export interface Journey {
  id: string
  owner_id: string
  name: string
  cdc_link: string | null
  created_at: string
}

export interface FlightSegment {
  id: string
  journey_id: string
  position: number
  departure_airport: string
  arrival_airport: string
  departure_time: string
  arrival_time: string
  airline: string
  flight_number: string | null
  baggage_url: string | null
  infant_baggage_url: string | null
}

export interface Category {
  id: string
  person: Person
  traveler_id: string | null
  journey_id: string | null
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

export interface JourneyTravelerBag {
  journey_id: string
  traveler_id: string
  bag_type: string
}

export const BAG_OPTIONS = [
  'Checked Bag 1',
  'Checked Bag 2',
  'Carry-On',
  'Personal Item',
  'Diaper Bag',
] as const
