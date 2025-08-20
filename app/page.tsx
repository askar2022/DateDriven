'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { BarChart3, TrendingUp, Users, FileText } from 'lucide-react'

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect to landing page if not authenticated, or dashboard if authenticated
    if (session) {
      router.push('/beautiful-dashboard')
    } else {
      router.push('/landing')
    }
  }, [session, router])

  // Temporary: Mock session for testing
  const mockSession = {
    user: {
      name: 'Demo User',
      email: 'demo@school.edu',
      role: 'LEADER'
    }
  }

  const currentSession = session || mockSession

  if (!currentSession) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <BarChart3 className="h-24 w-24 text-blue-600 mx-auto mb-8" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Student Performance Analytics
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Centralize and visualize weekly student performance in Math and Reading. 
          Track progress, identify trends, and make data-driven decisions to improve student outcomes.
        </p>
        
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-12 mb-16">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">78.4%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">24</div>
            <div className="text-sm text-gray-600">Weekly Assessments</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">+12.3%</div>
            <div className="text-sm text-gray-600">Growth Rate</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Track Progress</h3>
            <p className="text-gray-600 leading-relaxed">
              Monitor week-over-week growth and identify students who need additional support with color-coded performance tiers.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Class Insights</h3>
            <p className="text-gray-600 leading-relaxed">
              Compare performance across classes and grade levels with intuitive dashboards and detailed analytics.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Detailed Reports</h3>
            <p className="text-gray-600 leading-relaxed">
              Generate comprehensive weekly reports with distribution analysis, trends, and actionable insights.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Link 
            href="/dashboard-web" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            View Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const userRole = (currentSession.user as any)?.role || 'LEADER'

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {currentSession.user?.name}
        </h1>
        <p className="text-gray-600">
          Here's what you can do with your {userRole.toLowerCase()} access:
        </p>
      </div>
      
      <div className="dashboard-grid">
        <Link href="/dashboard" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="text-sm text-gray-500">View</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Performance Dashboard</h3>
          <p className="text-gray-600 text-sm">
            View student performance analytics and trends
          </p>
        </Link>
        
        {['TEACHER', 'STAFF'].includes(userRole) && (
          <Link href="/upload" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-green-600" />
              <span className="text-sm text-gray-500">Upload</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Weekly Scores</h3>
            <p className="text-gray-600 text-sm">
              Upload Excel files with Math and Reading scores
            </p>
          </Link>
        )}
        
        {['STAFF', 'LEADER'].includes(userRole) && (
          <Link href="/students" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-purple-600" />
              <span className="text-sm text-gray-500">Manage</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Student Roster</h3>
            <p className="text-gray-600 text-sm">
              Manage student information and resolve upload conflicts
            </p>
          </Link>
        )}
        
        {userRole === 'LEADER' && (
          <Link href="/reports" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-orange-600" />
              <span className="text-sm text-gray-500">Generate</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Weekly Reports</h3>
            <p className="text-gray-600 text-sm">
              Generate PDF reports with performance summaries
            </p>
          </Link>
        )}
      </div>
      
      <div className="mt-12 card">
        <h2 className="text-xl font-semibold mb-4">Performance Tier System</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-tier-green rounded-full"></div>
            <div>
              <div className="font-medium text-green-800">Green</div>
              <div className="text-sm text-gray-600">≥ 85 points</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-tier-orange rounded-full"></div>
            <div>
              <div className="font-medium text-orange-800">Orange</div>
              <div className="text-sm text-gray-600">75-84.99 points</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-tier-red rounded-full"></div>
            <div>
              <div className="font-medium text-red-800">Red</div>
              <div className="text-sm text-gray-600">65-74.99 points</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-tier-gray rounded-full"></div>
            <div>
              <div className="font-medium text-gray-800">Gray</div>
              <div className="text-sm text-gray-600">&lt; 65 points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="text-center py-8 mt-12 border-t border-gray-200">
        <p className="text-gray-500 text-sm">
          © 2025 Analytics by Dr. Askar. All rights reserved.
        </p>
      </div>
    </div>
  )
}
