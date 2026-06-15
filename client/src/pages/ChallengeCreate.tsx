import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  Trash2,
  Clock,
  Target,
  CheckCircle,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Input, { Textarea } from '../components/ui/Input'
import Select from '../components/ui/Select'
import Card from '../components/ui/Card'
import Badge, { DifficultyBadge } from '../components/ui/Badge'
import api from '../lib/api'
import { DURATION_OPTIONS, CATEGORY_LABELS } from '../lib/constants'
import type { CreateChallengeForm, CreateTaskForm, TaskType, Difficulty, Category } from '../types'

const STEPS = ['Challenge Details', 'Add Tasks', 'Review']

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

export default function ChallengeCreate() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<CreateChallengeForm>({
    name: '',
    description: '',
    duration: '30',
    startDate: new Date().toISOString().split('T')[0],
    tasks: [],
  })

  // Task form
  const [taskForm, setTaskForm] = useState<CreateTaskForm>({
    title: '',
    description: '',
    taskType: 'MANDATORY' as TaskType,
    difficulty: 'EASY' as Difficulty,
    category: 'PERSONAL' as Category,
  })

  function addTask() {
    if (!taskForm.title.trim()) return
    setForm((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { ...taskForm }],
    }))
    setTaskForm({ title: '', description: '', taskType: 'MANDATORY', difficulty: 'EASY', category: 'PERSONAL' })
  }

  function removeTask(index: number) {
    setForm((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit() {
    try {
      setSubmitting(true)
      const challenge = await api.createChallenge(form)
      navigate(`/challenges/${challenge.id}`)
    } catch (err) {
      console.error('Failed to create challenge:', err)
    } finally {
      setSubmitting(false)
    }
  }

  function canProceed() {
    if (step === 0) return form.name.trim().length > 0
    if (step === 1) return form.tasks.length > 0
    return true
  }

  const mandatoryCount = form.tasks.filter((t) => t.taskType === 'MANDATORY').length
  const optionalCount = form.tasks.filter((t) => t.taskType === 'OPTIONAL').length

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="text-2xl font-bold">Create New Challenge</h1>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= step
                  ? 'bg-accent text-text-inverse'
                  : 'bg-bg-elevated text-text-muted'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${i <= step ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-[2px] mx-1 ${i < step ? 'bg-accent' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Challenge Details */}
      {step === 0 && (
        <Card hover={false} className="space-y-6">
          <Input
            label="Challenge Name"
            placeholder="e.g., 30-Day DSA Challenge"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            label="Description (optional)"
            placeholder="What do you want to achieve?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">Duration</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, duration: opt.value as any })}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    form.duration === opt.value
                      ? 'border-accent bg-accent-dim'
                      : 'border-border hover:border-border-hover bg-bg-input'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={14} className={form.duration === opt.value ? 'text-accent' : 'text-text-muted'} />
                    <span className="text-sm font-semibold">{opt.label}</span>
                  </div>
                  <p className="text-xs text-text-muted">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </Card>
      )}

      {/* Step 1: Add Tasks */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Task form */}
          <Card hover={false} className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <PlusCircle size={16} className="text-accent" />
              Add Task
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Task Title"
                placeholder="e.g., Study DSA"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
              <Select
                label="Type"
                value={taskForm.taskType}
                onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value as TaskType })}
                options={TASK_TYPE_OPTIONS}
              />
              <Select
                label="Difficulty"
                value={taskForm.difficulty}
                onChange={(e) => setTaskForm({ ...taskForm, difficulty: e.target.value as Difficulty })}
                options={DIFFICULTY_OPTIONS}
              />
              <Select
                label="Category"
                value={taskForm.category}
                onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value as Category })}
                options={CATEGORY_OPTIONS}
              />
            </div>
            <Button onClick={addTask} variant="secondary" size="sm" icon={<PlusCircle size={16} />}>
              Add Task
            </Button>
          </Card>

          {/* Task list */}
          {form.tasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">
                  Tasks ({form.tasks.length}) — {mandatoryCount} mandatory, {optionalCount} optional
                </h3>
              </div>
              <div className="space-y-2">
                {form.tasks.map((task, i) => (
                  <div
                    key={i}
                    className="glass-card p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{task.title}</span>
                      <DifficultyBadge difficulty={task.difficulty} />
                      <Badge variant={task.taskType === 'MANDATORY' ? 'accent' : 'default'}>
                        {task.taskType === 'MANDATORY' ? 'Mandatory' : 'Optional'}
                      </Badge>
                    </div>
                    <button
                      onClick={() => removeTask(i)}
                      className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <Card hover={false} className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center">
              <Target size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{form.name}</h3>
              {form.description && (
                <p className="text-sm text-text-muted">{form.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-bg-elevated">
              <p className="text-xs text-text-muted">Duration</p>
              <p className="text-lg font-bold">{form.duration} days</p>
            </div>
            <div className="p-3 rounded-lg bg-bg-elevated">
              <p className="text-xs text-text-muted">Start Date</p>
              <p className="text-lg font-bold">{form.startDate}</p>
            </div>
            <div className="p-3 rounded-lg bg-bg-elevated">
              <p className="text-xs text-text-muted">Total Tasks</p>
              <p className="text-lg font-bold">{form.tasks.length}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Tasks</h4>
            <div className="space-y-2">
              {form.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <CheckCircle size={16} className={task.taskType === 'MANDATORY' ? 'text-accent' : 'text-text-muted'} />
                  <span className="text-sm flex-1">{task.title}</span>
                  <DifficultyBadge difficulty={task.difficulty} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
          icon={<ArrowLeft size={16} />}
        >
          Back
        </Button>

        {step < 2 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            icon={<ArrowRight size={16} />}
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={submitting}
            icon={<CheckCircle size={16} />}
          >
            Create Challenge
          </Button>
        )}
      </div>
    </div>
  )
}
