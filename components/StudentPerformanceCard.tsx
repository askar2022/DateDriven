'use client'

import React from 'react'
import { Button } from '@/components/ui/radix/Button'
import { Progress } from '@/components/ui/radix/Progress'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/radix/Dialog'
import { TrendingUp, TrendingDown, BarChart3, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudentData {
  id: string
  name: string
  grade: string
  mathScore: number
  readingScore: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
}

interface StudentPerformanceCardProps {
  student: StudentData
}

export function StudentPerformanceCard({ student }: StudentPerformanceCardProps) {
  const getTierColor = (score: number) => {
    if (score >= 85) return 'green'
    if (score >= 75) return 'orange'
    if (score >= 65) return 'red'
    return 'purple'
  }

  const getTierLabel = (score: number) => {
    if (score >= 85) return 'Green'
    if (score >= 75) return 'Orange'
    if (score >= 65) return 'Red'
    return 'Gray'
  }

  const mathColor = getTierColor(student.mathScore)
  const readingColor = getTierColor(student.readingScore)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{student.name}</h3>
          <p className="text-sm text-gray-600">{student.grade}</p>
        </div>
        <div className="flex items-center gap-2">
          {student.trend === 'up' && (
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              +{student.trendValue}%
            </div>
          )}
          {student.trend === 'down' && (
            <div className="flex items-center text-red-600 text-sm">
              <TrendingDown className="h-4 w-4 mr-1" />
              -{student.trendValue}%
            </div>
          )}
        </div>
      </div>

      {/* Performance Bars */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Mathematics</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                mathColor === 'green' && 'bg-green-100 text-green-800',
                mathColor === 'orange' && 'bg-orange-100 text-orange-800',
                mathColor === 'red' && 'bg-red-100 text-red-800',
                mathColor === 'purple' && 'bg-purple-100 text-purple-800'
              )}>
                {getTierLabel(student.mathScore)}
              </span>
              <span className="text-sm font-semibold">{student.mathScore}%</span>
            </div>
          </div>
          <Progress value={student.mathScore} color={mathColor as any} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Reading</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                readingColor === 'green' && 'bg-green-100 text-green-800',
                readingColor === 'orange' && 'bg-orange-100 text-orange-800',
                readingColor === 'red' && 'bg-red-100 text-red-800',
                readingColor === 'purple' && 'bg-purple-100 text-purple-800'
              )}>
                {getTierLabel(student.readingScore)}
              </span>
              <span className="text-sm font-semibold">{student.readingScore}%</span>
            </div>
          </div>
          <Progress value={student.readingScore} color={readingColor as any} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{student.name} - Performance Details</DialogTitle>
              <DialogDescription>
                Detailed performance analytics for {student.grade} student
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{student.mathScore}%</div>
                  <div className="text-sm text-gray-600">Mathematics</div>
                  <div className="text-xs text-gray-500 mt-1">{getTierLabel(student.mathScore)} Tier</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{student.readingScore}%</div>
                  <div className="text-sm text-gray-600">Reading</div>
                  <div className="text-xs text-gray-500 mt-1">{getTierLabel(student.readingScore)} Tier</div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Weekly Trend</h4>
                <div className="flex items-center gap-2">
                  {student.trend === 'up' ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  <span className={cn(
                    'font-medium',
                    student.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {student.trend === 'up' ? '+' : '-'}{student.trendValue}% from last week
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="primary" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </div>
    </div>
  )
}
