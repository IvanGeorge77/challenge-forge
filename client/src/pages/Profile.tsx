import { useState, useEffect } from 'react'
import {
  User as UserIcon,
  Flame,
  Trophy,
  Target,
  CheckCircle,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import Card, { StatCard } from '../components/ui/Card'
import api from '../lib/api'
import type { User } from '../types'
import { formatDate } from '../lib/constants'

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const profile = await api.getProfile()
      setUser(profile)
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Sign in to view your profile</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* User info */}
      <Card hover={false} className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center">
          <UserIcon size={36} className="text-bg-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.name || 'Anonymous User'}</h2>
          <p className="text-sm text-text-muted">{user.email}</p>
          <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
            <Calendar size={12} />
            Member since {formatDate(user.createdAt)}
          </p>
        </div>
      </Card>

      {/* Productivity Score — Large */}
      <Card hover={false} className="text-center py-10" glow>
        <div className="w-20 h-20 rounded-2xl bg-accent-muted flex items-center justify-center mx-auto mb-4">
          <TrendingUp size={36} className="text-accent" />
        </div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Productivity Score</p>
        <p className="text-5xl font-black text-accent">{user.productivityScore.toLocaleString()}</p>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Completed Challenges"
          value={user.completedChallenges}
          icon={<Trophy size={20} />}
        />
        <StatCard
          label="Active Challenges"
          value={user.activeChallenges}
          icon={<Target size={20} />}
        />
        <StatCard
          label="Global Streak"
          value={user.globalStreak}
          sublabel="days"
          icon={<Flame size={20} />}
        />
        <StatCard
          label="Longest Global Streak"
          value={user.longestGlobalStreak}
          sublabel="days"
          icon={<Flame size={20} />}
        />
        <StatCard
          label="Total Tasks Completed"
          value={user.totalTasksCompleted}
          icon={<CheckCircle size={20} />}
        />
      </div>
    </div>
  )
}
