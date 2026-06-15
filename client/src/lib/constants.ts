import { Difficulty, Category, TaskType } from '../types'

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
}

export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  EASY: '#22c55e',
  MEDIUM: '#eab308',
  HARD: '#ef4444',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  LEARNING: 'Learning',
  FITNESS: 'Fitness',
  HEALTH: 'Health',
  CAREER: 'Career',
  PERSONAL: 'Personal',
  FINANCE: 'Finance',
  CUSTOM: 'Custom',
}

export const CATEGORY_EMOJIS: Record<Category, string> = {
  LEARNING: '📚',
  FITNESS: '🏋️',
  HEALTH: '🏥',
  CAREER: '💼',
  PERSONAL: '🧘',
  FINANCE: '💰',
  CUSTOM: '⚡',
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  MANDATORY: 'Mandatory',
  OPTIONAL: 'Optional',
}

export const DURATION_OPTIONS = [
  { value: '15', label: '15 Days', description: 'Quick sprint' },
  { value: '30', label: '30 Days', description: 'One month challenge' },
  { value: '60', label: '60 Days', description: 'Build strong habits' },
  { value: '90', label: '90 Days', description: 'Life-changing commitment' },
]

export function getHeatmapColor(rate: number): string {
  if (rate === 0) return 'var(--color-heatmap-0)'
  if (rate <= 25) return 'var(--color-heatmap-1)'
  if (rate <= 50) return 'var(--color-heatmap-2)'
  if (rate <= 75) return 'var(--color-heatmap-3)'
  return 'var(--color-heatmap-5)'
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
