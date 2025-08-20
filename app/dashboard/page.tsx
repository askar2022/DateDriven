'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  Award,
  AlertTriangle,
  BookOpen,
  GraduationCap
} from 'lucide-react'
import { PerformanceChart } from '@/components/PerformanceChart'
import { TierDistributionChart } from '@/components/TierDistributionChart'
import { TrendChart } from '@/components/TrendChart'
import { Card, StatCard, ProgressCard } from '@/components/ui/Card'
import { Badge, TierBadge } from '@/components/ui/Badge'
import { ActivityFeed, StudentList } from '@/components/ui/ActivityFeed'
import { mockData } from '@/lib/mock-data'

interface DashboardData {
  summary: {
    totalStudents: number
    weeklyAssessments: number
    averageScore: number
    improvementRate: number
  }
  tierDistribution: {
    subject: string
    green: number
    orange: number
    red: number
    gray: number
  }[]
  weeklyTrends: {
    week: string
    math: number
    reading: number
  }[]
  classroomPerformance: {
    classroom: string
    grade: string
    mathAverage: number
    readingAverage: number
    studentCount: number
  }[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  // Use mock data for demo
  const [data, setData] = useState<DashboardData | null>(mockData as any)
  const [loading, setLoading] = useState(false) // Set to false since we're using mock data
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  // Mock session for testing
  const mockSession = { user: { name: 'Demo User', role: 'LEADER' } }
  const currentSession = session || mockSession

  useEffect(() => {
    // Simulate data fetching with mock data
    setData(mockData as any)
  }, [selectedGrade, selectedSubject])

  if (!currentSession) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <BarChart3 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h1>
        <p className="text-gray-600">Sign in to view the performance dashboard.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="dashboard-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const userRole = (currentSession.user as any)?.role || 'TEACHER'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-sm text-gray-500 mb-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Analyze student performance trends and identify areas for improvement.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Filters */}
      <div className="card mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Grades</option>
            <option value="3">Grade 3</option>
            <option value="4">Grade 4</option>
            <option value="5">Grade 5</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Subjects</option>
            <option value="MATH">Math</option>
            <option value="READING">Reading</option>
          </select>
        </div>
      </div>

                {/* Enhanced Summary Cards */}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Students"
              value={data.summary.totalStudents}
              subtitle="Active across all grades"
              icon={<Users className="h-5 w-5" />}
              color="blue"
            />
            <StatCard
              title="Weekly Assessments"
              value={data.summary.weeklyAssessments}
              subtitle="Completed this week"
              icon={<Calendar className="h-5 w-5" />}
              color="green"
              trend="12%"
              trendUp={true}
            />
            <StatCard
              title="Average Score"
              value={`${data.summary.averageScore.toFixed(1)}%`}
              subtitle="Across all subjects"
              icon={<BarChart3 className="h-5 w-5" />}
              color="purple"
            />
            <StatCard
              title="Growth Rate"
              value={`${data.summary.improvementRate > 0 ? '+' : ''}${data.summary.improvementRate.toFixed(1)}%`}
              subtitle="vs Last Week"
              icon={<TrendingUp className="h-5 w-5" />}
              color="orange"
              trend={`${data.summary.improvementRate.toFixed(1)}%`}
              trendUp={data.summary.improvementRate > 0}
            />
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Performance by Tier</h3>
              <TierDistributionChart data={data.tierDistribution} />
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Weekly Trends</h3>
              <TrendChart data={data.weeklyTrends} />
            </Card>
          </div>

          {/* Activity and Insights Section */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1">
              <ActivityFeed activities={mockData.recentActivities} />
            </div>
            <div className="lg:col-span-1">
              <StudentList 
                title="🏆 Top Performers" 
                students={mockData.topPerformers}
                type="performers"
              />
            </div>
            <div className="lg:col-span-1">
              <StudentList 
                title="🎯 Needs Support" 
                students={mockData.needsSupport}
                type="support"
              />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <ProgressCard
              title="Math Proficiency"
              value={78}
              max={100}
              color="blue"
            />
            <ProgressCard
              title="Reading Proficiency" 
              value={83}
              max={100}
              color="green"
            />
            <ProgressCard
              title="Overall Progress"
              value={81}
              max={100}
              color="purple"
            />
          </div>

          {/* Enhanced Classroom Performance Table */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Classroom Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classroom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Math Average
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reading Average
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockData.classroomPerformance.map((classroom) => {
                    return (
                      <tr key={classroom.classroom} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                              {classroom.classroom.split('-')[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {classroom.classroom}
                              </div>
                              <div className="text-sm text-gray-500">{classroom.grade}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{classroom.teacher}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="blue" size="sm">
                            {classroom.studentCount} students
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <TierBadge score={classroom.mathAverage} showScore />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <TierBadge score={classroom.readingAverage} showScore />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={classroom.trend.startsWith('+') ? 'green' : 'red'} 
                            size="sm"
                          >
                            {classroom.trend}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Copyright Footer */}
      <div className="text-center py-8 mt-12 border-t border-gray-200">
        <p className="text-gray-500 text-sm">
          © 2025 Analytics by Dr. Askar. All rights reserved.
        </p>
      </div>
      </div>
    </div>
  )
}
