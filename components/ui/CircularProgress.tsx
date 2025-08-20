'use client'

import React from 'react'

interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showPercentage?: boolean
  centerContent?: React.ReactNode
}

export function CircularProgress({
  percentage,
  size = 200,
  strokeWidth = 12,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showPercentage = true,
  centerContent
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerContent || (
          showPercentage && (
            <span className="text-3xl font-bold text-gray-900">
              {Math.round(percentage)}%
            </span>
          )
        )}
      </div>
    </div>
  )
}

interface MetricCardProps {
  value: string | number
  label: string
  color?: string
  trend?: string
  trendUp?: boolean
}

export function MetricCard({ value, label, color = 'text-gray-900', trend, trendUp }: MetricCardProps) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color} mb-1`}>
        {value}
      </div>
      <div className="text-sm text-gray-500 mb-1">
        {label}
      </div>
      {trend && (
        <div className={`text-xs font-medium ${
          trendUp ? 'text-green-600' : 'text-red-600'
        }`}>
          {trendUp ? '↗' : '↘'} {trend}
        </div>
      )}
    </div>
  )
}

interface SimpleStatsProps {
  stats: Array<{
    value: string | number
    label: string
    color?: string
  }>
}

export function SimpleStats({ stats }: SimpleStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-6 py-6">
      {stats.map((stat, index) => (
        <MetricCard
          key={index}
          value={stat.value}
          label={stat.label}
          color={stat.color}
        />
      ))}
    </div>
  )
}
