import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { DifficultyBreakdown } from '../../types'

interface DifficultyChartProps {
  data: DifficultyBreakdown[]
}

const COLORS = {
  EASY: '#22c55e',
  MEDIUM: '#eab308',
  HARD: '#ef4444',
}

export default function DifficultyChart({ data }: DifficultyChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-text-muted py-8 text-center">No data yet</p>
  }

  const formattedData = data.map((d) => ({
    name: d.difficulty.charAt(0) + d.difficulty.slice(1).toLowerCase(),
    value: d.completed,
    difficulty: d.difficulty,
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.difficulty as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bg-elevated)',
              borderColor: 'var(--color-border)',
              borderRadius: '8px',
            }}
            itemStyle={{ color: 'var(--color-text-primary)' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
