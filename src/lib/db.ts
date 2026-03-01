import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { DayMap, Entry } from '../types/entry'
import { getMonthRange, toDayKeyFromEntry } from './date'

interface MomentsDB extends DBSchema {
  entries: {
    key: string
    value: Entry
    indexes: {
      timestamp: number
      createdAt: number
    }
  }
}

const DB_NAME = 'gentle-moments-db'
const DB_VERSION = 1
const ENTRY_STORE = 'entries'

let dbPromise: Promise<IDBPDatabase<MomentsDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MomentsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(ENTRY_STORE, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp')
        store.createIndex('createdAt', 'createdAt')
      },
    })
  }

  return dbPromise
}

export async function addEntry(entry: Entry): Promise<void> {
  const db = await getDB()
  await db.put(ENTRY_STORE, entry)
}

export async function updateEntry(entry: Entry): Promise<void> {
  const db = await getDB()
  await db.put(ENTRY_STORE, entry)
}

export async function getAllEntries(): Promise<Entry[]> {
  const db = await getDB()
  const entries = await db.getAllFromIndex(ENTRY_STORE, 'timestamp')
  return entries.sort((a, b) => b.timestamp - a.timestamp)
}

export async function getEntriesByMonth(year: number, month: number): Promise<Entry[]> {
  const db = await getDB()
  const { start, end } = getMonthRange(year, month)
  const range = IDBKeyRange.bound(start, end, false, true)
  const entries = await db.getAllFromIndex(ENTRY_STORE, 'timestamp', range)
  return entries.sort((a, b) => b.timestamp - a.timestamp)
}

export function groupEntriesByDay(entries: Entry[]): DayMap {
  const map: DayMap = new Map()

  for (const entry of entries) {
    const key = toDayKeyFromEntry(entry)
    const target = map.get(key) ?? {
      goodCount: 0,
      badCount: 0,
      entries: [],
    }

    if (entry.type === 'good') {
      target.goodCount += 1
    } else {
      target.badCount += 1
    }

    target.entries.push(entry)
    map.set(key, target)
  }

  for (const [, value] of map) {
    value.entries.sort((a, b) => b.timestamp - a.timestamp)
  }

  return map
}

export async function clearEntries(): Promise<void> {
  const db = await getDB()
  await db.clear(ENTRY_STORE)
}

export async function importEntries(entries: Entry[], strategy: 'merge' | 'replace'): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(ENTRY_STORE, 'readwrite')

  if (strategy === 'replace') {
    await tx.store.clear()
  }

  for (const entry of entries) {
    await tx.store.put(entry)
  }

  await tx.done
}
