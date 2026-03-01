import type { Entry } from '../types/entry'

export function formatChineseDate(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export function toDayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toDayKeyFromEntry(entry: Entry): string {
  return toDayKey(new Date(entry.timestamp))
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function getMonthRange(year: number, month: number): { start: number; end: number } {
  const start = new Date(year, month, 1).getTime()
  const end = new Date(year, month + 1, 1).getTime()
  return { start, end }
}

export function toMonthInputValue(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function fromMonthInputValue(value: string): { year: number; month: number } {
  const [year, month] = value.split('-').map(Number)
  return { year, month: month - 1 }
}
