import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Trophy,
  Flame,
  Target,
  CheckCircle,
  Calendar,
  TrendingUp,
  Star,
  Award,
} from 'lucide-react'
import Card, { StatCard } from '../components/ui/Card'
import Heatmap from '../components/heatmap/Heatmap'
import api from '../lib/api'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../lib/constants'
import type { ChallengeReport, Challenge } from '../types'

export default function ChallengeReportPage() {
  const { id } = useParams<{ id: string }>()
  const { addToast } = useToast()
  const [report, setReport] = useState<ChallengeReport | null>(null)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) loadReport()
  }, [id])

  async function loadReport() {
    try {
      setLoading(true)
      setError(null)
      const [reportData, challengeData] = await Promise.all([
        api.getReport(id!),
        api.getChallenge(id!),
      ])
      setReport(reportData)
      setChallenge(challengeData)
    } catch (err: any) {
      const msg = err?.message || 'Failed to load report'
      setError(msg)
      addToast('error', msg)
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

  if (error || !report) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Link
          to={id ? `/challenges/${id}` : '/dashboard'}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Challenge
        </Link>
        <Card hover={false} className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-warning" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Report Not Available</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            {error || 'This challenge has not ended yet. Reports are generated after the challenge end date.'}
          </p>
        </Card>
      </div>
    )
  }

  const completionGrade =
    report.completionRate >= 90 ? { label: 'Excellent', color: 'text-success', icon: <Star size={20} className="text-success fill-success" /> } :
    report.completionRate >= 75 ? { label: 'Great', color: 'text-accent', icon: <Award size={20} className="text-accent" /> } :
    report.completionRate >= 50 ? { label: 'Good', color: 'text-warning', icon: <TrendingUp size={20} className="text-warning" /> } :
    { label: 'Needs Improvement', color: 'text-danger', icon: <Target size={20} className="text-danger" /> }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          to={`/challenges/${id}`}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Challenge
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
            <Trophy size={20} className="text-bg-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Challenge Report</h1>
            <p className="text-text-muted text-sm">
              {challenge?.name} — {challenge && `${formatDate(challenge.startDate)} to ${formatDate(challenge.endDate)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Grade / Hero Card */}
      <Card hover={false} className="text-center py-10" glow>
        <div className="w-20 h-20 rounded-2xl bg-accent-muted flex items-center justify-center mx-auto mb-4">
          {completionGrade.icon}
        </div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Overall Performance</p>
        <p className={`text-4xl font-black ${completionGrade.color}`}>{completionGrade.label}</p>
        <p className="text-5xl font-black text-accent mt-2">{report.completionRate}%</p>
        <p className="text-sm text-text-muted mt-1">mandatory task completion rate</p>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Final Score"
          value={report.finalScore.toLocaleString()}
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="Longest Streak"
          value={report.longestStreak}
          sublabel="days"
          icon={<Flame size={20} />}
        />
        <StatCard
          label="Tasks Completed"
          value={`${report.completedTasks}/${report.totalTasks}`}
          icon={<CheckCircle size={20} />}
        />
        <StatCard
          label="Generated"
          value={formatDate(report.generatedAt)}
          icon={<Calendar size={20} />}
        />
      </div>

      {/* Best & Worst Days */}
      <div className="grid lg:grid-cols-2 gap-4">
        {report.bestDay && (
          <Card hover={false}>
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-success fill-success" />
              <h3 className="text-sm font-semibold">Best Day</h3>
            </div>
            <p className="text-2xl font-bold text-success">{Math.round(report.bestDay.completionRate)}%</p>
            <p className="text-xs text-text-muted mt-1">
              {formatDate(report.bestDay.date)} — Score: {report.bestDay.score}
            </p>
          </Card>
        )}
        {report.worstDay && (
          <Card hover={false}>
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-warning" />
              <h3 className="text-sm font-semibold">Worst Day</h3>
            </div>
            <p className="text-2xl font-bold text-warning">{Math.round(report.worstDay.completionRate)}%</p>
            <p className="text-xs text-text-muted mt-1">
              {formatDate(report.worstDay.date)} — Score: {report.worstDay.score}
            </p>
          </Card>
        )}
      </div>

      {/* Category Breakdown */}
      {report.categoryBreakdown && report.categoryBreakdown.length > 0 && (
        <Card hover={false}>
          <h3 className="text-sm font-semibold mb-5">Category Breakdown</h3>
          <div className="space-y-4">
            {report.categoryBreakdown.map((cat, i) => {
              const colors = ['#84cc16', '#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ef4444', '#eab308']
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-text-secondary">
                      {cat.category.charAt(0) + cat.category.slice(1).toLowerCase()}
                    </span>
                    <span className="text-sm font-semibold">{cat.rate}%</span>
                  </div>
                  <div className="w-full h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${cat.rate}%`,
                        backgroundColor: colors[i % colors.length],
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {cat.completed} / {cat.total} tasks
                  </p>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Heatmap */}
      {report.heatmapJson && report.heatmapJson.length > 0 && (
        <Card hover={false}>
          <h3 className="text-sm font-semibold mb-4">Activity Heatmap</h3>
          <Heatmap data={report.heatmapJson.map(h => ({
            ...h,
            streakContributed: false,
            graceDayUsed: false,
          }))} />
        </Card>
      )}
    </div>
  )
}
