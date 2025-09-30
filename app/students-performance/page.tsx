'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  Users,
  Award,
  AlertTriangle,
  BarChart3,
  Calendar
} from 'lucide-react'

interface StudentGrowthData {
  studentId: string
  studentName: string
  grade: string
  className: string
  assessments: {
    [assessmentName: string]: {
      math?: number
      reading?: number
      science?: number
      overall: number
      date: string
    }
  }
  growth: {
    math: number | null
    reading: number | null
    science: number | null
    overall: number | null
  }
  trend: 'improving' | 'declining' | 'stable'
}

export default function StudentOverviewPage() {
  const { data: session } = useSession()
  const [students, setStudents] = useState<StudentGrowthData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrend, setSelectedTrend] = useState<string>('all')
  const [selectedAssessment, setSelectedAssessment] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [assessmentNames, setAssessmentNames] = useState<string[]>([])

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
    fetchStudentGrowthData()
  }, [teacherName])

  const fetchStudentGrowthData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('role', 'TEACHER')
      params.append('user', teacherName)
      
      const response = await fetch(`/api/upload/weekly-scores?${params.toString()}&_t=${Date.now()}`)
      const data = await response.json()
      
      if (data.uploads) {
        processGrowthData(data.uploads)
      }
    } catch (error) {
      console.error('Error fetching student growth data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processGrowthData = (uploads: any[]) => {
    // Group by student
    const studentMap = new Map<string, any>()
    const assessmentSet = new Set<string>()

    uploads.forEach(upload => {
      const assessmentName = upload.assessmentName || `Assessment ${upload.weekNumber}`
      assessmentSet.add(assessmentName)

      upload.students?.forEach((student: any) => {
        if (!studentMap.has(student.studentId)) {
          studentMap.set(student.studentId, {
            studentId: student.studentId,
            studentName: student.studentName,
            grade: student.grade,
            className: student.className,
            assessments: {}
          })
        }

        const studentData = studentMap.get(student.studentId)
        if (!studentData.assessments[assessmentName]) {
          studentData.assessments[assessmentName] = {
            date: upload.assessmentDate || upload.uploadTime
          }
        }

        // Add score by subject
        const subject = student.subject.toLowerCase()
        studentData.assessments[assessmentName][subject] = student.score
      })
    })

    // Calculate overall scores and growth for each student
    const studentsArray: StudentGrowthData[] = Array.from(studentMap.values()).map(student => {
      const assessmentKeys = Object.keys(student.assessments).sort((a, b) => {
        const dateA = new Date(student.assessments[a].date).getTime()
        const dateB = new Date(student.assessments[b].date).getTime()
        return dateA - dateB
      })

      // Calculate overall scores for each assessment
      assessmentKeys.forEach(key => {
        const assessment = student.assessments[key]
        const scores = [assessment.math, assessment.reading, assessment.science].filter(s => s !== undefined)
        assessment.overall = scores.length > 0 
          ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
          : 0
      })

      // Calculate growth (compare first and last assessment)
      const growth: {
        math: number | null
        reading: number | null
        science: number | null
        overall: number | null
      } = {
        math: null,
        reading: null,
        science: null,
        overall: null
      }

      if (assessmentKeys.length >= 2) {
        const first = student.assessments[assessmentKeys[0]]
        const last = student.assessments[assessmentKeys[assessmentKeys.length - 1]]

        if (first.math !== undefined && last.math !== undefined) {
          growth.math = last.math - first.math
        }
        if (first.reading !== undefined && last.reading !== undefined) {
          growth.reading = last.reading - first.reading
        }
        if (first.science !== undefined && last.science !== undefined) {
          growth.science = last.science - first.science
        }
        growth.overall = last.overall - first.overall
      }

      // Determine trend
      let trend: 'improving' | 'declining' | 'stable' = 'stable'
      if (growth.overall !== null) {
        if (growth.overall > 3) trend = 'improving'
        else if (growth.overall < -3) trend = 'declining'
      }

      return {
        ...student,
        growth,
        trend
      }
    })

    setAssessmentNames(Array.from(assessmentSet))
    setStudents(studentsArray)
  }

  // Filter students
  const filteredStudents = students.filter(student => {
    if (selectedTrend !== 'all' && student.trend !== selectedTrend) return false
    if (selectedAssessment !== 'all') {
      // Only show students who have this specific assessment
      if (!student.assessments[selectedAssessment]) return false
    }
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (!student.studentName.toLowerCase().includes(searchLower)) return false
    }
    return true
  })

  // Calculate summary stats - USE FILTERED STUDENTS (not all students)
  const improvingCount = filteredStudents.filter(s => s.trend === 'improving').length
  const decliningCount = filteredStudents.filter(s => s.trend === 'declining').length
  const stableCount = filteredStudents.filter(s => s.trend === 'stable').length

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10B981'
    if (score >= 70) return '#F59E0B'
    if (score >= 60) return '#EF4444'
    return '#6B7280'
  }

  const getGrowthIcon = (growth: number | null) => {
    if (growth === null) return <Minus style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
    if (growth > 3) return <TrendingUp style={{ width: '1rem', height: '1rem', color: '#10B981' }} />
    if (growth < -3) return <TrendingDown style={{ width: '1rem', height: '1rem', color: '#EF4444' }} />
    return <Minus style={{ width: '1rem', height: '1rem', color: '#F59E0B' }} />
  }

  const getGrowthColor = (growth: number | null) => {
    if (growth === null) return '#6B7280'
    if (growth > 3) return '#10B981'
    if (growth < -3) return '#EF4444'
    return '#F59E0B'
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
          <p style={{ color: '#6B7280' }}>Loading student growth data...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', padding: '2rem' }}>
        <div style={{ maxWidth: '90rem', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
            </div>
            Student Growth Overview
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1.125rem' }}>
            Track student progress across assessments - {teacherName}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem' }}>
        
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Users style={{ width: '1.5rem', height: '1.5rem', color: '#3B82F6' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>
                {searchTerm ? 'Showing' : 'Total Students'}
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
              {filteredStudents.length}
            </div>
            {searchTerm && filteredStudents.length === 1 && (
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                {filteredStudents[0].studentName}
              </div>
            )}
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <TrendingUp style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>Improving</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
              {improvingCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
              {filteredStudents.length > 0 ? Math.round((improvingCount / filteredStudents.length) * 100) : 0}% {searchTerm ? 'shown' : 'of class'}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Minus style={{ width: '1.5rem', height: '1.5rem', color: '#F59E0B' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>Stable</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
              {stableCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
              {filteredStudents.length > 0 ? Math.round((stableCount / filteredStudents.length) * 100) : 0}% {searchTerm ? 'shown' : 'of class'}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <TrendingDown style={{ width: '1.5rem', height: '1.5rem', color: '#EF4444' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>Declining</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>
              {decliningCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
              {filteredStudents.length > 0 ? Math.round((decliningCount / filteredStudents.length) * 100) : 0}% {searchTerm ? 'shown' : 'of class'}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontWeight: '600', color: '#374151', fontSize: '1rem' }}>🔍 Filter By:</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>Student:</label>
            <input
              type="text"
              placeholder="Type student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid #10B981',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                minWidth: '200px',
                outline: 'none'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>Trend:</label>
            <select
              value={selectedTrend}
              onChange={(e) => setSelectedTrend(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                minWidth: '150px'
              }}
            >
              <option value="all">All Trends</option>
              <option value="improving">📈 Improving</option>
              <option value="stable">➡️ Stable</option>
              <option value="declining">📉 Declining</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>Assessment:</label>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                minWidth: '200px',
                fontWeight: '500'
              }}
            >
              <option value="all">📊 All Assessments</option>
              {assessmentNames.map((name, idx) => (
                <option key={idx} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchStudentGrowthData}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Refresh
          </button>

          <button
            onClick={() => window.print()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: '600',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            🖨️ Print Report
          </button>
        </div>

        {/* Print Help Notice */}
        {searchTerm && filteredStudents.length > 0 && (
          <div style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              backgroundColor: '#10B981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1rem'
            }}>
              🖨️
            </div>
            <div>
              <div style={{ fontWeight: '600', color: '#166534', marginBottom: '0.25rem' }}>
                {filteredStudents.length === 1 ? 'Individual Student Report Ready!' : `${filteredStudents.length} Students Selected`}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#166534' }}>
                Click "🖨️ Print Report" to print {filteredStudents.length === 1 ? `${filteredStudents[0].studentName}'s report` : 'these students\' reports'} for parent conference
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#1E40AF' }}>📊 Growth Indicators:</div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#1E40AF' }}>
            <div><TrendingUp style={{ width: '1rem', height: '1rem', color: '#10B981', display: 'inline', marginRight: '0.5rem' }} /><strong>Green Arrow:</strong> Improved 3+ points</div>
            <div><Minus style={{ width: '1rem', height: '1rem', color: '#F59E0B', display: 'inline', marginRight: '0.5rem' }} /><strong>Orange Line:</strong> Stable (±3 points)</div>
            <div><TrendingDown style={{ width: '1rem', height: '1rem', color: '#EF4444', display: 'inline', marginRight: '0.5rem' }} /><strong>Red Arrow:</strong> Declined 3+ points</div>
          </div>
        </div>

        {/* Student Growth Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
            Student Progress ({filteredStudents.length} students)
          </h2>

          {filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
              <Users style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#D1D5DB' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>No students match your filters</p>
              <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters or upload more assessments</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Student</th>
                    {assessmentNames.map((name, idx) => (
                      <th key={idx} style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                        {name}
                      </th>
                    ))}
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Growth</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.studentId} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#111827' }}>{student.studentName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{student.grade}, Section {student.className}</div>
                      </td>
                      {assessmentNames.map((name, idx) => {
                        const assessment = student.assessments[name]
                        if (!assessment) {
                          return <td key={idx} style={{ padding: '1rem', textAlign: 'center', color: '#D1D5DB', fontSize: '1.5rem' }}>—</td>
                        }
                        const displayScore = assessment.overall
                        
                        return (
                          <td key={idx} style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{
                              display: 'inline-block',
                              backgroundColor: getScoreColor(displayScore || 0),
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.5rem',
                              fontSize: '1rem',
                              fontWeight: '700',
                              minWidth: '3.5rem'
                            }}>
                              {displayScore || 0}%
                            </div>
                          </td>
                        )
                      })}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.5rem',
                          backgroundColor: `${getGrowthColor(student.growth.overall)}20`,
                          color: getGrowthColor(student.growth.overall),
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {getGrowthIcon(student.growth.overall)}
                          {student.growth.overall !== null ? `${student.growth.overall > 0 ? '+' : ''}${student.growth.overall}` : 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {student.trend === 'improving' && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.5rem',
                            backgroundColor: '#DCFCE7',
                            color: '#166534',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            <TrendingUp style={{ width: '1rem', height: '1rem' }} />
                            Improving
                          </div>
                        )}
                        {student.trend === 'stable' && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.5rem',
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            <Minus style={{ width: '1rem', height: '1rem' }} />
                            Stable
                          </div>
                        )}
                        {student.trend === 'declining' && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.5rem',
                            backgroundColor: '#FEE2E2',
                            color: '#991B1B',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            <TrendingDown style={{ width: '1rem', height: '1rem' }} />
                            Declining
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media print {
          /* Hide filters and buttons when printing */
          button {
            display: none !important;
          }
          
          /* Make table fit on page */
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          /* Adjust for print */
          body {
            background: white !important;
          }
          
          /* Add header for print */
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  )
}
