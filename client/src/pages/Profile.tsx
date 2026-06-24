import { useState, useEffect } from 'react'
import { useClerk } from '@clerk/clerk-react'
import {
  User as UserIcon,
  Flame,
  Trophy,
  Target,
  CheckCircle,
  Calendar,
  TrendingUp,
  LogOut,
  Save,
  Edit3,
} from 'lucide-react'
import Card, { StatCard } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import api from '../lib/api'
import { useToast } from '../context/ToastContext'
import type { User } from '../types'
import { formatDate } from '../lib/constants'

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'America/New_York', label: 'US Eastern' },
  { value: 'America/Chicago', label: 'US Central' },
  { value: 'America/Denver', label: 'US Mountain' },
  { value: 'America/Los_Angeles', label: 'US Pacific' },
  { value: 'Europe/London', label: 'UK (GMT/BST)' },
  { value: 'Europe/Berlin', label: 'Central Europe' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Asia/Shanghai', label: 'China (CST)' },
  { value: 'Australia/Sydney', label: 'Australia (AEST)' },
  { value: 'Pacific/Auckland', label: 'New Zealand (NZST)' },
  { value: 'UTC', label: 'UTC' },
]

export default function Profile() {
  const { signOut } = useClerk()
  const { addToast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', timezone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const profile = await api.getProfile()
      setUser(profile)
    } catch (err) {
      addToast('error', 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  function openEdit() {
    if (user) {
      setEditForm({ name: user.name || '', timezone: user.timezone })
      setEditModal(true)
    }
  }

  async function handleSaveProfile() {
    try {
      setSaving(true)
      const updated = await api.updateProfile(editForm)
      setUser(updated)
      setEditModal(false)
      addToast('success', 'Profile updated')
    } catch (err) {
      addToast('error', 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  function handleSignOut() {
    signOut({ redirectUrl: '/' })
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit3 size={16} />}
            onClick={openEdit}
          >
            Edit Profile
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<LogOut size={16} />}
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>

      {/* User info */}
      <Card hover={false} className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center flex-shrink-0">
          <UserIcon size={36} className="text-bg-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.name || 'Anonymous User'}</h2>
          <p className="text-sm text-text-muted">{user.email}</p>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Calendar size={12} />
              Member since {formatDate(user.createdAt)}
            </p>
            <p className="text-xs text-text-muted">
              🌍 {user.timezone}
            </p>
          </div>
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

      {/* Edit Profile Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Profile">
        <div className="space-y-4">
          <Input
            label="Display Name"
            placeholder="Your name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Select
            label="Timezone"
            value={editForm.timezone}
            onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
            options={TIMEZONE_OPTIONS}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} loading={saving} icon={<Save size={16} />}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
