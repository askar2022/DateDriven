'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface ReportData {
  weekStart: string
  summary: {
    totalStudents: number
    totalAssessments: number
    schoolAverage: number
  }
  tierDistribution: {
    subject: string
    green: number
    orange: number
    red: number
    gray: number
    total: number
  }[]
  gradeBreakdown: {
    grade: string
    mathAverage: number
    readingAverage: number
    studentCount: number
  }[]
  trends: {
    week: string
    average: number
  }[]
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState('')

  // Temporary: Skip authentication for testing
  const mockSession = {
    user: {
      name: 'Demo User',
      email: 'demo@school.edu',
      role: 'LEADER' // Allow reports access for testing
    }
  }

  // Use mock session for testing
  const currentSession = session || mockSession
  const userRole = (currentSession?.user as any)?.role

  // Check permissions
  if (!currentSession || userRole !== 'LEADER') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">Only leaders can access reports.</p>
      </div>
    )
  }

  useEffect(() => {
    // Set default to current week
    const today = new Date()
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1))
    setSelectedWeek(monday.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (selectedWeek) {
      fetchReportData()
    }
  }, [selectedWeek])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports?week=${selectedWeek}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePdfReport = async () => {
    setGeneratingPdf(true)
    try {
      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ week: selectedWeek }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `weekly-report-${selectedWeek}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Reports</h1>
        <p className="text-gray-600">
          Generate comprehensive performance reports for leadership review.
        </p>
      </div>

      {/* Report Controls */}
      <div className="card mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <label className="font-medium text-gray-700">Week Starting:</label>
            </div>
            <input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <button
            onClick={generatePdfReport}
            disabled={!reportData || generatingPdf}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{generatingPdf ? 'Generating...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading report data...</p>
        </div>
      ) : reportData ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="dashboard-grid">
            <div className="card">
              <div className="text-2xl font-bold text-gray-900">{reportData.summary.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-gray-900">{reportData.summary.totalAssessments}</div>
              <div className="text-sm text-gray-600">Assessments Completed</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-gray-900">
                {reportData.summary.schoolAverage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">School Average</div>
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Performance Distribution by Subject</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Green (≥85)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orange (75-84)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Red (65-74)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gray (&lt;65)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.tierDistribution.map((item) => (
                    <tr key={item.subject}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {item.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="tier-badge tier-green">
                          {item.green} ({item.total > 0 ? ((item.green / item.total) * 100).toFixed(1) : 0}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="tier-badge tier-orange">
                          {item.orange} ({item.total > 0 ? ((item.orange / item.total) * 100).toFixed(1) : 0}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="tier-badge tier-red">
                          {item.red} ({item.total > 0 ? ((item.red / item.total) * 100).toFixed(1) : 0}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="tier-badge tier-gray">
                          {item.gray} ({item.total > 0 ? ((item.gray / item.total) * 100).toFixed(1) : 0}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {item.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grade Level Performance */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Grade Level Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Math Average</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reading Average</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall Average</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.gradeBreakdown.map((grade) => {
                    const overall = (grade.mathAverage + grade.readingAverage) / 2
                    return (
                      <tr key={grade.grade}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {grade.grade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {grade.studentCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`tier-badge ${
                            grade.mathAverage >= 85 ? 'tier-green' :
                            grade.mathAverage >= 75 ? 'tier-orange' :
                            grade.mathAverage >= 65 ? 'tier-red' : 'tier-gray'
                          }`}>
                            {grade.mathAverage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`tier-badge ${
                            grade.readingAverage >= 85 ? 'tier-green' :
                            grade.readingAverage >= 75 ? 'tier-orange' :
                            grade.readingAverage >= 65 ? 'tier-red' : 'tier-gray'
                          }`}>
                            {grade.readingAverage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`tier-badge ${
                            overall >= 85 ? 'tier-green' :
                            overall >= 75 ? 'tier-orange' :
                            overall >= 65 ? 'tier-red' : 'tier-gray'
                          }`}>
                            {overall.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trends */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">8-Week Trend</h3>
            <div className="space-y-2">
              {reportData.trends.map((trend, index) => (
                <div key={trend.week} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="text-sm text-gray-600">
                    Week of {new Date(trend.week).toLocaleDateString()}
                  </span>
                  <span className="font-medium">
                    {trend.average.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">
            No assessment data found for the selected week.
          </p>
        </div>
      )}

      {/* Copyright Footer */}
      <div className="text-center py-8 mt-12 border-t border-gray-200">
        <p className="text-gray-500 text-sm">
          © 2025 Analytics by Dr. Askar. All rights reserved.
        </p>
      </div>
    </div>
  )
}
