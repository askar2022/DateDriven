'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Eye,
  BookOpen
} from 'lucide-react'

interface Assessment {
  id: string
  assessmentName: string
  subject: string
  grade: string
  className: string
  teacherName: string
  assessmentDate: string
  totalStudents: number
  averageScore: number
  students: any[]
  performanceDistribution: {
    green: number  // 85-100
    yellow: number // 70-84
    red: number    // 60-69
    grey: number   // 0-59
  }
}

export default function ImprovedTeacherDashboard() {
  const { data: session } = useSession()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [assessmentFilter, setAssessmentFilter] = useState('all')

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
    fetchAllAssessments()
  }, [teacherName])

  const fetchAllAssessments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('role', 'TEACHER')
      params.append('user', teacherName)
      
      const response = await fetch(`/api/upload/weekly-scores?${params.toString()}&_t=${Date.now()}`)
      const data = await response.json()
      
      if (data.uploads) {
        const processedAssessments = data.uploads.map((upload: any) => {
          // Calculate performance distribution
          const distribution = {
            green: 0,
            yellow: 0,
            red: 0,
            grey: 0
          }
          
          upload.students?.forEach((student: any) => {
            if (student.score >= 85) distribution.green++
            else if (student.score >= 70) distribution.yellow++
            else if (student.score >= 60) distribution.red++
            else distribution.grey++
          })
          
          return {
            id: upload.id,
            assessmentName: upload.assessmentName || `Assessment ${upload.weekNumber}`,
            subject: upload.subject,
            grade: upload.grade,
            className: upload.className,
            teacherName: upload.teacherName,
            assessmentDate: upload.assessmentDate || upload.uploadTime,
            totalStudents: upload.totalStudents,
            averageScore: Math.round(upload.averageScore),
            students: upload.students || [],
            performanceDistribution: distribution
          }
        })
        
        setAssessments(processedAssessments)
      }
    } catch (error) {
      console.error('Error fetching assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter assessments by assessment name
  const filteredAssessments = assessmentFilter === 'all' 
    ? assessments 
    : assessments.filter(assessment => assessment.assessmentName === assessmentFilter)

  // Calculate overall stats
  const totalStudents = new Set(
    filteredAssessments.flatMap(a => a.students.map(s => s.studentId))
  ).size
  
  const allScores = filteredAssessments.flatMap(a => a.students.map(s => s.score))
  const overallAverage = allScores.length > 0 
    ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length) 
    : 0
  
  const totalGreen = filteredAssessments.reduce((sum, a) => sum + a.performanceDistribution.green, 0)
  const totalYellow = filteredAssessments.reduce((sum, a) => sum + a.performanceDistribution.yellow, 0)
  const totalRed = filteredAssessments.reduce((sum, a) => sum + a.performanceDistribution.red, 0)
  const totalGrey = filteredAssessments.reduce((sum, a) => sum + a.performanceDistribution.grey, 0)

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10B981' // Green
    if (score >= 70) return '#F59E0B' // Yellow
    if (score >= 60) return '#EF4444' // Red
    return '#6B7280' // Grey
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
          <p style={{ color: '#6B7280' }}>Loading dashboard...</p>
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
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
            </div>
            Dashboard Overview
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1.125rem' }}>
            All assessments at a glance - {teacherName}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem' }}>
        
        {/* Assessment Filter - MOVED TO TOP */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontWeight: '600', color: '#374151', fontSize: '1rem' }}>📝 View Assessment:</span>
          <select
            value={assessmentFilter}
            onChange={(e) => setAssessmentFilter(e.target.value)}
            style={{
              flex: 1,
              maxWidth: '500px',
              padding: '0.75rem 1rem',
              border: '2px solid #3B82F6',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              backgroundColor: 'white'
            }}
          >
            <option value="all">📊 All Assessments</option>
            {assessments.map((assessment) => (
              <option key={assessment.id} value={assessment.assessmentName}>
                {assessment.assessmentName} - {assessment.subject} ({new Date(assessment.assessmentDate).toLocaleDateString()})
              </option>
            ))}
          </select>
          <button
            onClick={fetchAllAssessments}
            style={{
              padding: '0.75rem 1.25rem',
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
        </div>
        
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <BookOpen style={{ width: '1.5rem', height: '1.5rem', color: '#3B82F6' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>Total Assessments</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
              {filteredAssessments.length}
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
              <Users style={{ width: '1.5rem', height: '1.5rem', color: '#8B5CF6' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>Unique Students</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
              {totalStudents}
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
              <TrendingUp style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>Overall Average</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: getScoreColor(overallAverage) }}>
              {overallAverage}%
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>
              Performance Distribution
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10B981' }}>{totalGreen}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>🟢</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F59E0B' }}>{totalYellow}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>🟡</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EF4444' }}>{totalRed}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>🔴</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#6B7280' }}>{totalGrey}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>⚫</div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessments Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
            All Assessments ({filteredAssessments.length})
          </h2>

          {filteredAssessments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
              <BookOpen style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#D1D5DB' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>No assessments uploaded yet</p>
              <p style={{ fontSize: '0.875rem' }}>Upload your first assessment to see it here!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    backgroundColor: '#FAFAFA',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                    e.currentTarget.style.borderColor = '#3B82F6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FAFAFA'
                    e.currentTarget.style.borderColor = '#E5E7EB'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                        📝 {assessment.assessmentName}
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        {assessment.subject} • {assessment.grade}, Section {assessment.className} • {new Date(assessment.assessmentDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: getScoreColor(assessment.averageScore),
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.75rem',
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      textAlign: 'center',
                      minWidth: '4rem'
                    }}>
                      {assessment.averageScore}%
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                      <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>{assessment.totalStudents} students</span>
                    </div>

                    <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                      {/* Performance bars */}
                      <div style={{
                        flex: assessment.performanceDistribution.green,
                        backgroundColor: '#10B981',
                        height: '2rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        minWidth: assessment.performanceDistribution.green > 0 ? '2rem' : '0'
                      }}>
                        {assessment.performanceDistribution.green > 0 ? assessment.performanceDistribution.green : ''}
                      </div>
                      
                      <div style={{
                        flex: assessment.performanceDistribution.yellow,
                        backgroundColor: '#F59E0B',
                        height: '2rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        minWidth: assessment.performanceDistribution.yellow > 0 ? '2rem' : '0'
                      }}>
                        {assessment.performanceDistribution.yellow > 0 ? assessment.performanceDistribution.yellow : ''}
                      </div>
                      
                      <div style={{
                        flex: assessment.performanceDistribution.red,
                        backgroundColor: '#EF4444',
                        height: '2rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        minWidth: assessment.performanceDistribution.red > 0 ? '2rem' : '0'
                      }}>
                        {assessment.performanceDistribution.red > 0 ? assessment.performanceDistribution.red : ''}
                      </div>
                      
                      <div style={{
                        flex: assessment.performanceDistribution.grey,
                        backgroundColor: '#6B7280',
                        height: '2rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        minWidth: assessment.performanceDistribution.grey > 0 ? '2rem' : '0'
                      }}>
                        {assessment.performanceDistribution.grey > 0 ? assessment.performanceDistribution.grey : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend - MOVED TO BOTTOM */}
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FCD34D',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
            <div style={{ fontWeight: '600', color: '#92400E', fontSize: '1rem' }}>📊 Color Code Legend:</div>
            {assessmentFilter !== 'all' && (
              <div style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: '600', backgroundColor: '#FEF3C7', padding: '0.25rem 0.75rem', borderRadius: '0.5rem' }}>
                Viewing: {assessmentFilter}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#78350F' }}>
            <div><span style={{ color: '#10B981', fontWeight: '700', fontSize: '1rem' }}>🟢 Green:</span> 85-100% (Excellent)</div>
            <div><span style={{ color: '#F59E0B', fontWeight: '700', fontSize: '1rem' }}>🟡 Yellow:</span> 70-84% (Good)</div>
            <div><span style={{ color: '#EF4444', fontWeight: '700', fontSize: '1rem' }}>🔴 Red:</span> 60-69% (Needs Improvement)</div>
            <div><span style={{ color: '#6B7280', fontWeight: '700', fontSize: '1rem' }}>⚫ Grey:</span> 0-59% (Needs Help)</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
