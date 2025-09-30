'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Calendar,
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Eye,
  Clock,
  CheckCircle
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

export default function BeautifulReportsPage() {
  const { data: session } = useSession()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState('')
  const [assessmentOptions, setAssessmentOptions] = useState<any[]>([])
  const [assessmentFilter, setAssessmentFilter] = useState('all')

  // Temporary: Skip authentication for testing
  const mockSession = {
    user: {
      name: 'Demo User',
      email: 'demo@school.edu',
      role: 'LEADER'
    }
  }

  const currentSession = session || mockSession
  const userRole = (currentSession?.user as any)?.role

  // Check permissions
  if (!currentSession || userRole !== 'LEADER') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '3rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          maxWidth: '28rem'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: '#FEF2F2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <AlertCircle style={{ width: '2rem', height: '2rem', color: '#EF4444' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            Access Denied
          </h1>
          <p style={{ color: '#6B7280' }}>
            Only leaders can access reports.
          </p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    // Set default to current week
    const today = new Date()
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1))
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
      // Fetch actual uploaded data
      const response = await fetch('/api/upload/weekly-scores')
      const data = await response.json()
      let uploads = data.uploads || []
      
      // Filter by assessment if not 'all'
      if (assessmentFilter !== 'all') {
        uploads = uploads.filter((upload: any) => {
          const uploadAssessmentName = upload.assessmentName || `Assessment ${upload.weekNumber}`
          return uploadAssessmentName === assessmentFilter
        })
      }
      
      if (uploads.length === 0) {
        // No data available
        setReportData({
          weekStart: selectedWeek,
          summary: {
            totalStudents: 0,
            totalAssessments: 0,
            schoolAverage: 0
          },
          tierDistribution: [],
          gradeBreakdown: [],
          trends: []
        })
        return
      }
      
      // Calculate real data from uploads
      // For "All Assessments", count all students from all uploads
      // For specific assessment, count students from that assessment only
      let totalStudents = 0
      let totalAssessments = uploads.length
      
      if (assessmentFilter === 'all') {
        // Count unique students across all uploads
        const studentMap = new Map()
        uploads.forEach(upload => {
          if (upload.students) {
            upload.students.forEach(student => {
              studentMap.set(student.studentId, student)
            })
          }
        })
        totalStudents = studentMap.size
        console.log('All Assessments - Unique students:', totalStudents)
        console.log('All Assessments - Student IDs:', Array.from(studentMap.keys()))
      } else {
        // Count students from filtered uploads only
        totalStudents = uploads.reduce((sum, upload) => sum + (upload.totalStudents || 0), 0)
        console.log('Specific Assessment - Total students:', totalStudents)
      }
      
      // Calculate weighted school average
      const schoolAverage = (() => {
        if (uploads.length === 0) return 0
        
        const totalScore = uploads.reduce((sum, upload) => 
          sum + (upload.averageScore * upload.totalStudents), 0)
        const totalStudentsForAvg = uploads.reduce((sum, upload) => 
          sum + upload.totalStudents, 0)
        
        return totalStudentsForAvg > 0 ? (totalScore / totalStudentsForAvg).toFixed(1) : 0
      })()
      
      // Process tier distribution from actual data
      const tierDistribution: any[] = []
      const allMathScores: number[] = []
      const allReadingScores: number[] = []
      
      // Process all uploads (or filtered uploads)
      uploads.forEach(upload => {
        if (upload.subject === 'Both Math & Reading' && upload.students) {
          // Extract individual student scores
          upload.students.forEach(student => {
            if (student.subject === 'Math') {
              allMathScores.push(student.score)
            } else if (student.subject === 'Reading') {
              allReadingScores.push(student.score)
            }
          })
        } else if (upload.subject === 'Math') {
          // Add the average score for each student in this upload
          const studentsInUpload = upload.totalStudents || 1
          for (let i = 0; i < studentsInUpload; i++) {
            allMathScores.push(upload.averageScore)
          }
        } else if (upload.subject === 'Reading') {
          // Add the average score for each student in this upload
          const studentsInUpload = upload.totalStudents || 1
          for (let i = 0; i < studentsInUpload; i++) {
            allReadingScores.push(upload.averageScore)
          }
        }
      })
      
      // Calculate Math tier distribution
      if (allMathScores.length > 0) {
        const green = allMathScores.filter(score => score >= 85).length
        const orange = allMathScores.filter(score => score >= 75 && score < 85).length
        const red = allMathScores.filter(score => score >= 65 && score < 75).length
        const gray = allMathScores.filter(score => score < 65).length
        
        tierDistribution.push({
          subject: 'Mathematics',
          green,
          orange,
          red,
          gray,
          total: totalStudents
        })
      }
      
      // Calculate Reading tier distribution
      if (allReadingScores.length > 0) {
        const green = allReadingScores.filter(score => score >= 85).length
        const orange = allReadingScores.filter(score => score >= 75 && score < 85).length
        const red = allReadingScores.filter(score => score >= 65 && score < 75).length
        const gray = allReadingScores.filter(score => score < 65).length
        
        tierDistribution.push({
          subject: 'Reading',
          green,
          orange,
          red,
          gray,
          total: totalStudents
        })
      }
      
      // Calculate grade breakdown
      const gradeBreakdown: any[] = []
      const gradeGroups: any = {}
      
      // Process all uploads (or filtered uploads)
      uploads.forEach(upload => {
        if (!gradeGroups[upload.grade]) {
          gradeGroups[upload.grade] = {
            grade: upload.grade,
            mathScores: [],
            readingScores: [],
            studentCount: 0
          }
        }
        
        // Add student count from this teacher
        gradeGroups[upload.grade].studentCount += upload.totalStudents || 0
        
        if (upload.subject === 'Both Math & Reading' && upload.students) {
          const mathStudents = upload.students.filter(student => student.subject === 'Math')
          const readingStudents = upload.students.filter(student => student.subject === 'Reading')
          
          gradeGroups[upload.grade].mathScores.push(...mathStudents.map(s => s.score))
          gradeGroups[upload.grade].readingScores.push(...readingStudents.map(s => s.score))
        } else if (upload.subject === 'Math') {
          // Add the average score for each student in this upload
          const studentsInUpload = upload.totalStudents || 1
          for (let i = 0; i < studentsInUpload; i++) {
            gradeGroups[upload.grade].mathScores.push(upload.averageScore)
          }
        } else if (upload.subject === 'Reading') {
          // Add the average score for each student in this upload
          const studentsInUpload = upload.totalStudents || 1
          for (let i = 0; i < studentsInUpload; i++) {
            gradeGroups[upload.grade].readingScores.push(upload.averageScore)
          }
        }
      })
      
      Object.values(gradeGroups).forEach((grade: any) => {
        const mathAverage = grade.mathScores.length > 0 
          ? (grade.mathScores.reduce((sum, score) => sum + score, 0) / grade.mathScores.length).toFixed(1)
          : 0
        const readingAverage = grade.readingScores.length > 0 
          ? (grade.readingScores.reduce((sum, score) => sum + score, 0) / grade.readingScores.length).toFixed(1)
          : 0
        
        gradeBreakdown.push({
          grade: grade.grade,
          mathAverage: typeof mathAverage === 'string' ? parseFloat(mathAverage) : mathAverage,
          readingAverage: typeof readingAverage === 'string' ? parseFloat(readingAverage) : readingAverage,
          studentCount: grade.studentCount
        })
      })
      
      const realData = {
        weekStart: selectedWeek,
        summary: {
          totalStudents: totalStudents,
          totalAssessments: totalAssessments,
          schoolAverage: typeof schoolAverage === 'string' ? parseFloat(schoolAverage) : schoolAverage
        },
        tierDistribution,
        gradeBreakdown,
        trends: [] // No historical data available yet
      }
      
      setReportData(realData)
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePdfReport = async () => {
    setGeneratingPdf(true)
    try {
      const week = selectedWeek || new Date().toISOString().split('T')[0]
      
      // Call the PDF API with assessment filter
      const assessmentParam = assessmentFilter !== 'all' ? `&assessment=${encodeURIComponent(assessmentFilter)}` : ''
      const response = await fetch(`/api/reports/pdf?week=${week}${assessmentParam}`)
      
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }
      
      // Get the HTML content from the response
      const htmlContent = await response.text()
      
      // Create a blob with HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' })
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `weekly-report-${week}.html`
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log('HTML report downloaded successfully! You can print this to PDF from your browser.')
    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '0.75rem',
          backgroundColor: color + '20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon style={{ width: '1.5rem', height: '1.5rem', color }} />
        </div>
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280', margin: 0 }}>
            {title}
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            {value}
          </p>
        </div>
      </div>
      {subtitle && (
        <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      


      {/* Main Content */}
      <div style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: '1.5rem 1.5rem'
      }}>
        
        {/* Report Controls */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #f3f4f6',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#6B7280' }} />
                <label style={{ fontWeight: '500', color: '#374151' }}>Filter by Assessment:</label>
              </div>
              <select
                value={assessmentFilter}
                onChange={(e) => setAssessmentFilter(e.target.value)}
                style={{
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  backgroundColor: 'white',
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

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => window.print()}
                disabled={!reportData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: reportData ? 'pointer' : 'not-allowed',
                  opacity: reportData ? 1 : 0.5
                }}
              >
                <Eye style={{ width: '1rem', height: '1rem' }} />
                Preview
              </button>
              
              <button
                onClick={generatePdfReport}
                disabled={!reportData || generatingPdf}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: (!reportData || generatingPdf) ? 'not-allowed' : 'pointer',
                  opacity: (!reportData || generatingPdf) ? 0.5 : 1
                }}
              >
                {generatingPdf ? (
                  <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Download style={{ width: '1rem', height: '1rem' }} />
                )}
                {generatingPdf ? 'Generating...' : 'Download Report'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <Loader2 style={{ 
              width: '2rem', 
              height: '2rem', 
              color: '#3B82F6', 
              margin: '0 auto 1rem auto',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#6B7280', fontSize: '1.125rem' }}>Loading report data...</p>
          </div>
        ) : reportData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Summary Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1.5rem' 
            }}>
              <StatCard
                icon={Users}
                title="Total Students"
                value={reportData.summary.totalStudents.toString()}
                subtitle="Enrolled students assessed this week"
                color="#3B82F6"
              />
              <StatCard
                icon={BarChart3}
                title="Assessments Completed"
                value={reportData.summary.totalAssessments.toString()}
                subtitle="Math and Reading assessments"
                color="#8B5CF6"
              />
              <StatCard
                icon={Target}
                title="School Average"
                value={`${reportData.summary.schoolAverage.toFixed(1)}%`}
                subtitle="Overall performance across all subjects"
                color="#10B981"
              />
            </div>

            {/* Performance Distribution */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #f3f4f6'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#111827', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: '#8B5CF6' }} />
                Performance Distribution by Subject
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Subject</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Green (≥85)</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Orange (75-84)</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Red (65-74)</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Gray (&lt;65)</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.tierDistribution.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '1rem', fontWeight: '500', color: '#111827' }}>
                          {item.subject}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            backgroundColor: '#DCFCE7',
                            color: '#166534',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {item.green} ({item.total > 0 ? ((item.green / item.total) * 100).toFixed(1) : 0}%)
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            backgroundColor: '#FED7AA',
                            color: '#9A3412',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {item.orange} ({item.total > 0 ? ((item.orange / item.total) * 100).toFixed(1) : 0}%)
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            backgroundColor: '#FECACA',
                            color: '#991B1B',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {item.red} ({item.total > 0 ? ((item.red / item.total) * 100).toFixed(1) : 0}%)
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            backgroundColor: '#F3F4F6',
                            color: '#374151',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {item.gray} ({item.total > 0 ? ((item.gray / item.total) * 100).toFixed(1) : 0}%)
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '500', color: '#111827' }}>
                          {item.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grade Level Performance */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #f3f4f6'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#111827', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Users style={{ width: '1.25rem', height: '1.25rem', color: '#3B82F6' }} />
                Grade Level Performance
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Grade</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Students</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Math Average</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Reading Average</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Overall Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.gradeBreakdown.map((grade, index) => {
                      const overall = (grade.mathAverage + grade.readingAverage) / 2
                      const getTierStyle = (score: number) => {
                        if (score >= 85) return { backgroundColor: '#DCFCE7', color: '#166534' }
                        if (score >= 75) return { backgroundColor: '#FED7AA', color: '#9A3412' }
                        if (score >= 65) return { backgroundColor: '#FECACA', color: '#991B1B' }
                        return { backgroundColor: '#F3F4F6', color: '#374151' }
                      }
                      
                      return (
                        <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '1rem', fontWeight: '500', color: '#111827' }}>
                            {grade.grade}
                          </td>
                          <td style={{ padding: '1rem', color: '#111827' }}>
                            {grade.studentCount}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              ...getTierStyle(grade.mathAverage),
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}>
                              {grade.mathAverage.toFixed(1)}%
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              ...getTierStyle(grade.readingAverage),
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}>
                              {grade.readingAverage.toFixed(1)}%
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              ...getTierStyle(overall),
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}>
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

            {/* 8-Week Trend */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #f3f4f6'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#111827', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />
                8-Week Performance Trend
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '1rem' 
              }}>
                {reportData.trends.map((trend, index) => (
                  <div key={index} style={{
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '0.5rem',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#6B7280', 
                      marginBottom: '0.5rem' 
                    }}>
                      {new Date(trend.week).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 'bold', 
                      color: '#111827' 
                    }}>
                      {trend.average.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              backgroundColor: '#F3F4F6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <FileText style={{ width: '2rem', height: '2rem', color: '#9CA3AF' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
              No Data Available
            </h3>
            <p style={{ color: '#6B7280' }}>
              No assessment data found for the selected week.
            </p>
          </div>
        )}

        {/* Copyright Footer */}
        <div style={{
          textAlign: 'center',
          padding: '2rem 0',
          marginTop: '3rem',
          borderTop: '1px solid #E5E7EB'
        }}>
          <p style={{
            color: '#6B7280',
            fontSize: '0.875rem',
            margin: 0
          }}>
            © 2025 Data Driven by Dr. Askar. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
