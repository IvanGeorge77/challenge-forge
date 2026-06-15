import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Flame, TrendingUp, CheckCircle, Target } from 'lucide-react'
import Card, { StatCard } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { DifficultyBadge, StatusBadge } from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import Modal from '../components/ui/Modal'
import api from '../lib/api'
import type { DailyTaskGroup, OverviewStats, MissedDay } from '../types'

export default function Dashboard() {
  const [dailyData, setDailyData] = useState<{ tasks: DailyTaskGroup[]; missedDays: MissedDay[] }>({ tasks: [], missedDays: [] })
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [graceDayModal, setGraceDayModal] = useState<MissedDay | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [dailyRes, statsRes] = await Promise.all([
        api.getDailyTasks(),
        api.getOverviewStats(),
      ])
      setDailyData(dailyRes)
      setStats(statsRes)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleTask(instanceId: string, completed: boolean) {
    try {
      if (completed) {
        await api.uncompleteTask(instanceId)
      } else {
        await api.completeTask(instanceId)
      }
      loadData()
    } catch (err) {
      console.error('Failed to toggle task:', err)
    }
  }

  async function handleGraceDay(challengeId: string, date: string) {
    try {
      await api.applyGraceDay(challengeId, date)
      setGraceDayModal(null)
      loadData()
    } catch (err) {
      console.error('Failed to apply grace day:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/challenges/new">
          <Button icon={<PlusCircle size={18} />}>New Challenge</Button>
        </Link>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Today's Completion"
            value={`${stats.todayCompletion}%`}
            icon={<Target size={20} />}
          />
          <StatCard
            label="Global Streak"
            value={stats.globalStreak}
            sublabel="days"
            icon={<Flame size={20} />}
          />
          <StatCard
            label="Tasks Completed"
            value={stats.totalTasksCompleted}
            icon={<CheckCircle size={20} />}
          />
          <StatCard
            label="Productivity Score"
            value={stats.productivityScore}
            icon={<TrendingUp size={20} />}
          />
        </div>
      )}

      {/* Missed Day Alerts */}
      {dailyData.missedDays?.length > 0 && (
        <div className="space-y-3">
          {dailyData.missedDays.map((missed) => (
            <div key={`${missed.challengeId}-${missed.date}`} className="glass-card p-4 border-warning/30 bg-warning/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-warning">⚠️ Missed Day — {missed.challengeName}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    You missed all mandatory tasks yesterday. Grace days remaining: {missed.graceDaysRemaining}
                  </p>
                </div>
                <div className="flex gap-2">
                  {missed.graceDaysRemaining > 0 && (
                    <Button size="sm" variant="outline" onClick={() => setGraceDayModal(missed)}>
                      Use Grace Day
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">Break Streak</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Tasks by Challenge */}
      {dailyData.tasks?.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Today's Tasks</h2>
          {dailyData.tasks.map((group) => (
            <Card key={group.challengeId} className="!p-0 overflow-hidden" hover={false}>
              {/* Challenge header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <Link
                  to={`/challenges/${group.challengeId}`}
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <span className="text-sm font-semibold">{group.challengeName}</span>
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted">
                    {group.mandatoryCompleted}/{group.mandatoryTotal} mandatory
                  </span>
                  <ProgressBar
                    value={group.completionRate}
                    showLabel={false}
                    size="sm"
                    className="w-24"
                  />
                </div>
              </div>

              {/* Task list */}
              <div className="divide-y divide-border/50">
                {group.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 px-5 py-3 hover:bg-bg-elevated/50 transition-colors ${
                      task.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id, task.completed)}
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${task.completed ? 'line-through text-text-muted' : ''}`}>
                        {task.taskBlueprint.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={task.taskBlueprint.difficulty} />
                      {task.taskBlueprint.taskType === 'OPTIONAL' && (
                        <Badge variant="default">Optional</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16" hover={false}>
          <div className="w-16 h-16 rounded-2xl bg-accent-dim flex items-center justify-center mx-auto mb-4">
            <Target size={28} className="text-accent" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No active challenges</h3>
          <p className="text-sm text-text-muted mb-6">Create your first challenge to start tracking daily progress</p>
          <Link to="/challenges/new">
            <Button icon={<PlusCircle size={18} />}>Create Challenge</Button>
          </Link>
        </Card>
      )}

      {/* Grace Day Modal */}
      <Modal
        isOpen={!!graceDayModal}
        onClose={() => setGraceDayModal(null)}
        title="Use Grace Day?"
      >
        {graceDayModal && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              You missed all mandatory tasks for <strong>{graceDayModal.challengeName}</strong> on {graceDayModal.date}.
              Using a grace day will preserve your streak.
            </p>
            <p className="text-xs text-text-muted">
              Grace days remaining: {graceDayModal.graceDaysRemaining}
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setGraceDayModal(null)}>Cancel</Button>
              <Button onClick={() => handleGraceDay(graceDayModal.challengeId, graceDayModal.date)}>
                Use Grace Day
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
