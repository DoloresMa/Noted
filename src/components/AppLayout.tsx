import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-cream px-4">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col">
        <main className="flex-1 pb-4 pt-6">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
