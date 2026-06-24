import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Flame, TrendingUp, CheckCircle, Target } from 'lucide-react'
import Card, { StatCard } from '../components/ui/Card'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import Modal from '../components/ui/Modal'
import { SkeletonCard, SkeletonStatCard } from '../components/ui/Skeleton'
import TaskItem from '../components/task/TaskItem'
import { useDailyTasks } from '../hooks/useDailyTasks'
import { useApi } from '../hooks/useApi'
import api from '../lib/api'
import { useEffect } from 'react'

export default function Dashboard() {
  const { dailyData, loading: dailyLoading, toggleTask, applyGraceDay } = useDailyTasks()
  const { data: stats, loading: statsLoading, execute: fetchStats } = useApi(api.getOverviewStats.bind(api))

  const [graceDayModal, setGraceDayModal] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const loading = dailyLoading || statsLoading

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !stats ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : stats ? (
          <>
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
          </>
        ) : null}
      </div>

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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Tasks by Challenge */}
      {loading && (!dailyData.tasks || !dailyData.tasks.length) ? (
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : dailyData.tasks?.length > 0 ? (
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
                  <TaskItem
                    key={task.id}
                    id={task.id}
                    title={task.taskBlueprint.title}
                    completed={task.completed}
                    difficulty={task.taskBlueprint.difficulty}
                    taskType={task.taskBlueprint.taskType}
                    onToggle={toggleTask}
                  />
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
              <Button onClick={() => {
                applyGraceDay(graceDayModal.challengeId, graceDayModal.date)
                setGraceDayModal(null)
              }}>
                Use Grace Day
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
