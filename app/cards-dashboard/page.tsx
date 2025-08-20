'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/radix/Button'
import { Progress } from '@/components/ui/radix/Progress'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/radix/Card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/radix/Select'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/radix/Dialog'
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Award, 
  Calendar,
  BookOpen,
  GraduationCap,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  Download,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CardsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  // Sample data
  const stats = [
    {
      title: 'Total Students',
      value: '156',
      description: 'Active across all grades',
      icon: Users,
      color: 'blue',
      trend: null
    },
    {
      title: 'Average Score',
      value: '78.4%',
      description: 'Overall performance',
      icon: Target,
      color: 'green',
      trend: '+2.1%'
    },
    {
      title: 'Weekly Assessments',
      value: '24',
      description: 'Completed this week',
      icon: Calendar,
      color: 'purple',
      trend: '+12%'
    },
    {
      title: 'Growth Rate',
      value: '+12.3%',
      description: 'vs Last Week',
      icon: TrendingUp,
      color: 'orange',
      trend: 'up'
    }
  ]

  const subjects = [
    { name: 'Mathematics', score: 78, total: 156, proficient: 121, color: 'blue' },
    { name: 'Reading', score: 85, total: 156, proficient: 133, color: 'green' }
  ]

  const classrooms = [
    { name: 'Grade 3-A', teacher: 'Ms. Johnson', students: 24, mathAvg: 82, readingAvg: 85, trend: '+3.2%' },
    { name: 'Grade 3-B', teacher: 'Mr. Smith', students: 23, mathAvg: 79, readingAvg: 82, trend: '+1.8%' },
    { name: 'Grade 4-A', teacher: 'Mrs. Davis', students: 26, mathAvg: 78, readingAvg: 83, trend: '-0.5%' },
    { name: 'Grade 4-B', teacher: 'Mr. Wilson', students: 25, mathAvg: 75, readingAvg: 79, trend: '+2.1%' },
    { name: 'Grade 5-A', teacher: 'Ms. Brown', students: 27, mathAvg: 84, readingAvg: 87, trend: '+4.7%' },
    { name: 'Grade 5-B', teacher: 'Mrs. Taylor', students: 26, mathAvg: 82, readingAvg: 85, trend: '+2.9%' }
  ]

  const recentActivity = [
    { type: 'upload', message: 'Ms. Johnson uploaded Math scores for G3-A', time: '2 hours ago', icon: Upload },
    { type: 'achievement', message: 'G5-A achieved 90% Green tier in Reading', time: '4 hours ago', icon: Award },
    { type: 'alert', message: 'G4-B needs attention - 15% Gray tier in Math', time: '6 hours ago', icon: AlertTriangle },
    { type: 'report', message: 'Weekly report generated for administration', time: '1 day ago', icon: FileText }
  ]

  const topStudents = [
    { id: 'S001', grade: 'Grade 5', math: 98, reading: 96, improvement: '+5' },
    { id: 'S042', grade: 'Grade 4', math: 95, reading: 94, improvement: '+3' },
    { id: 'S089', grade: 'Grade 3', math: 94, reading: 97, improvement: '+7' },
    { id: 'S156', grade: 'Grade 5', math: 93, reading: 95, improvement: '+2' }
  ]

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
      red: 'text-red-600 bg-red-100'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Cards Dashboard</h1>
              <p className="text-lg text-gray-600">
                Beautiful card-based student performance analytics
              </p>
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="primary">
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={cn('p-2 rounded-lg', getIconColor(stat.color))}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {stat.trend && (
                      <span className={cn(
                        'text-xs font-medium px-2 py-1 rounded-full',
                        stat.trend.startsWith('+') ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                      )}>
                        {stat.trend}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <CardDescription className="text-xs">{stat.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Subject Performance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {subjects.map((subject, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', getIconColor(subject.color))}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>{subject.name}</CardTitle>
                    <CardDescription>{subject.proficient} of {subject.total} students proficient</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Performance</span>
                    <span className="text-lg font-bold">{subject.score}%</span>
                  </div>
                  <Progress value={subject.score} color={subject.color as any} className="h-2" />
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-green-600">{Math.round(subject.proficient * 0.6)}</div>
                      <div className="text-gray-500 text-xs">Green</div>
                    </div>
                    <div>
                      <div className="font-semibold text-orange-600">{Math.round(subject.proficient * 0.3)}</div>
                      <div className="text-gray-500 text-xs">Orange</div>
                    </div>
                    <div>
                      <div className="font-semibold text-red-600">{Math.round(subject.proficient * 0.1)}</div>
                      <div className="text-gray-500 text-xs">Red</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Classroom and Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Classroom Performance */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  <CardTitle>Classroom Performance</CardTitle>
                </div>
                <CardDescription>Performance overview by classroom</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classrooms.map((classroom, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {classroom.name.split('-')[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{classroom.name}</div>
                          <div className="text-sm text-gray-600">{classroom.teacher} • {classroom.students} students</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Math: {classroom.mathAvg}% | Reading: {classroom.readingAvg}%</div>
                        </div>
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          classroom.trend.startsWith('+') ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                        )}>
                          {classroom.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View All Classrooms
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
              <CardDescription>Latest updates and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div key={index} className="flex gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs',
                        activity.type === 'upload' && 'bg-blue-100 text-blue-600',
                        activity.type === 'achievement' && 'bg-green-100 text-green-600',
                        activity.type === 'alert' && 'bg-red-100 text-red-600',
                        activity.type === 'report' && 'bg-purple-100 text-purple-600'
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Top Students Card */}
        <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <CardTitle>Top Performers</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <CardDescription>Students with highest performance this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topStudents.map((student, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                      {student.improvement}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-gray-900">{student.id}</div>
                    <div className="text-sm text-gray-600">{student.grade}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">M: {student.math}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">R: {student.reading}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
