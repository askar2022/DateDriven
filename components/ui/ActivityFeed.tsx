import React from 'react'
import { Card } from './Card'
import { Badge } from './Badge'

interface Activity {
  id: number
  type: string
  message: string
  timestamp: string
  icon: string
  color: string
}

interface ActivityFeedProps {
  activities: Activity[]
  title?: string
}

export function ActivityFeed({ activities, title = "Recent Activity" }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return '📁'
      case 'achievement': return '🏆'
      case 'alert': return '⚠️'
      case 'report': return '📊'
      default: return '📋'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload': return 'blue'
      case 'achievement': return 'green'
      case 'alert': return 'red'
      case 'report': return 'purple'
      default: return 'gray'
    }
  }

  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  <Badge 
                    variant={getActivityColor(activity.type) as any} 
                    size="sm"
                  >
                    {activity.type}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2">
          View all activity
        </button>
      </div>
    </Card>
  )
}

interface StudentListProps {
  title: string
  students: Array<{
    id: string
    grade: string
    mathScore: number
    readingScore: number
    improvement?: string
    decline?: string
  }>
  type: 'performers' | 'support'
}

export function StudentList({ title, students, type }: StudentListProps) {
  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="space-y-2">
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {student.id.slice(-2)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{student.id}</p>
                  <p className="text-sm text-gray-500">{student.grade}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex gap-2">
                    <Badge variant="blue" size="sm">M: {student.mathScore}</Badge>
                    <Badge variant="green" size="sm">R: {student.readingScore}</Badge>
                  </div>
                  {(student.improvement || student.decline) && (
                    <div className="mt-1">
                      <Badge 
                        variant={type === 'performers' ? 'green' : 'red'} 
                        size="sm"
                      >
                        {student.improvement || student.decline}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
