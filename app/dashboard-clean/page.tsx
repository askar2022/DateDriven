'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { 
  Calendar,
  TrendingUp,
  Users,
  Settings
} from 'lucide-react'
import { CircularProgress, MetricCard, SimpleStats } from '@/components/ui/CircularProgress'
import { CleanCard, SectionHeader, InsightCard, Button } from '@/components/ui/CleanCard'
import { Sparkline } from '@/components/ui/MiniChart'
import { mockData } from '@/lib/mock-data'

export default function CleanDashboardPage() {
  const { data: session } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState('This Week')

  // Mock session for testing
  const mockSession = { user: { name: 'Demo User', role: 'LEADER' } }
  const currentSession = session || mockSession

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h1>
          <p className="text-gray-600">Sign in to view the dashboard.</p>
        </div>
      </div>
    )
  }

  // Calculate overall performance percentage
  const overallPerformance = Math.round((mockData.summary.averageScore / 100) * 100)
  
  // Stats for the three-column layout
  const mainStats = [
    {
      value: mockData.summary.totalStudents - Math.round(mockData.summary.averageScore * 0.8),
      label: 'Remaining',
      color: 'text-gray-700'
    },
    {
      value: Math.round(mockData.summary.averageScore * 0.8),
      label: 'Proficient',
      color: 'text-gray-900'
    },
    {
      value: 100,
      label: 'Target',
      color: 'text-gray-500'
    }
  ]

  // Subject breakdown
  const subjects = [
    {
      name: 'Math',
      score: 78,
      color: '#FF6B6B',
      students: `${Math.round(mockData.summary.totalStudents * 0.48)}/${mockData.summary.totalStudents}`,
    },
    {
      name: 'Reading', 
      score: 85,
      color: '#4ECDC4',
      students: `${Math.round(mockData.summary.totalStudents * 0.55)}/${mockData.summary.totalStudents}`,
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-8 space-y-8">
        
        {/* Performance Focus Section */}
        <CleanCard>
          <SectionHeader 
            title="Student Performance Focus"
            subtitle={selectedPeriod}
          />
          
          {/* Large Circular Progress */}
          <div className="flex justify-center mb-6">
            <CircularProgress
              percentage={overallPerformance}
              size={180}
              strokeWidth={8}
              color="#3B82F6"
              backgroundColor="#E5E7EB"
              centerContent={
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {Math.round(mockData.summary.averageScore * 0.8)}
                  </div>
                  <div className="text-sm text-gray-500">Proficient</div>
                </div>
              }
            />
          </div>

          {/* Three Column Stats */}
          <SimpleStats stats={mainStats} />

          {/* Subject Breakdown */}
          <div className="space-y-3">
            {subjects.map((subject, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="font-medium text-gray-900">{subject.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{subject.students}</div>
                  <div className="text-xs text-gray-500">{subject.score}% avg</div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button variant="primary" className="flex-1">
              Proficient
            </Button>
            <Button variant="secondary" className="flex-1">
              Needs Support
            </Button>
          </div>
        </CleanCard>

        {/* Insights & Analytics */}
        <div>
          <SectionHeader title="Insights & Analytics" />
          
          <div className="grid grid-cols-2 gap-4">
            <InsightCard
              title="Weekly Growth"
              value={`+${mockData.summary.improvementRate}%`}
              change="↗ 2.1%"
              changeType="positive"
              chart={<Sparkline data={[72, 75, 73, 78, 76, 79, 82]} color="#10B981" />}
            />
            <InsightCard
              title="Class Average"
              value={`${mockData.summary.averageScore.toFixed(1)}%`}
              change="↗ 1.8%"
              changeType="positive"
              chart={<Sparkline data={[74, 76, 78, 77, 79, 78, 80]} color="#3B82F6" />}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <CleanCard>
          <SectionHeader title="Quick Actions" />
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-xl transition-colors">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Upload Weekly Scores</div>
                <div className="text-sm text-gray-500">Add new assessment data</div>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-xl transition-colors">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">View Detailed Analytics</div>
                <div className="text-sm text-gray-500">Explore performance trends</div>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-xl transition-colors">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">Generate Reports</div>
                <div className="text-sm text-gray-500">Create weekly summaries</div>
              </div>
            </button>
          </div>
        </CleanCard>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  )
}
