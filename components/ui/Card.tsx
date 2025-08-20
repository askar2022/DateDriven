import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6', 
    lg: 'p-8'
  }

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100
        ${hover ? 'hover:shadow-md hover:border-gray-200 transition-all duration-200' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: string
  trendUp?: boolean
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendUp, 
  color = 'blue' 
}: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50', 
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    red: 'text-red-600 bg-red-50'
  }

  return (
    <Card hover padding="md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {icon && (
              <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                {icon}
              </div>
            )}
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trendUp ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
          }`}>
            <span>{trendUp ? '↗' : '↘'}</span>
            {trend}
          </div>
        )}
      </div>
    </Card>
  )
}

interface ProgressCardProps {
  title: string
  value: number
  max: number
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  showPercentage?: boolean
}

export function ProgressCard({ 
  title, 
  value, 
  max, 
  color = 'blue', 
  showPercentage = true 
}: ProgressCardProps) {
  const percentage = Math.round((value / max) * 100)
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500', 
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  }

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900">{title}</h3>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-600">{percentage}%</span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      </div>
    </Card>
  )
}
