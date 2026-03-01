import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { DataRefreshProvider } from './lib/data-refresh'
import HomePage from './pages/HomePage'
import ReviewPage from './pages/ReviewPage'
import SettingsPage from './pages/SettingsPage'
import TimelinePage from './pages/TimelinePage'

export default function App() {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    document.title = 'Noted'
  }, [])

  const value = useMemo(
    () => ({
      version,
      bumpVersion: () => setVersion((prev) => prev + 1),
    }),
    [version],
  )

  return (
    <DataRefreshProvider value={value}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DataRefreshProvider>
  )
}
