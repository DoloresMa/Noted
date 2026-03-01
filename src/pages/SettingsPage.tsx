import { useRef, useState } from 'react'
import { clearEntries, getAllEntries, importEntries } from '../lib/db'
import { useDataRefresh } from '../lib/data-refresh'
import type { Entry } from '../types/entry'

interface ExportData {
  version: number
  exportedAt: number
  entries: Entry[]
}

function isEntryArray(value: unknown): value is Entry[] {
  return Array.isArray(value)
}

export default function SettingsPage() {
  const [strategy, setStrategy] = useState<'merge' | 'replace'>('merge')
  const [confirmClear, setConfirmClear] = useState(false)
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { bumpVersion } = useDataRefresh()

  async function handleExport() {
    const entries = await getAllEntries()
    const payload: ExportData = {
      version: 1,
      exportedAt: Date.now(),
      entries,
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `gentle-moments-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('已导出 JSON')
  }

  async function handleFileSelect(file: File) {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as ExportData | Entry[]
      const entries = isEntryArray(data) ? data : data.entries

      if (!isEntryArray(entries)) {
        setMessage('文件格式不正确')
        return
      }

      await importEntries(entries, strategy)
      bumpVersion()
      setMessage(`导入完成（${strategy === 'merge' ? '合并' : '覆盖'}）`)
    } catch {
      setMessage('导入失败，请检查 JSON')
    }
  }

  async function handleClear() {
    await clearEntries()
    bumpVersion()
    setConfirmClear(false)
    setMessage('本地数据已清空')
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-card p-4 text-sm leading-7 text-soft shadow-soft">
        数据默认只保存在本设备浏览器中 清理浏览器数据可能导致丢失 建议导出备份
      </div>

      <div className="space-y-3 rounded-2xl bg-card p-4 shadow-soft">
        <button type="button" onClick={handleExport} className="w-full rounded-2xl border border-line px-4 py-3 text-left">
          导出数据（JSON）
        </button>

        <div className="rounded-2xl border border-line p-3">
          <p className="mb-2 text-sm text-soft">导入策略</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStrategy('merge')}
              className={`rounded-full border px-3 py-1 text-sm ${
                strategy === 'merge' ? 'border-ink bg-ink text-card' : 'border-line text-soft'
              }`}
            >
              合并
            </button>
            <button
              type="button"
              onClick={() => setStrategy('replace')}
              className={`rounded-full border px-3 py-1 text-sm ${
                strategy === 'replace' ? 'border-ink bg-ink text-card' : 'border-line text-soft'
              }`}
            >
              覆盖
            </button>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-3 w-full rounded-xl border border-line px-3 py-2 text-left"
          >
            导入数据（JSON）
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                void handleFileSelect(file)
              }
              event.target.value = ''
            }}
          />
        </div>

        <div className="rounded-2xl border border-line p-3">
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="w-full rounded-xl border border-line px-3 py-2 text-left text-bad"
          >
            清空本地数据
          </button>
          {confirmClear && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-2 w-full rounded-xl bg-bad px-3 py-2 text-card"
            >
              确认清空
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-soft">{message}</p>
    </section>
  )
}
