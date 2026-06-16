import React from 'react'
import Badge, { DifficultyBadge } from '../ui/Badge'
import type { Difficulty, TaskType } from '../../types'

interface TaskItemProps {
  id?: string
  title: string
  completed: boolean
  difficulty: Difficulty
  taskType: TaskType
  onToggle?: (id: string, completed: boolean) => void
  disabled?: boolean
}

export default function TaskItem({
  id,
  title,
  completed,
  difficulty,
  taskType,
  onToggle,
  disabled = false,
}: TaskItemProps) {
  return (
    <div
      className={`flex items-center gap-4 px-5 py-3 transition-colors ${
        completed ? 'opacity-60 bg-bg-elevated/30' : 'hover:bg-bg-elevated/50'
      }`}
    >
      {onToggle && id && (
        <input
          type="checkbox"
          className="task-checkbox"
          checked={completed}
          onChange={() => onToggle(id, completed)}
          disabled={disabled}
        />
      )}
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <DifficultyBadge difficulty={difficulty} />
        {taskType === 'OPTIONAL' && (
          <Badge variant="default">Optional</Badge>
        )}
      </div>
    </div>
  )
}
