'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Award,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Filter
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, TierBadge } from '@/components/ui/Badge'
import { mockData } from '@/lib/mock-data'

export default function WebDashboard() {
  const { data: session } = useSession()
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  // Mock session for testing
  const mockSession = { user: { name: 'Demo User', role: 'LEADER' } }
  const currentSession = session || mockSession

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h1>
          <p className="text-gray-600">Sign in to view the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
              <p className="text-lg text-gray-600">
                Monitor student performance across all classes and subjects
              </p>
              <div className="text-sm text-gray-500 mt-2">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-4">
              <select 
                value={selectedGrade} 
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Grades</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
              </select>
              
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Subjects</option>
                <option value="MATH">Math</option>
                <option value="READING">Reading</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{mockData.summary.totalStudents}</div>
            <div className="text-sm text-gray-600 mb-2">Total Students</div>
            <div className="text-xs text-gray-500">Active across all grades</div>
          </Card>

          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{mockData.summary.weeklyAssessments}</div>
            <div className="text-sm text-gray-600 mb-2">Weekly Assessments</div>
            <Badge variant="green" size="sm">+12% this week</Badge>
          </Card>

          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{mockData.summary.averageScore.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 mb-2">Average Score</div>
            <div className="text-xs text-gray-500">Across all subjects</div>
          </Card>

          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">+{mockData.summary.improvementRate}%</div>
            <div className="text-sm text-gray-600 mb-2">Growth Rate</div>
            <Badge variant="green" size="sm">↗ Improving</Badge>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Subject Performance */}
          <Card className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subject Performance
            </h3>
            
            <div className="space-y-6">
              {/* Math */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-900">Mathematics</span>
                  <TierBadge score={78} showScore />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: '78%' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>75 of 156 students proficient</span>
                  <span>78% average</span>
                </div>
              </div>

              {/* Reading */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-900">Reading</span>
                  <TierBadge score={85} showScore />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: '85%' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>86 of 156 students proficient</span>
                  <span>85% average</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Insights */}
          <Card className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Quick Insights
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Award className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-900">Top Performing Class</div>
                  <div className="text-sm text-green-700">G5-A with 87.3% reading average</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-medium text-orange-900">Needs Attention</div>
                  <div className="text-sm text-orange-700">G4-B has 15% students in Gray tier</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">Growth Trend</div>
                  <div className="text-sm text-blue-700">Overall improvement of +12.3% this week</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Classroom Performance Summary */}
        <Card className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Classroom Performance Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockData.classroomPerformance.map((classroom) => (
              <div key={classroom.classroom} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{classroom.classroom}</h4>
                    <p className="text-sm text-gray-600">{classroom.grade}</p>
                    <p className="text-xs text-gray-500">{classroom.teacher}</p>
                  </div>
                  <Badge 
                    variant={classroom.trend.startsWith('+') ? 'green' : 'red'} 
                    size="sm"
                  >
                    {classroom.trend}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Math</span>
                    <TierBadge score={classroom.mathAverage} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reading</span>
                    <TierBadge score={classroom.readingAverage} />
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Students</span>
                      <span className="text-sm text-gray-600">{classroom.studentCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <BarChart3 className="h-5 w-5" />
            View Detailed Analytics
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Calendar className="h-5 w-5" />
            Upload New Scores
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Users className="h-5 w-5" />
            Generate Reports
          </button>
        </div>

        {/* Copyright Footer */}
        <div className="text-center py-8 mt-12 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © 2025 Data Driven by Dr. Askar. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
