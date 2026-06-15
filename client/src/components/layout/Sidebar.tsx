import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  User,
  Archive,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/challenges/new', label: 'New Challenge', icon: PlusCircle },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/archive', label: 'Archive', icon: Archive },
  { path: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`
        h-screen sticky top-0 flex flex-col
        bg-bg-secondary border-r border-border
        transition-all duration-300
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
          <Flame size={18} className="text-bg-primary" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-text-primary tracking-tight">
            CHALLENGEFORGE
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/dashboard' && location.pathname.startsWith('/challenges/') && !location.pathname.includes('/new'))
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-accent-muted text-accent'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  )
}
