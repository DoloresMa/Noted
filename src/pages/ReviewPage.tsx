import { useEffect, useMemo, useState } from 'react'
import { getEntriesByMonth } from '../lib/db'
import { fromMonthInputValue, toMonthInputValue } from '../lib/date'
import { useDataRefresh } from '../lib/data-refresh'
import type { Entry } from '../types/entry'

export default function ReviewPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [entries, setEntries] = useState<Entry[]>([])
  const { version } = useDataRefresh()

  useEffect(() => {
    let active = true

    getEntriesByMonth(year, month).then((result) => {
      if (!active) return
      setEntries(result)
    })

    return () => {
      active = false
    }
  }, [year, month, version])

  const { goodCount, badCount } = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        if (entry.type === 'good') {
          acc.goodCount += 1
        } else {
          acc.badCount += 1
        }
        return acc
      },
      { goodCount: 0, badCount: 0 },
    )
  }, [entries])

  return (
    <section className="space-y-4">
      <header className="rounded-2xl bg-card p-4 shadow-soft">
        <label htmlFor="month" className="mb-2 block text-sm text-soft">
          选择月份
        </label>
        <input
          id="month"
          type="month"
          value={toMonthInputValue(year, month)}
          onChange={(event) => {
            const value = fromMonthInputValue(event.target.value)
            setYear(value.year)
            setMonth(value.month)
          }}
          className="w-full rounded-xl border border-line bg-card px-3 py-2"
        />
      </header>

      <div className="rounded-2xl bg-card p-5 shadow-soft">
        <p className="text-lg leading-8 text-ink">这个月 你留下了 {entries.length} 个瞬间</p>
        <p className="mt-4 text-xl text-ink">
          🌤 {goodCount} &nbsp; 🌧 {badCount}
        </p>
        <p className="mt-6 text-base text-soft">生活没有只朝一个方向走</p>
      </div>
    </section>
  )
}
