import { Link, useLocation } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  User,
  Archive,
  Flame,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/challenges/new', label: 'New Challenge', icon: PlusCircle },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/archive', label: 'Archive', icon: Archive },
  { path: '/profile', label: 'Profile', icon: User },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const { signOut } = useClerk()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' })
  }

  const handleNavClick = () => {
    // Close mobile sidebar on navigation
    if (onMobileClose) onMobileClose()
  }

  return (
    <>
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          h-screen flex flex-col bg-bg-secondary border-r border-border
          transition-all duration-300 z-50

          /* Desktop: sticky sidebar */
          hidden lg:flex lg:sticky lg:top-0
          ${collapsed ? 'lg:w-[72px]' : 'lg:w-[240px]'}

          /* Mobile: slide-over drawer */
          ${mobileOpen ? '!flex fixed top-0 left-0 w-[280px] shadow-2xl animate-slide-in' : ''}
        `}
      >
        {/* Logo + Mobile close */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
              <Flame size={18} className="text-bg-primary" />
            </div>
            {(!collapsed || mobileOpen) && (
              <span className="text-sm font-bold text-text-primary tracking-tight">
                CHALLENGEFORGE
              </span>
            )}
          </div>
          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              <X size={20} />
            </button>
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
                onClick={handleNavClick}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-accent-muted text-accent'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                  }
                `}
                title={collapsed && !mobileOpen ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom area: Sign out + Collapse toggle */}
        <div className="p-3 border-t border-border space-y-1">
          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-text-muted hover:text-danger hover:bg-danger/10 transition-colors
            `}
            title={collapsed && !mobileOpen ? 'Sign out' : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>Sign out</span>}
          </button>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  )
}
