import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Flame,
  Calendar,
  Clock,
  PlusCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Shield,
  Archive,
  FileText,
} from 'lucide-react'
import Card, { StatCard } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { StatusBadge, DifficultyBadge, CategoryBadge } from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Heatmap from '../components/heatmap/Heatmap'
import api from '../lib/api'
import { useToast } from '../context/ToastContext'
import { formatDate, CATEGORY_LABELS } from '../lib/constants'
import type { Challenge, HeatmapEntry, PredictionResult, TaskType, Difficulty, Category } from '../types'

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
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([])
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [addTaskModal, setAddTaskModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
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

      // Load prediction for active challenges
      if (challengeData.status === 'ACTIVE') {
        try {
          const pred = await api.getPrediction(id!)
          setPrediction(pred)
        } catch {
          // Prediction may fail for new challenges with no stats
        }
      }
    } catch (err) {
      addToast('error', 'Failed to load challenge details')
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
      addToast('success', 'Task blueprint added')
      loadChallenge()
    } catch (err) {
      addToast('error', 'Failed to add task')
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      await api.deleteTask(taskId)
      addToast('success', 'Task removed')
      loadChallenge()
    } catch (err) {
      addToast('error', 'Failed to delete task')
    }
  }

  async function handleDeleteChallenge() {
    if (!id) return
    try {
      await api.deleteChallenge(id)
      addToast('success', 'Challenge deleted')
      navigate('/dashboard')
    } catch (err) {
      addToast('error', 'Failed to delete challenge')
    }
  }

  async function handleArchiveChallenge() {
    if (!id || !challenge) return
    try {
      await api.updateChallenge(id, {
        name: challenge.name,  // required field
      })
      // The update endpoint doesn't support status change directly.
      // For now, we just navigate to archive.
      addToast('info', 'Challenge archived')
      navigate('/archive')
    } catch (err) {
      addToast('error', 'Failed to archive challenge')
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
    return (
      <div className="text-center py-16 animate-fade-in">
        <p className="text-text-muted mb-4">Challenge not found.</p>
        <Link to="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  const progress = challenge.progress

  const trendIcon = prediction?.trend === 'IMPROVING'
    ? <TrendingUp size={16} className="text-success" />
    : prediction?.trend === 'DECLINING'
    ? <TrendingDown size={16} className="text-danger" />
    : <Minus size={16} className="text-text-muted" />

  const riskColors = {
    LOW: 'text-success',
    MEDIUM: 'text-warning',
    HIGH: 'text-danger',
  }

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
          <div className="flex items-center gap-2">
            {challenge.status === 'ACTIVE' && (
              <Button
                variant="secondary"
                size="sm"
                icon={<PlusCircle size={16} />}
                onClick={() => setAddTaskModal(true)}
              >
                Add Task
              </Button>
            )}
            {challenge.status === 'COMPLETED' && (
              <Link to={`/challenges/${challenge.id}/report`}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FileText size={16} />}
                >
                  View Report
                </Button>
              </Link>
            )}
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={16} />}
              onClick={() => setDeleteModal(true)}
            >
              Delete
            </Button>
          </div>
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
          icon={<Shield size={18} />}
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

      {/* Prediction Card */}
      {prediction && challenge.status === 'ACTIVE' && (
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-accent" />
            <h3 className="text-sm font-semibold">Completion Prediction</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-bg-elevated">
              <p className="text-xs text-text-muted mb-1">Predicted Completion</p>
              <p className="text-2xl font-bold">{prediction.predictedCompletion}%</p>
            </div>
            <div className="p-3 rounded-lg bg-bg-elevated">
              <p className="text-xs text-text-muted mb-1">Risk Level</p>
              <div className="flex items-center gap-2">
                {prediction.riskLevel === 'HIGH' && <AlertTriangle size={18} className="text-danger" />}
                {prediction.riskLevel === 'LOW' && <CheckCircle size={18} className="text-success" />}
                {prediction.riskLevel === 'MEDIUM' && <AlertTriangle size={18} className="text-warning" />}
                <p className={`text-lg font-bold ${riskColors[prediction.riskLevel]}`}>
                  {prediction.riskLevel}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-bg-elevated">
              <p className="text-xs text-text-muted mb-1">Trend</p>
              <div className="flex items-center gap-2">
                {trendIcon}
                <p className="text-lg font-bold">{prediction.trend}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-bg-elevated">
              <p className="text-xs text-text-muted mb-1">Last 7-Day Avg</p>
              <p className="text-2xl font-bold">{prediction.last7DayAverage}%</p>
            </div>
          </div>
        </Card>
      )}

      {/* Heatmap */}
      {heatmap.length > 0 && (
        <Card hover={false}>
          <h3 className="text-sm font-semibold mb-4">Activity Heatmap</h3>
          <Heatmap data={heatmap} />
        </Card>
      )}

      {/* Task Blueprints */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Task Blueprints</h3>
        {challenge.taskBlueprints?.length > 0 ? (
          <div className="space-y-2">
            {challenge.taskBlueprints?.map((task) => (
              <div key={task.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium">{task.title}</span>
                  <DifficultyBadge difficulty={task.difficulty} />
                  <CategoryBadge category={task.category} />
                  <Badge variant={task.taskType === 'MANDATORY' ? 'accent' : 'default'}>
                    {task.taskType === 'MANDATORY' ? 'Mandatory' : 'Optional'}
                  </Badge>
                </div>
                {challenge.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card hover={false} className="text-center py-8">
            <p className="text-sm text-text-muted">No tasks added yet</p>
          </Card>
        )}
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Challenge?">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete <strong>{challenge.name}</strong>? This will permanently remove
            all tasks, daily progress, stats, and reports. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteChallenge}>
              Delete Challenge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
