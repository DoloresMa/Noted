export type EntryType = 'good' | 'bad'

export interface EntryCheckin {
  timestamp: number
  intensityNow?: number
  note?: string
}

export interface EntryFollowUp {
  active: boolean
  nextCheckAt?: number
  checkins: EntryCheckin[]
}

export interface Entry {
  id: string
  timestamp: number
  type: EntryType
  text: string
  intensity?: number
  tag?: string
  followUp?: EntryFollowUp
  createdAt: number
}

export interface DayGroup {
  goodCount: number
  badCount: number
  entries: Entry[]
}

export type DayMap = Map<string, DayGroup>
