import { useEffect, useMemo, useState } from 'react'
import { getEntriesByMonth, groupEntriesByDay, updateEntry } from '../lib/db'
import { formatTime, toDayKey } from '../lib/date'
import { useDataRefresh } from '../lib/data-refresh'
import type { DayGroup, Entry, EntryCheckin } from '../types/entry'

interface DayCell {
  date: Date
  inCurrentMonth: boolean
}

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

function getCalendarCells(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1)
  const startDay = first.getDay()
  const startDate = new Date(year, month, 1 - startDay)
  const cells: DayCell[] = []

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    cells.push({
      date,
      inCurrentMonth: date.getMonth() === month,
    })
  }

  return cells
}

function getDotMarks(group?: DayGroup): string[] {
  if (!group) return []

  const all = [
    ...Array.from({ length: group.badCount }, () => 'bad'),
    ...Array.from({ length: group.goodCount }, () => 'good'),
  ]

  return all.slice(0, 3)
}

function getLatestCheckin(entry: Entry): EntryCheckin | undefined {
  const checkins = entry.followUp?.checkins
  if (!checkins || checkins.length === 0) {
    return undefined
  }

  return checkins.reduce((latest, current) =>
    current.timestamp > latest.timestamp ? current : latest,
  )
}

export default function TimelinePage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [dayMap, setDayMap] = useState<Map<string, DayGroup>>(new Map())
  const [selectedDay, setSelectedDay] = useState('')
  const [expandedId, setExpandedId] = useState('')
  const [checkinTargetId, setCheckinTargetId] = useState('')
  const [checkinIntensity, setCheckinIntensity] = useState(5)
  const [checkinNote, setCheckinNote] = useState('')
  const { version, bumpVersion } = useDataRefresh()

  useEffect(() => {
    let active = true

    getEntriesByMonth(year, month).then((entries) => {
      if (!active) return
      setDayMap(groupEntriesByDay(entries))
    })

    return () => {
      active = false
    }
  }, [year, month, version])

  const cells = useMemo(() => getCalendarCells(year, month), [year, month])
  const selectedEntries = selectedDay ? dayMap.get(selectedDay)?.entries ?? [] : []

  function moveMonth(offset: number) {
    const next = new Date(year, month + offset, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
    setSelectedDay('')
    setExpandedId('')
    setCheckinTargetId('')
  }

  function setToday() {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDay(toDayKey(today))
    setExpandedId('')
    setCheckinTargetId('')
  }

  function openCheckin(entry: Entry) {
    setCheckinTargetId(entry.id)
    setCheckinIntensity(entry.intensity ?? 5)
    setCheckinNote('')
  }

  async function saveCheckin(entry: Entry) {
    const nextCheckin: EntryCheckin = {
      timestamp: Date.now(),
      intensityNow: checkinIntensity,
      note: checkinNote.trim() || undefined,
    }

    const updated: Entry = {
      ...entry,
      followUp: {
        active: true,
        nextCheckAt: entry.followUp?.nextCheckAt,
        checkins: [...(entry.followUp?.checkins ?? []), nextCheckin],
      },
    }

    await updateEntry(updated)

    setDayMap((prev) => {
      if (!selectedDay) return prev
      const copied = new Map(prev)
      const dayGroup = copied.get(selectedDay)
      if (!dayGroup) return prev

      const nextEntries = dayGroup.entries.map((item) => (item.id === entry.id ? updated : item))
      copied.set(selectedDay, {
        ...dayGroup,
        entries: nextEntries,
      })

      return copied
    })

    setCheckinTargetId('')
    setCheckinNote('')
    bumpVersion()
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-soft">
        <button type="button" className="text-sm text-soft" onClick={() => moveMonth(-1)}>
          上月
        </button>
        <h1 className="text-lg text-ink">
          {year}年{month + 1}月
        </h1>
        <div className="flex items-center gap-3">
          <button type="button" className="text-sm text-soft" onClick={setToday}>
            今天
          </button>
          <button type="button" className="text-sm text-soft" onClick={() => moveMonth(1)}>
            下月
          </button>
        </div>
      </header>

      <div className="rounded-2xl bg-card p-3 shadow-soft">
        <div className="mb-2 grid grid-cols-7 gap-2">
          {weekLabels.map((day) => (
            <p key={day} className="text-center text-xs text-soft">
              {day}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell) => {
            const key = toDayKey(cell.date)
            const group = dayMap.get(key)
            const dots = getDotMarks(group)
            const overflow = group ? group.badCount + group.goodCount - dots.length : 0

            return (
              <button
                type="button"
                key={key}
                onClick={() => {
                  setSelectedDay(key)
                  setExpandedId('')
                  setCheckinTargetId('')
                }}
                className={`flex min-h-16 flex-col rounded-xl border px-1 py-1 text-left transition ${
                  selectedDay === key ? 'border-ink bg-cream' : 'border-line bg-card'
                }`}
              >
                <span className={`text-xs ${cell.inCurrentMonth ? 'text-ink' : 'text-soft/60'}`}>
                  {cell.date.getDate()}
                </span>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {dots.map((dot, index) => (
                    <span key={`${key}-${dot}-${index}`} className={dot === 'bad' ? 'text-bad' : 'text-good'}>
                      {dot === 'bad' ? '●' : '○'}
                    </span>
                  ))}
                  {overflow > 0 && <span className="text-soft">+</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-20 bg-black/20" onClick={() => setSelectedDay('')}>
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-auto rounded-t-3xl bg-card p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
            <h2 className="text-lg text-ink">{selectedDay}</h2>
            <ul className="mt-3 space-y-2">
              {selectedEntries.length === 0 && <li className="text-sm text-soft">这一天没有记录</li>}
              {selectedEntries.map((entry: Entry) => {
                const expanded = expandedId === entry.id
                const latestCheckin = getLatestCheckin(entry)
                const todayIntensity = latestCheckin?.intensityNow
                const hasTodayIntensity = typeof todayIntensity === 'number'

                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedId((prev) => (prev === entry.id ? '' : entry.id))
                        setCheckinTargetId('')
                      }}
                      className="w-full rounded-2xl border border-line px-3 py-2 text-left"
                    >
                      <p className="text-sm text-soft">
                        {formatTime(entry.timestamp)} {entry.type === 'good' ? '🌤' : '🌧'}
                      </p>
                      <p className={`${expanded ? 'whitespace-pre-wrap' : 'truncate'} text-sm text-ink`}>{entry.text}</p>
                      {!expanded && entry.type === 'bad' && hasTodayIntensity && typeof entry.intensity === 'number' && (
                        <p className="mt-1 text-xs text-soft">昨天{entry.intensity}→今天{todayIntensity}</p>
                      )}
                    </button>

                    {expanded && entry.type === 'bad' && (
                      <div className="mt-2 rounded-2xl border border-line bg-cream p-3">
                        <p className="text-sm text-ink">情绪曲线</p>
                        <p className="mt-1 text-sm text-soft">昨天：{entry.intensity ?? '-'}</p>
                        {hasTodayIntensity && <p className="text-sm text-soft">今天：{todayIntensity}</p>}
                        {hasTodayIntensity && typeof entry.intensity === 'number' && (
                          <p className="mt-1 text-sm text-ink">昨天：{entry.intensity} 今天：{todayIntensity}</p>
                        )}

                        <button
                          type="button"
                          onClick={() => openCheckin(entry)}
                          className="mt-3 rounded-xl border border-line px-3 py-1.5 text-sm text-soft"
                        >
                          补充一次
                        </button>

                        {checkinTargetId === entry.id && (
                          <div className="mt-3 space-y-2 rounded-xl border border-line bg-card p-3">
                            <label className="block text-sm text-soft" htmlFor={`checkin-${entry.id}`}>
                              今天：{checkinIntensity}
                            </label>
                            <input
                              id={`checkin-${entry.id}`}
                              type="range"
                              min={0}
                              max={10}
                              value={checkinIntensity}
                              onChange={(event) => setCheckinIntensity(Number(event.target.value))}
                              className="w-full accent-bad"
                            />
                            <label className="block text-sm text-soft" htmlFor={`checkin-note-${entry.id}`}>
                              补一句
                            </label>
                            <input
                              id={`checkin-note-${entry.id}`}
                              type="text"
                              value={checkinNote}
                              onChange={(event) => setCheckinNote(event.target.value)}
                              placeholder="现在的一句也可以"
                              className="w-full rounded-xl border border-line bg-card px-3 py-2 text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="rounded-xl bg-ink px-3 py-1.5 text-sm text-card"
                                onClick={() => {
                                  void saveCheckin(entry)
                                }}
                              >
                                保存
                              </button>
                              <button
                                type="button"
                                className="rounded-xl border border-line px-3 py-1.5 text-sm text-soft"
                                onClick={() => setCheckinTargetId('')}
                              >
                                就这样
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
