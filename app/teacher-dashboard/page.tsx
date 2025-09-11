'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen,
  Target,
  BarChart3
} from 'lucide-react'

interface StudentPerformance {
  studentId: string
  studentName: string
  subject: string
  score: number
  grade: string
  className: string
  weekNumber: number
  uploadDate: string
}

interface TeacherDashboardData {
  studentsNeedingHelp: StudentPerformance[]
  highPerformingStudents: StudentPerformance[]
  summary: {
    totalStudents: number
    averageScore: number
    studentsNeedingHelp: number
    highPerformers: number
  }
}

export default function TeacherDashboardPage() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [assessmentOptions, setAssessmentOptions] = useState<any[]>([])
  const [assessmentFilter, setAssessmentFilter] = useState('all')

  // Mock session for testing
  const mockSession = { 
    user: { 
      name: 'Mr. Adams', 
      email: 'mr.adams@school.edu',
      role: 'TEACHER' 
    } 
  }
  const currentSession = session || mockSession
  const teacherName = currentSession?.user?.name || 'Mr. Adams'

  useEffect(() => {
    fetchTeacherDashboardData()
  }, [teacherName])

  // Add periodic refresh to keep data up to date
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTeacherDashboardData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [teacherName])

  // Refetch data when assessment filter changes
  useEffect(() => {
    if (assessmentOptions.length > 0) {
      console.log('Assessment filter changed to:', assessmentFilter)
      fetchTeacherDashboardData()
    }
  }, [assessmentFilter, teacherName])

  const fetchTeacherDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch teacher's uploads
      const params = new URLSearchParams()
      params.append('role', 'TEACHER')
      params.append('user', teacherName)
      
      // Add assessment filter if not 'all'
      if (assessmentFilter !== 'all') {
        params.append('assessment', assessmentFilter)
      }
      
      console.log('Fetching data with params:', params.toString())
      // Add cache busting to ensure fresh data
      const response = await fetch(`/api/upload/weekly-scores?${params.toString()}&_t=${Date.now()}`)
      const data = await response.json()
      
      if (data.uploads) {
        console.log('=== TEACHER DASHBOARD API RESPONSE ===')
        console.log('API Response:', data)
        console.log('API totalStudents:', data.totalStudents)
        console.log('API uploads count:', data.uploads.length)
        console.log('API uploads details:', data.uploads.map((upload: any) => ({
          weekNumber: upload.weekNumber,
          totalStudents: upload.totalStudents,
          studentsCount: upload.students?.length || 0,
          subject: upload.subject
        })))
        
        // Get available assessments (sorted by date, newest first)
        const assessments = [...new Set(data.uploads.map((upload: any) => ({
          value: upload.assessmentName || `Assessment ${upload.weekNumber}`,
          label: `${upload.assessmentName || `Assessment ${upload.weekNumber}`} - ${new Date(upload.assessmentDate || upload.uploadTime).toLocaleDateString()}`,
          date: upload.assessmentDate || upload.uploadTime,
          displayDate: new Date(upload.assessmentDate || upload.uploadTime).toLocaleDateString()
        })))].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        console.log('=== ASSESSMENT OPTIONS DEBUG ===')
        console.log('Raw uploads:', data.uploads.map(u => ({ 
          assessmentName: u.assessmentName, 
          weekNumber: u.weekNumber,
          assessmentDate: u.assessmentDate 
        })))
        console.log('Processed assessments:', assessments)
        
        setAssessmentOptions(assessments)
        processTeacherData(data.uploads, data.totalStudents)
      }
    } catch (error) {
      console.error('Error fetching teacher dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processTeacherData = (uploads: any[], apiTotalStudents?: number) => {
    const allStudents: StudentPerformance[] = []
    
    // Filter uploads by assessment if not 'all'
    const filteredUploads = assessmentFilter === 'all' 
      ? uploads 
      : uploads.filter(upload => upload.assessmentName === assessmentFilter)
    
    console.log('Processing teacher data:')
    console.log('Assessment filter:', assessmentFilter)
    console.log('Total uploads:', uploads.length)
    console.log('Filtered uploads:', filteredUploads.length)
    console.log('API total students:', apiTotalStudents)
    
    // Collect all students from filtered uploads
    filteredUploads.forEach(upload => {
      if (upload.students) {
        upload.students.forEach((student: any) => {
          allStudents.push({
            studentId: student.studentId,
            studentName: student.studentName,
            subject: student.subject,
            score: student.score,
            grade: student.grade,
            className: student.className,
            weekNumber: student.weekNumber,
            uploadDate: student.uploadDate
          })
        })
      }
    })

    // Group students by studentId to get unique students
    const studentGroups = new Map()
    allStudents.forEach(student => {
      if (!studentGroups.has(student.studentId)) {
        studentGroups.set(student.studentId, [])
      }
      studentGroups.get(student.studentId).push(student)
    })

    // Calculate average score for each unique student
    const uniqueStudents = Array.from(studentGroups.values()).map(studentRecords => {
      const averageScore = studentRecords.reduce((sum, s) => sum + s.score, 0) / studentRecords.length
      return {
        ...studentRecords[0], // Use first record as base
        score: Math.round(averageScore), // Use average score
        subject: 'Both' // Mark as both subjects
      }
    })

    // Categorize unique students by performance
    // Green tier (≥85%) = High Performing Students
    // All others (Orange, Red, Gray) = Students Needing Help
    const highPerformingStudents = uniqueStudents.filter(student => student.score >= 85)
    const studentsNeedingHelp = uniqueStudents.filter(student => student.score < 85)
    
    console.log('Teacher Dashboard Debug:')
    console.log('Filtered uploads:', filteredUploads.length)
    console.log('All student records:', allStudents.length)
    console.log('Unique students:', uniqueStudents.length)
    console.log('Students needing help (< 85):', studentsNeedingHelp.length)
    console.log('High performing students (>= 85):', highPerformingStudents.length)
    console.log('Student scores:', uniqueStudents.map(s => `${s.studentName}: ${s.score}% (avg)`))
    console.log('Upload details:', filteredUploads.map(u => ({ 
      teacher: u.teacherName, 
      students: u.totalStudents, 
      subject: u.subject, 
      week: u.weekNumber,
      studentRecords: u.students?.length || 0
    })))
    
    // No need for getLatestScores since we already have unique students
    const uniqueStudentsNeedingHelp = studentsNeedingHelp
    const uniqueHighPerformers = highPerformingStudents

    // For teacher dashboard, count students based on assessment filter
    let totalStudents
    if (assessmentFilter === 'all') {
      // When showing all assessments, count unique students across all uploads
      totalStudents = uniqueStudents.length
    } else {
      // When showing specific assessment, count students in that assessment only
      const assessmentUploads = uploads.filter(upload => upload.assessmentName === assessmentFilter)
      const assessmentStudents = new Set()
      assessmentUploads.forEach(upload => {
        if (upload.students) {
          upload.students.forEach((student: any) => {
            if (student.studentId) {
              assessmentStudents.add(student.studentId)
            }
          })
        }
      })
      totalStudents = assessmentStudents.size
    }
    
    const summary = {
      totalStudents: totalStudents,
      averageScore: uniqueStudents.length > 0 ? 
        Math.round(uniqueStudents.reduce((sum, s) => sum + s.score, 0) / uniqueStudents.length) : 0,
      studentsNeedingHelp: uniqueStudentsNeedingHelp.length,
      highPerformers: uniqueHighPerformers.length
    }
    
    console.log('Final summary:', summary)

    setDashboardData({
      studentsNeedingHelp: uniqueStudentsNeedingHelp,
      highPerformingStudents: uniqueHighPerformers,
      summary
    })
  }

  const getLatestScores = (students: StudentPerformance[]) => {
    const studentMap = new Map()
    
    students.forEach(student => {
      const key = `${student.studentId}-${student.subject}`
      if (!studentMap.has(key) || new Date(student.uploadDate) > new Date(studentMap.get(key).uploadDate)) {
        studentMap.set(key, student)
      }
    })
    
    return Array.from(studentMap.values())
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return '#10B981' // Green
    if (score >= 70) return '#F59E0B' // Orange
    if (score >= 60) return '#EF4444' // Red
    return '#6B7280' // Gray
  }

  const getPerformanceLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Needs Improvement'
    return 'Needs Help'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <p style={{ color: '#6B7280', fontSize: '1rem' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #E5E7EB',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: 0
            }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
              </div>
              Teacher Dashboard
            </h1>
          </div>
          <p style={{ color: '#6B7280', fontSize: '1.125rem', marginBottom: '1.5rem' }}>
            Welcome back, {teacherName}! Here's how your students are performing.
          </p>
          
          {/* Week Filter */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
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
                  {assessment.label} - {assessment.displayDate}
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchTeacherDashboardData()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem' }}>
        
        {/* Assessment Indicator */}
        {assessmentFilter !== 'all' && (
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#1E40AF',
              margin: 0
            }}>
              📅 Showing data for: {assessmentFilter === 'all' ? 'All Assessments' : assessmentOptions.find(a => a.value === assessmentFilter)?.label || 'All Assessments'}
            </h3>
          </div>
        )}

        {/* Summary Cards */}
        {dashboardData && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Users style={{ width: '1.5rem', height: '1.5rem', color: '#3B82F6' }} />
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>Total Students</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                {dashboardData.summary.totalStudents}
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Target style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>Average Score</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                {dashboardData.summary.averageScore}%
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <AlertTriangle style={{ width: '1.5rem', height: '1.5rem', color: '#EF4444' }} />
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>Need Help</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>
                {dashboardData.summary.studentsNeedingHelp}
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>High Performers</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                {dashboardData.summary.highPerformers}
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '2rem' 
        }}>
          
          {/* Left Side - Students Needing Help */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              marginBottom: '1.5rem' 
            }}>
              <AlertTriangle style={{ width: '1.5rem', height: '1.5rem', color: '#EF4444' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                Students Needing Help
              </h2>
            </div>

            {dashboardData?.studentsNeedingHelp.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: '#6B7280'
              }}>
                <CheckCircle style={{ width: '3rem', height: '3rem', color: '#10B981', margin: '0 auto 1rem auto' }} />
                <p style={{ fontSize: '1rem', fontWeight: '500' }}>Great job! No students need help right now.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dashboardData?.studentsNeedingHelp.map((student, index) => (
                  <div key={`${student.studentId}-${student.subject}`} style={{
                    padding: '1rem',
                    backgroundColor: '#FEF2F2',
                    borderRadius: '0.75rem',
                    border: '1px solid #FECACA'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        {student.studentName}
                      </div>
                      <div style={{
                        backgroundColor: getPerformanceColor(student.score),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {student.score}%
                      </div>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                      {student.subject} • {student.grade} • {student.className}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#EF4444',
                      fontWeight: '500'
                    }}>
                      {getPerformanceLabel(student.score)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - High Performing Students */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              marginBottom: '1.5rem' 
            }}>
              <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                High Performing Students
              </h2>
            </div>

            {dashboardData?.highPerformingStudents.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: '#6B7280'
              }}>
                <TrendingUp style={{ width: '3rem', height: '3rem', color: '#F59E0B', margin: '0 auto 1rem auto' }} />
                <p style={{ fontSize: '1rem', fontWeight: '500' }}>Keep working! No high performers yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dashboardData?.highPerformingStudents.map((student, index) => (
                  <div key={`${student.studentId}-${student.subject}`} style={{
                    padding: '1rem',
                    backgroundColor: '#F0FDF4',
                    borderRadius: '0.75rem',
                    border: '1px solid #BBF7D0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        {student.studentName}
                      </div>
                      <div style={{
                        backgroundColor: getPerformanceColor(student.score),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {student.score}%
                      </div>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                      {student.subject} • {student.grade} • {student.className}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#10B981',
                      fontWeight: '500'
                    }}>
                      {getPerformanceLabel(student.score)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Classes Needing Support */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              marginBottom: '1.5rem' 
            }}>
              <AlertTriangle style={{ width: '1.5rem', height: '1.5rem', color: '#EF4444' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                Classes Needing Support
              </h2>
            </div>

            {dashboardData?.studentsNeedingHelp.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: '#6B7280'
              }}>
                <CheckCircle style={{ width: '3rem', height: '3rem', color: '#10B981', margin: '0 auto 1rem auto' }} />
                <p style={{ fontSize: '1rem', fontWeight: '500' }}>All classes are performing well! No support needed.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Group students by class */}
                {Array.from(new Set(dashboardData?.studentsNeedingHelp.map(s => s.className))).map(className => {
                  const classStudents = dashboardData?.studentsNeedingHelp.filter(s => s.className === className) || []
                  const averageScore = Math.round(classStudents.reduce((sum, s) => sum + s.score, 0) / classStudents.length)
                  
                  return (
                    <div key={className} style={{
                      padding: '1rem',
                      backgroundColor: '#FEF2F2',
                      borderRadius: '0.75rem',
                      border: '1px solid #FECACA'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '600', color: '#111827' }}>
                          {className} - {teacherName}
                        </div>
                        <div style={{
                          backgroundColor: getPerformanceColor(averageScore),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {averageScore}% avg
                        </div>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                        {classStudents.length} students need support
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#EF4444',
                        fontWeight: '500'
                      }}>
                        Focus on: {classStudents.map(s => s.studentName).join(', ')}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
