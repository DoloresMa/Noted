import { useMemo, useState } from 'react'
import { addEntry } from '../lib/db'
import { formatChineseDate } from '../lib/date'
import { createId } from '../lib/id'
import { useDataRefresh } from '../lib/data-refresh'

const goodTags = [
  { label: '关系', tip: '来自人与人的连接' },
  { label: '成就', tip: '完成或达成某件事' },
  { label: '进展', tip: '事情向前推进' },
  { label: '被看见', tip: '被理解或被认可' },
  { label: '自我认可', tip: '对自己满意' },
  { label: '体验', tip: '当下的感官或场景' },
  { label: '身体舒适', tip: '身体状态带来的轻松' },
  { label: '意外收获', tip: '没有预期的小惊喜' },
  { label: '安全感', tip: '稳定或确定感' },
]

type FlowMode = 'idle' | 'good' | 'bad'

export default function HomePage() {
  const [mode, setMode] = useState<FlowMode>('idle')
  const [text, setText] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [tag, setTag] = useState('')
  const [toast, setToast] = useState('')
  const [savedPulse, setSavedPulse] = useState(false)
  const { bumpVersion } = useDataRefresh()

  const today = useMemo(() => formatChineseDate(new Date()), [])

  async function handleSave() {
    const trimmed = text.trim()
    if (!trimmed) {
      return
    }

    const now = Date.now()

    await addEntry({
      id: createId(),
      timestamp: now,
      type: mode === 'good' ? 'good' : 'bad',
      text: trimmed,
      intensity: mode === 'bad' ? intensity : undefined,
      tag: mode === 'good' && tag ? tag : undefined,
      createdAt: now,
    })

    bumpVersion()
    setSavedPulse(true)
    setToast(mode === 'good' ? '这一刻很好' : '已留在这里')

    window.setTimeout(() => {
      setSavedPulse(false)
    }, 220)

    window.setTimeout(() => {
      setMode('idle')
      setText('')
      setTag('')
      setIntensity(5)
      setToast('')
    }, 2000)
  }

  if (mode === 'idle') {
    return (
      <section className="space-y-8">
        <p className="text-center text-sm text-soft">{today}</p>
        <h1 className="pt-6 text-center text-2xl leading-relaxed text-ink">有些瞬间 值得被留下</h1>
        <div className="space-y-4 pt-6">
          <button
            type="button"
            className="w-full rounded-3xl border border-line bg-card px-6 py-8 text-left text-xl text-ink shadow-soft transition active:scale-[0.99]"
            onClick={() => setMode('good')}
          >
            🌤 现在挺好的
          </button>
          <button
            type="button"
            className="w-full rounded-3xl border border-line bg-card px-6 py-8 text-left text-xl text-ink shadow-soft transition active:scale-[0.99]"
            onClick={() => setMode('bad')}
          >
            🌧 现在有点难受
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={`space-y-5 ${savedPulse ? 'soft-fade-in' : ''}`}>
      <button type="button" className="text-sm text-soft" onClick={() => setMode('idle')}>
        返回
      </button>
      <h1 className="text-2xl text-ink">{mode === 'good' ? '这一刻' : '把它留在这里'}</h1>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="写下一句就好"
        rows={5}
        className="w-full rounded-2xl border border-line bg-card p-4 text-base leading-7 text-ink outline-none transition focus:border-soft"
      />

      {mode === 'good' && (
        <div className="space-y-2">
          <p className="text-sm text-soft">感觉标签（可选）</p>
          <div className="flex flex-wrap gap-2">
            {goodTags.map((item) => {
              const active = tag === item.label
              return (
                <div key={item.label} className="group relative">
                  <button
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      active ? 'border-ink bg-ink text-card' : 'border-line bg-card text-soft'
                    }`}
                    onClick={() => setTag((prev) => (prev === item.label ? '' : item.label))}
                  >
                    {item.label}
                  </button>
                  <span className="pointer-events-none absolute -top-8 left-0 hidden whitespace-nowrap rounded-full bg-ink px-2 py-1 text-xs text-card group-hover:block group-focus-within:block">
                    {item.tip}
                  </span>
                </div>
              )
            })}
          </div>
          {tag === '安全感' && (
            <p className="text-xs text-soft">这些标签是“感觉来源” 不是情绪本身</p>
          )}
        </div>
      )}

      {mode === 'bad' && (
        <div className="space-y-2">
          <label className="block text-sm text-soft" htmlFor="intensity">
            现在的分量：{intensity}
          </label>
          <input
            id="intensity"
            type="range"
            min={0}
            max={10}
            value={intensity}
            onChange={(event) => setIntensity(Number(event.target.value))}
            className="w-full accent-bad"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={!text.trim()}
        className="w-full rounded-2xl bg-ink px-4 py-3 text-base text-card transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        保存
      </button>

      {toast && (
        <div className="pointer-events-none fixed bottom-20 left-1/2 z-30 w-[min(92vw,420px)] -translate-x-1/2 px-3">
          <div className="bottom-toast rounded-2xl border border-line bg-card px-4 py-3 text-center text-sm text-ink shadow-soft">
            {toast}
          </div>
        </div>
      )}
    </section>
  )
}
