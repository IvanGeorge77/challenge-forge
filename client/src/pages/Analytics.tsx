import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Target, Layers } from 'lucide-react'
import Card, { StatCard } from '../components/ui/Card'
import CategoryChart from '../components/analytics/CategoryChart'
import DifficultyChart from '../components/analytics/DifficultyChart'
import api from '../lib/api'
import type { OverviewStats, CategoryBreakdown, DifficultyBreakdown } from '../types'

export default function Analytics() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [categories, setCategories] = useState<CategoryBreakdown[]>([])
  const [difficulties, setDifficulties] = useState<DifficultyBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const [s, c, d] = await Promise.all([
        api.getOverviewStats(),
        api.getCategoryBreakdown(),
        api.getDifficultyBreakdown(),
      ])
      setStats(s)
      setCategories(c)
      setDifficulties(d)
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics')
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const difficultyColors: Record<string, string> = {
    EASY: '#22c55e',
    MEDIUM: '#eab308',
    HARD: '#ef4444',
  }

  const categoryColors = ['#84cc16', '#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ef4444', '#eab308']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-text-muted text-sm mt-1">Insights into your productivity performance</p>
        </div>
        <Card hover={false} className="text-center py-16">
          <p className="text-text-muted mb-4">{error}</p>
          <button onClick={loadData} className="text-accent hover:underline text-sm font-medium">
            Retry
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-text-muted text-sm mt-1">Insights into your productivity performance</p>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Last 7 Day Avg"
            value={`${stats.last7DayAverage}%`}
            icon={<TrendingUp size={20} />}
          />
          <StatCard
            label="Active Challenges"
            value={stats.activeChallenges}
            icon={<Target size={20} />}
          />
          <StatCard
            label="Completed Challenges"
            value={stats.completedChallenges}
            icon={<BarChart3 size={20} />}
          />
          <StatCard
            label="Total Tasks Done"
            value={stats.totalTasksCompleted}
            icon={<Layers size={20} />}
          />
        </div>
      )}

      {/* Recharts Visualizations */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card hover={false}>
          <h3 className="text-sm font-semibold mb-3">Category Radar</h3>
          <CategoryChart data={categories} />
        </Card>
        <Card hover={false}>
          <h3 className="text-sm font-semibold mb-3">Difficulty Distribution</h3>
          <DifficultyChart data={difficulties} />
        </Card>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card hover={false}>
          <h3 className="text-sm font-semibold mb-5">Category Performance</h3>
          {categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((cat, i) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-text-secondary">
                      {cat.category.charAt(0) + cat.category.slice(1).toLowerCase()}
                    </span>
                    <span className="text-sm font-semibold">{cat.completionRate}%</span>
                  </div>
                  <div className="w-full h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${cat.completionRate}%`,
                        backgroundColor: categoryColors[i % categoryColors.length],
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {cat.completed} / {cat.total} tasks
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted py-8 text-center">No data yet</p>
          )}
        </Card>

        {/* Difficulty Breakdown */}
        <Card hover={false}>
          <h3 className="text-sm font-semibold mb-5">Difficulty Breakdown</h3>
          {difficulties.length > 0 ? (
            <div className="space-y-4">
              {difficulties.map((diff) => (
                <div key={diff.difficulty}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: difficultyColors[diff.difficulty] || '#84cc16' }}
                      />
                      <span className="text-sm text-text-secondary">
                        {diff.difficulty.charAt(0) + diff.difficulty.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">{diff.completionRate}%</span>
                  </div>
                  <div className="w-full h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${diff.completionRate}%`,
                        backgroundColor: difficultyColors[diff.difficulty] || '#84cc16',
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {diff.completed} / {diff.total} tasks
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted py-8 text-center">No data yet</p>
          )}
        </Card>
      </div>
    </div>
  )
}
