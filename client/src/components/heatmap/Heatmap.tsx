import React from 'react'
import type { HeatmapEntry } from '../../types'
import { getHeatmapColor } from '../../lib/constants'

interface HeatmapProps {
  data: HeatmapEntry[]
}

export default function Heatmap({ data }: HeatmapProps) {
  if (!data || data.length === 0) return null

  // Ensure data covers complete weeks if possible, or just render blocks directly
  // The provided code used a simple grid, let's enhance it with tooltips and labels

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-max flex flex-wrap gap-1">
        {data.map((entry) => (
          <div
            key={entry.date}
            className="group relative w-4 h-4 rounded-[3px] transition-colors cursor-pointer"
            style={{ backgroundColor: getHeatmapColor(entry.completionRate) }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-bg-elevated text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-border shadow-lg">
              {entry.date}: {Math.round(entry.completionRate)}%
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 text-[10px] text-text-muted">
        <span>Less</span>
        {['#1a1a1a', '#ef4444', '#f97316', '#eab308', '#22c55e'].map((c) => (
          <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
