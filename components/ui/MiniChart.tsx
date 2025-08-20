'use client'

import React from 'react'

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  showDots?: boolean
}

export function Sparkline({ data, color = '#3B82F6', height = 40, showDots = false }: SparklineProps) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full" style={{ height }}>
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          points={points}
          className="opacity-80"
        />
        {showDots && data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = height - ((value - min) / range) * height
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.5"
              fill={color}
              className="opacity-60"
            />
          )
        })}
      </svg>
    </div>
  )
}

interface TrendIndicatorProps {
  value: number
  change: number
  label: string
  color?: string
}

export function TrendIndicator({ value, change, label, color = '#3B82F6' }: TrendIndicatorProps) {
  const isPositive = change > 0
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
      <div className={`text-xs font-medium ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? '+' : ''}{change}%
      </div>
    </div>
  )
}
