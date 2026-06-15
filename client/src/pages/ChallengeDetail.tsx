import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Flame, Calendar, Clock, PlusCircle, Trash2 } from 'lucide-react'
import Card, { StatCard } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { StatusBadge, DifficultyBadge, CategoryBadge } from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import api from '../lib/api'
import { formatDate, getHeatmapColor, CATEGORY_LABELS } from '../lib/constants'
import type { Challenge, HeatmapEntry, TaskType, Difficulty, Category } from '../types'

const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'Easy (1 pt)' },
  { value: 'MEDIUM', label: 'Medium (2 pts)' },
  { value: 'HARD', label: 'Hard (3 pts)' },
]
const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))
const TASK_TYPE_OPTIONS = [
  { value: 'MANDATORY', label: 'Mandatory' },
  { value: 'OPTIONAL', label: 'Optional' },
]

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [addTaskModal, setAddTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: '', taskType: 'MANDATORY' as TaskType, difficulty: 'EASY' as Difficulty, category: 'PERSONAL' as Category,
  })

  useEffect(() => {
    if (id) loadChallenge()
  }, [id])

  async function loadChallenge() {
    try {
      setLoading(true)
      const [challengeData, heatmapData] = await Promise.all([
        api.getChallenge(id!),
        api.getHeatmapData(id!).catch(() => []),
      ])
      setChallenge(challengeData)
      setHeatmap(heatmapData)
    } catch (err) {
      console.error('Failed to load challenge:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddTask() {
    if (!taskForm.title.trim() || !id) return
    try {
      await api.createTask(id, taskForm)
      setAddTaskModal(false)
      setTaskForm({ title: '', taskType: 'MANDATORY', difficulty: 'EASY', category: 'PERSONAL' })
      loadChallenge()
    } catch (err) {
      console.error('Failed to add task:', err)
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      await api.deleteTask(taskId)
      loadChallenge()
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!challenge) {
    return <p className="text-text-muted">Challenge not found.</p>
  }

  const progress = challenge.progress

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{challenge.name}</h1>
              <StatusBadge status={challenge.status} />
            </div>
            {challenge.description && (
              <p className="text-text-muted text-sm mt-1">{challenge.description}</p>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<PlusCircle size={16} />}
            onClick={() => setAddTaskModal(true)}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Progress"
          value={`${progress?.completionRate ?? 0}%`}
        />
        <StatCard
          label="Current Streak"
          value={challenge.currentStreak}
          sublabel="days"
          icon={<Flame size={18} />}
        />
        <StatCard
          label="Longest Streak"
          value={challenge.longestStreak}
          sublabel="days"
        />
        <StatCard
          label="Days Remaining"
          value={progress?.daysRemaining ?? 0}
          icon={<Clock size={18} />}
        />
        <StatCard
          label="Grace Days"
          value={`${challenge.graceDaysTotal - challenge.graceDaysUsed}/${challenge.graceDaysTotal}`}
          sublabel="remaining"
        />
      </div>

      {/* Progress Bar */}
      {progress && (
        <Card hover={false}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-text-muted">
                <Calendar size={14} />
                {formatDate(challenge.startDate)} — {formatDate(challenge.endDate)}
              </span>
            </div>
            <span className="text-sm text-text-muted">
              Day {progress.daysPassed} of {progress.totalDays}
            </span>
          </div>
          <ProgressBar value={progress.daysPassed} max={progress.totalDays} size="md" />
        </Card>
      )}

      {/* Heatmap */}
      {heatmap.length > 0 && (
        <Card hover={false}>
          <h3 className="text-sm font-semibold mb-4">Activity Heatmap</h3>
          <div className="flex flex-wrap gap-1">
            {heatmap.map((entry) => (
              <div
                key={entry.date}
                className="w-4 h-4 rounded-[3px] transition-colors cursor-pointer"
                style={{ backgroundColor: getHeatmapColor(entry.completionRate) }}
                title={`${entry.date}: ${Math.round(entry.completionRate)}%`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px] text-text-muted">
            <span>Less</span>
            {['#1a1a1a', '#ef4444', '#f97316', '#eab308', '#22c55e'].map((c) => (
              <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            <span>More</span>
          </div>
        </Card>
      )}

      {/* Task Blueprints */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Task Blueprints</h3>
        <div className="space-y-2">
          {challenge.taskBlueprints?.map((task) => (
            <div key={task.id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{task.title}</span>
                <DifficultyBadge difficulty={task.difficulty} />
                <CategoryBadge category={task.category} />
                <Badge variant={task.taskType === 'MANDATORY' ? 'accent' : 'default'}>
                  {task.taskType === 'MANDATORY' ? 'Mandatory' : 'Optional'}
                </Badge>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={addTaskModal} onClose={() => setAddTaskModal(false)} title="Add Task">
        <div className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g., Study Trees"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={taskForm.taskType} onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value as TaskType })} options={TASK_TYPE_OPTIONS} />
            <Select label="Difficulty" value={taskForm.difficulty} onChange={(e) => setTaskForm({ ...taskForm, difficulty: e.target.value as Difficulty })} options={DIFFICULTY_OPTIONS} />
          </div>
          <Select
            label="Category"
            value={taskForm.category}
            onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value as Category })}
            options={CATEGORY_OPTIONS}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setAddTaskModal(false)}>Cancel</Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
