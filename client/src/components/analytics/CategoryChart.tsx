import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { CategoryBreakdown } from '../../types'

interface CategoryChartProps {
  data: CategoryBreakdown[]
}

export default function CategoryChart({ data }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-text-muted py-8 text-center">No data yet</p>
  }

  // Map category strings to proper case for labels
  const formattedData = data.map((d) => ({
    ...d,
    subject: d.category.charAt(0) + d.category.slice(1).toLowerCase(),
    A: d.completionRate,
    fullMark: 100,
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={formattedData}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bg-elevated)',
              borderColor: 'var(--color-border)',
              borderRadius: '8px',
            }}
            itemStyle={{ color: 'var(--color-text-primary)' }}
          />
          <Radar
            name="Completion %"
            dataKey="A"
            stroke="var(--color-accent)"
            fill="var(--color-accent)"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
