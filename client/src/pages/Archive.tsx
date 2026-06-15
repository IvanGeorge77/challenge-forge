import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Archive as ArchiveIcon, CheckCircle, Calendar, Trophy, ArrowRight } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge, { StatusBadge } from '../components/ui/Badge'
import api from '../lib/api'
import { formatDate } from '../lib/constants'
import type { Challenge } from '../types'

export default function Archive() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArchive()
  }, [])

  async function loadArchive() {
    try {
      setLoading(true)
      const all = await api.getChallenges()
      // Show completed and archived
      setChallenges(all.filter((c: Challenge) => c.status !== 'ACTIVE'))
    } catch (err) {
      console.error('Failed to load archive:', err)
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

  // Group by year
  const grouped: Record<string, Challenge[]> = {}
  for (const c of challenges) {
    const year = new Date(c.endDate).getFullYear().toString()
    if (!grouped[year]) grouped[year] = []
    grouped[year].push(c)
  }

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Archive</h1>
        <p className="text-text-muted text-sm mt-1">Completed and archived challenges</p>
      </div>

      {years.length > 0 ? (
        years.map((year) => (
          <div key={year}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-accent" />
              {year}
            </h2>
            <div className="space-y-3">
              {grouped[year].map((challenge) => (
                <Link key={challenge.id} to={`/challenges/${challenge.id}`}>
                  <Card className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <CheckCircle size={20} className="text-success" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold group-hover:text-accent transition-colors">
                            {challenge.name}
                          </span>
                          <StatusBadge status={challenge.status} />
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          {formatDate(challenge.startDate)} — {formatDate(challenge.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-text-muted">Longest Streak</p>
                        <p className="text-sm font-semibold">{challenge.longestStreak} days</p>
                      </div>
                      <ArrowRight size={16} className="text-text-muted group-hover:text-accent transition-colors" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <Card className="text-center py-16" hover={false}>
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mx-auto mb-4">
            <ArchiveIcon size={28} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No archived challenges</h3>
          <p className="text-sm text-text-muted">Completed challenges will appear here</p>
        </Card>
      )}
    </div>
  )
}
