'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  Users, 
  Filter, 
  Download, 
  TrendingUp,
  Loader2,
  Search,
  FileText,
  Award,
  AlertTriangle,
  Printer,
  Calendar
} from 'lucide-react'

interface StudentScore {
  score: number
  tier: string
  tierColor: string
}

interface Student {
  studentId: string
  studentName: string
  grade: string
  className: string
  weekNumber: number
  scores: {
    math?: StudentScore
    reading?: StudentScore
  }
  overallScore: number | null
  overallTier: string | null
  overallTierColor: string | null
}

interface StudentReportData {
  students: Student[]
  summary: {
    totalStudents: number
    averageScore: number
    aboveThreshold: number
    belowThreshold: number
    threshold: number
  }
  filters: {
    grade: string | null
    className: string | null
    subject: string
    minScore: string | null
    week: number
    weekLabel: string
    teacher?: string
  }
  upload: {
    teacherName: string
    uploadTime: string
    weekLabel: string
  }
}

export default function StudentsPerformancePage() {
  const { data: session } = useSession()
  const [reportData, setReportData] = useState<StudentReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [weekOptions, setWeekOptions] = useState<Array<{weekNumber: number, label: string}>>([])
  const [filters, setFilters] = useState({
    subject: 'all',
    minScore: '',
    searchTerm: '',
    week: 'current' // 'current' for latest, or specific week number
  })

  // Mock session for testing - default to teacher
  const mockSession = {
    user: {
      name: 'Demo Teacher',
      email: 'teacher@school.edu',
      role: 'TEACHER'
    }
  }

  const currentSession = session || mockSession

  useEffect(() => {
    fetchWeekOptions()
    fetchStudentData()
  }, [filters.subject, filters.minScore, filters.week])

  const fetchWeekOptions = async () => {
    try {
      const userName = currentSession?.user?.name || 'Demo Teacher'
      const params = new URLSearchParams()
      params.append('role', 'TEACHER')
      params.append('user', userName)

      const response = await fetch(`/api/upload/weekly-scores?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setWeekOptions(data.weekOptions || [])
      }
    } catch (error) {
      console.error('Failed to fetch week options:', error)
    }
  }

  const fetchStudentData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.subject !== 'all') params.append('subject', filters.subject)
      if (filters.minScore) params.append('minScore', filters.minScore)
      if (filters.week !== 'current') params.append('week', filters.week)
      
      // Teachers only see their own data
      const userName = currentSession?.user?.name || 'Demo Teacher'
      
      params.append('role', 'TEACHER')
      params.append('user', userName)

      const response = await fetch(`/api/reports/students?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Failed to fetch student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierBadgeStyle = (tierColor: string) => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      border: '1px solid'
    }
    
    switch (tierColor) {
      case 'green': 
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }
      case 'orange': 
        return { ...baseStyle, backgroundColor: '#fed7aa', color: '#9a3412', borderColor: '#fdba74' }
      case 'red': 
        return { ...baseStyle, backgroundColor: '#fecaca', color: '#991b1b', borderColor: '#fca5a5' }
      case 'gray': 
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }
      default: 
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }
    }
  }

  const exportToCSV = () => {
    if (!reportData || !reportData.students.length) return

    const headers = ['Student ID', 'Math Score', 'Math Tier', 'Reading Score', 'Reading Tier', 'Overall Score', 'Overall Tier']
    const csvData = [
      headers.join(','),
      ...reportData.students.map(student => [
        student.studentId,
        student.scores.math?.score || '',
        student.scores.math?.tier || '',
        student.scores.reading?.score || '',
        student.scores.reading?.tier || '',
        student.overallScore?.toFixed(1) || '',
        student.overallTier || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `student-performance-${reportData.filters.weekLabel?.replace(/\s+/g, '-') || 'report'}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const generatePdfReport = async () => {
    if (!reportData) return
    
    setGeneratingPdf(true)
    try {
      const response = await fetch('/api/reports/students/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            subject: filters.subject,
            minScore: filters.minScore,
            week: filters.week !== 'current' ? filters.week : reportData.filters.week,
            userRole: 'TEACHER',
            userName: currentSession?.user?.name || 'Demo Teacher'
          }
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `student-performance-${reportData.filters.weekLabel?.replace(/\s+/g, '-') || 'report'}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Failed to generate PDF')
        alert('Failed to generate PDF report. Please try again.')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF report. Please try again.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  // Filter students based on search term
  const filteredStudents = reportData?.students.filter(student =>
    student.studentId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    student.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase())
  ) || []

  // Use the allTeachers state for the dropdown (populated separately)

  if (!currentSession) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '24rem' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
          border: '1px solid #e5e7eb', 
          padding: '2rem',
          maxWidth: '28rem'
        }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '0.5rem' 
          }}>Please Sign In</h1>
          <p style={{ color: '#6b7280' }}>Sign in to view student performance data.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '80rem', 
      margin: '0 auto',
      padding: '0 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 'bold', 
          color: '#111827' 
        }}>Individual Student Performance</h1>
        <p style={{ color: '#6b7280' }}>
          View detailed performance data for each student by ID/number to identify focus areas.
        </p>
      </div>

      {/* Filters and Controls */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '1.5rem'
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: '1rem', 
          marginBottom: '1rem' 
        }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            gap: '1rem' 
          }}>
            {/* Subject Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
              <label style={{ fontWeight: '500', color: '#374151' }}>Subject:</label>
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'white',
                  fontSize: '0.875rem',
                  minWidth: '10rem'
                }}
              >
                <option value="all">All Subjects</option>
                <option value="math">Math Only</option>
                <option value="reading">Reading Only</option>
              </select>
            </div>

            {/* Week Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
              <label style={{ fontWeight: '500', color: '#374151' }}>Week:</label>
              <select
                value={filters.week}
                onChange={(e) => setFilters({ ...filters, week: e.target.value })}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'white',
                  fontSize: '0.875rem',
                  minWidth: '12rem'
                }}
              >
                <option value="current">Current Week</option>
                {weekOptions.map(week => (
                  <option key={week.weekNumber} value={week.weekNumber.toString()}>
                    {week.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher Filter (only for leaders) */}

            {/* Minimum Score Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
              <label style={{ fontWeight: '500', color: '#374151' }}>Min Score:</label>
              <input
                type="number"
                placeholder="e.g., 85"
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  width: '6rem',
                  fontSize: '0.875rem'
                }}
                min="0"
                max="100"
              />
            </div>

            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
              <input
                type="text"
                placeholder="Search by student ID or name"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  width: '16rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={exportToCSV}
              disabled={!reportData || !reportData.students.length}
              style={{
                backgroundColor: !reportData || !reportData.students.length ? '#9ca3af' : '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: !reportData || !reportData.students.length ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500',
                fontSize: '0.875rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (reportData && reportData.students.length) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8'
                }
              }}
              onMouseOut={(e) => {
                if (reportData && reportData.students.length) {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                }
              }}
            >
              <Download style={{ width: '1rem', height: '1rem' }} />
              <span>CSV</span>
            </button>

            <button
              onClick={generatePdfReport}
              disabled={!reportData || !reportData.students.length || generatingPdf}
              style={{
                backgroundColor: !reportData || !reportData.students.length || generatingPdf ? '#9ca3af' : '#059669',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: !reportData || !reportData.students.length || generatingPdf ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500',
                fontSize: '0.875rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (reportData && reportData.students.length && !generatingPdf) {
                  e.currentTarget.style.backgroundColor = '#047857'
                }
              }}
              onMouseOut={(e) => {
                if (reportData && reportData.students.length && !generatingPdf) {
                  e.currentTarget.style.backgroundColor = '#059669'
                }
              }}
            >
              {generatingPdf ? (
                <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Printer style={{ width: '1rem', height: '1rem' }} />
              )}
              <span>{generatingPdf ? 'Generating...' : 'PDF Report'}</span>
            </button>
          </div>
        </div>

        {/* Data Source Info */}
        {reportData && (
          <div style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280', 
            borderTop: '1px solid #e5e7eb', 
            paddingTop: '1rem' 
          }}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              alignItems: 'center', 
              gap: '1rem' 
            }}>
              <span><strong>Week:</strong> {reportData.filters.weekLabel}</span>
              <span><strong>Class:</strong> {reportData.filters.grade} {reportData.filters.className}</span>
              {reportData.filters.teacher && reportData.filters.teacher !== 'all' && (
                <span><strong>Teacher:</strong> {reportData.filters.teacher}</span>
              )}
              <span><strong>Data Updated:</strong> {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loader2 style={{ 
            width: '2rem', 
            height: '2rem', 
            color: '#2563eb', 
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#6b7280' }}>Loading student performance data...</p>
        </div>
      ) : reportData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Users style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  color: '#2563eb', 
                  marginRight: '0.75rem' 
                }} />
                <div>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#111827' 
                  }}>{reportData.summary.totalStudents}</div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280' 
                  }}>Total Students</div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FileText style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  color: '#7c3aed', 
                  marginRight: '0.75rem' 
                }} />
                <div>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#111827' 
                  }}>{reportData.summary.averageScore.toFixed(1)}%</div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280' 
                  }}>Average Score</div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Award style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  color: '#059669', 
                  marginRight: '0.75rem' 
                }} />
                <div>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#111827' 
                  }}>{reportData.summary.aboveThreshold}</div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280' 
                  }}>Above {reportData.summary.threshold}%</div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <AlertTriangle style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  color: '#ea580c', 
                  marginRight: '0.75rem' 
                }} />
                <div>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#111827' 
                  }}>{reportData.summary.belowThreshold}</div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280' 
                  }}>Below {reportData.summary.threshold}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid #e5e7eb' 
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#111827' 
              }}>
                Student Performance Details ({filteredStudents.length} students)
              </h3>
            </div>

            {filteredStudents.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th style={{ 
                        padding: '0.75rem 1.5rem', 
                        textAlign: 'left', 
                        fontSize: '0.75rem', 
                        fontWeight: '500', 
                        color: '#6b7280', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Student ID
                      </th>
                      <th style={{ 
                        padding: '0.75rem 1.5rem', 
                        textAlign: 'left', 
                        fontSize: '0.75rem', 
                        fontWeight: '500', 
                        color: '#6b7280', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Math Score
                      </th>
                      <th style={{ 
                        padding: '0.75rem 1.5rem', 
                        textAlign: 'left', 
                        fontSize: '0.75rem', 
                        fontWeight: '500', 
                        color: '#6b7280', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Reading Score
                      </th>
                      <th style={{ 
                        padding: '0.75rem 1.5rem', 
                        textAlign: 'left', 
                        fontSize: '0.75rem', 
                        fontWeight: '500', 
                        color: '#6b7280', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Overall Score
                      </th>
                      <th style={{ 
                        padding: '0.75rem 1.5rem', 
                        textAlign: 'left', 
                        fontSize: '0.75rem', 
                        fontWeight: '500', 
                        color: '#6b7280', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Performance Tier
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: 'white' }}>
                    {filteredStudents.map((student, index) => (
                      <tr key={student.studentId} style={{ 
                        borderBottom: index < filteredStudents.length - 1 ? '1px solid #e5e7eb' : 'none'
                      }}>
                        <td style={{ 
                          padding: '1rem 1.5rem', 
                          whiteSpace: 'nowrap' 
                        }}>
                          <div style={{ 
                            fontWeight: '500', 
                            color: '#111827' 
                          }}>Student {student.studentId}</div>
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {student.scores.math ? (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem' 
                            }}>
                              <span style={{ fontWeight: '500' }}>
                                {student.scores.math.score}%
                              </span>
                              <span style={getTierBadgeStyle(student.scores.math.tierColor)}>
                                {student.scores.math.tier}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>-</span>
                          )}
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {student.scores.reading ? (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem' 
                            }}>
                              <span style={{ fontWeight: '500' }}>
                                {student.scores.reading.score}%
                              </span>
                              <span style={getTierBadgeStyle(student.scores.reading.tierColor)}>
                                {student.scores.reading.tier}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>-</span>
                          )}
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {student.overallScore !== null ? (
                            <div style={{ 
                              fontWeight: '600', 
                              fontSize: '1.125rem' 
                            }}>
                              {student.overallScore.toFixed(1)}%
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>-</span>
                          )}
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {student.overallTier && student.overallTierColor ? (
                            <span style={{
                              ...getTierBadgeStyle(student.overallTierColor),
                              padding: '0.375rem 0.75rem',
                              fontSize: '0.875rem'
                            }}>
                              {student.overallTier} Tier
                            </span>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <Users style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  color: '#9ca3af', 
                  margin: '0 auto 1rem' 
                }} />
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '500', 
                  color: '#111827', 
                  marginBottom: '0.5rem' 
                }}>No Students Found</h3>
                <p style={{ color: '#6b7280' }}>
                  {filters.searchTerm || filters.minScore 
                    ? 'No students match your current filters.' 
                    : 'No student data available.'}
                </p>
              </div>
            )}
          </div>

          {/* Performance Insights */}
          {reportData.summary.totalStudents > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              padding: '1.5rem'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#111827', 
                marginBottom: '1rem' 
              }}>Performance Insights</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1.5rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem' 
                }}>
                  <h4 style={{ 
                    fontWeight: '500', 
                    color: '#111827' 
                  }}>High Performers (≥85%)</h4>
                  {filteredStudents
                    .filter(s => s.overallScore !== null && s.overallScore >= 85)
                    .slice(0, 5)
                    .map(student => (
                      <div key={student.studentId} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '0.75rem', 
                        backgroundColor: '#dcfce7', 
                        borderRadius: '0.5rem' 
                      }}>
                        <span style={{ fontWeight: '500' }}>
                          Student {student.studentId}
                        </span>
                        <span style={{ 
                          color: '#166534', 
                          fontWeight: '600' 
                        }}>
                          {student.overallScore?.toFixed(1)}%
                        </span>
                      </div>
                    ))
                  }
                  {filteredStudents.filter(s => s.overallScore !== null && s.overallScore >= 85).length === 0 && (
                    <p style={{ 
                      color: '#6b7280', 
                      fontStyle: 'italic' 
                    }}>No students scoring 85% or above</p>
                  )}
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem' 
                }}>
                  <h4 style={{ 
                    fontWeight: '500', 
                    color: '#111827' 
                  }}>Students Needing Support (&lt;65%)</h4>
                  {filteredStudents
                    .filter(s => s.overallScore !== null && s.overallScore < 65)
                    .slice(0, 5)
                    .map(student => (
                      <div key={student.studentId} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '0.75rem', 
                        backgroundColor: '#fecaca', 
                        borderRadius: '0.5rem' 
                      }}>
                        <span style={{ fontWeight: '500' }}>
                          Student {student.studentId}
                        </span>
                        <span style={{ 
                          color: '#991b1b', 
                          fontWeight: '600' 
                        }}>
                          {student.overallScore?.toFixed(1)}%
                        </span>
                      </div>
                    ))
                  }
                  {filteredStudents.filter(s => s.overallScore !== null && s.overallScore < 65).length === 0 && (
                    <p style={{ 
                      color: '#6b7280', 
                      fontStyle: 'italic' 
                    }}>No students scoring below 65%</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <FileText style={{ 
            width: '3rem', 
            height: '3rem', 
            color: '#9ca3af', 
            margin: '0 auto 1rem' 
          }} />
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '500', 
            color: '#111827', 
            marginBottom: '0.5rem' 
          }}>No Data Available</h3>
          <p style={{ color: '#6b7280' }}>
            No student performance data found. Please upload assessment data first.
          </p>
        </div>
      )}

      {/* Copyright Footer */}
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem 0', 
        borderTop: '1px solid #e5e7eb' 
      }}>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.875rem' 
        }}>
          © 2025 Analytics by Dr. Askar. All rights reserved.
        </p>
      </div>
    </div>
  )
}