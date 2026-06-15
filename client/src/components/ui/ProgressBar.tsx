import React from 'react'

interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  color?: string
  className?: string
}

export default function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showLabel = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const getColor = () => {
    if (percentage >= 76) return 'bg-success'
    if (percentage >= 51) return 'bg-accent'
    if (percentage >= 26) return 'bg-warning'
    return 'bg-danger'
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-text-muted">Progress</span>
          <span className="text-xs font-semibold text-text-primary">{percentage}%</span>
        </div>
      )}
      <div className={`w-full ${sizeStyles[size]} bg-bg-elevated rounded-full overflow-hidden`}>
        <div
          className={`${sizeStyles[size]} ${getColor()} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
