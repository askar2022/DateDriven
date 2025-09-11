'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Calendar,
  AlertCircle,
  Loader2,
  BarChart3,
  Users,
  Target,
  TrendingUp,
  GraduationCap,
  Eye
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

  // Check permissions BEFORE any hooks
  if (!currentSession || userRole !== 'LEADER') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">Only leaders can access reports.</p>
      </div>
    )
  }

  // All hooks must be called after the early return check
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState('')
  const [assessmentOptions, setAssessmentOptions] = useState<any[]>([])
  const [assessmentFilter, setAssessmentFilter] = useState('all')

  useEffect(() => {
    // Set default to current week (Monday)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Sunday = 0, Monday = 1
    const monday = new Date(today)
    monday.setDate(today.getDate() + daysToMonday)
    setSelectedWeek(monday.toISOString().split('T')[0])
    
    // Fetch assessment options
    fetchAssessmentOptions()
  }, [])

  useEffect(() => {
    if (selectedWeek) {
      fetchReportData()
    }
  }, [selectedWeek, assessmentFilter])

  const fetchAssessmentOptions = async () => {
    try {
      const response = await fetch('/api/upload/weekly-scores')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched uploads for assessment options:', data.uploads)
        
        // Create unique assessment options from uploads
        const assessmentMap = new Map()
        data.uploads.forEach((upload: any) => {
          const key = upload.assessmentName || `Assessment ${upload.weekNumber}`
          if (!assessmentMap.has(key)) {
            assessmentMap.set(key, {
              value: key,
              label: `${key} - ${new Date(upload.assessmentDate || upload.uploadTime).toLocaleDateString()}`,
              displayDate: new Date(upload.assessmentDate || upload.uploadTime).toLocaleDateString()
            })
          }
        })
        
        const assessments = Array.from(assessmentMap.values())
        console.log('Assessment options:', assessments)
        setAssessmentOptions(assessments)
      }
    } catch (error) {
      console.error('Error fetching assessment options:', error)
    }
  }

  const fetchReportData = async () => {
    setLoading(true)
    try {
      console.log('Fetching report data for week:', selectedWeek, 'assessment:', assessmentFilter)
      let url = `/api/reports?week=${selectedWeek}`
      if (assessmentFilter !== 'all') {
        url += `&assessmentName=${encodeURIComponent(assessmentFilter)}`
      }
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        console.log('Report data received:', data)
        console.log('WeekStart in data:', data.weekStart)
        setReportData(data)
      } else {
        console.error('Failed to fetch report data:', response.status, response.statusText)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-600">Grades K-8 Analytics</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Leader</p>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151' 
              }}>
                Filter by Assessment:
              </label>
              <select
                value={assessmentFilter}
                onChange={(e) => setAssessmentFilter(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  minWidth: '200px'
                }}
              >
                <option value="all">All Assessments</option>
                {assessmentOptions.map((assessment) => (
                  <option key={assessment.value} value={assessment.value}>
                    {assessment.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={generatePdfReport}
                disabled={!reportData || generatingPdf}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingPdf ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{generatingPdf ? 'Generating...' : 'Download Report'}</span>
              </button>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{reportData.summary.totalStudents}</div>
                    <div className="text-sm text-gray-600">Enrolled students assessed this week</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{reportData.summary.totalAssessments}</div>
                    <div className="text-sm text-gray-600">Math and Reading assessments</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {reportData.summary.schoolAverage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Overall performance across all subjects</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Distribution by Subject */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Performance Distribution by Subject</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Green (≥85)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orange (75-84)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Red (65-74)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gray (&lt;65)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.tierDistribution.map((item) => (
                      <tr key={item.subject}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {item.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.green} ({item.total > 0 ? ((item.green / item.total) * 100).toFixed(1) : 0}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {item.orange} ({item.total > 0 ? ((item.orange / item.total) * 100).toFixed(1) : 0}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {item.red} ({item.total > 0 ? ((item.red / item.total) * 100).toFixed(1) : 0}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {item.gray} ({item.total > 0 ? ((item.gray / item.total) * 100).toFixed(1) : 0}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                          {item.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grade Level Performance */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Grade Level Performance</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Math Average</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reading Average</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Average</th>
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
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              grade.mathAverage >= 85 ? 'bg-green-100 text-green-800' :
                              grade.mathAverage >= 75 ? 'bg-orange-100 text-orange-800' :
                              grade.mathAverage >= 65 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {grade.mathAverage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              grade.readingAverage >= 85 ? 'bg-green-100 text-green-800' :
                              grade.readingAverage >= 75 ? 'bg-orange-100 text-orange-800' :
                              grade.readingAverage >= 65 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {grade.readingAverage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              overall >= 85 ? 'bg-green-100 text-green-800' :
                              overall >= 75 ? 'bg-orange-100 text-orange-800' :
                              overall >= 65 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
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

          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              No assessment data found for the selected assessment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
