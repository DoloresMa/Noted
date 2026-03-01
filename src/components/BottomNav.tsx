import { Link, useLocation } from 'react-router-dom'

const items = [
  { to: '/', label: 'Home' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/review', label: 'Review' },
  { to: '/settings', label: 'Settings' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="sticky bottom-0 border-t border-line bg-card/90 backdrop-blur">
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {items.map((item) => {
          const active = location.pathname === item.to
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`block py-3 text-center text-sm transition ${
                  active ? 'text-ink font-medium' : 'text-soft'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
