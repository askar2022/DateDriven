'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  Users, 
  GraduationCap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  School,
  Award,
  AlertTriangle,
  BookOpen,
  Calendar,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'

interface TeacherPerformance {
  teacherName: string
  grade: string
  className: string
  totalUploads: number
  totalStudents: number
  averageScore: number
  trend: 'improving' | 'stable' | 'declining'
  lastUpload: string
  subjects: string[]
}

interface GradeComparison {
  grade: string
  totalStudents: number
  averageScore: number
  teacherCount: number
  distribution: {
    green: number
    yellow: number
    red: number
    grey: number
  }
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState<TeacherPerformance[]>([])
  const [grades, setGrades] = useState<GradeComparison[]>([])
  const [allAssessments, setAllAssessments] = useState<any[]>([])
  const [schoolStats, setSchoolStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalAssessments: 0,
    schoolAverage: 0,
    distribution: { green: 0, yellow: 0, red: 0, grey: 0 }
  })
  const [viewMode, setViewMode] = useState<'overview' | 'teachers' | 'assessments' | 'grades'>('overview')

  const mockSession = { 
    user: { 
      name: 'Admin', 
      email: 'admin@school.edu',
      role: 'LEADER' 
    } 
  }
  const currentSession = session || mockSession

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('role', 'LEADER')
      params.append('user', 'Admin')
      
      const response = await fetch(`/api/upload/weekly-scores?${params.toString()}&_t=${Date.now()}`)
      const data = await response.json()
      
      if (data.uploads) {
        processAdminData(data.uploads)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processAdminData = (uploads: any[]) => {
    // 1. SCHOOL-WIDE OVERVIEW
    const teacherMap = new Map<string, any>()
    const gradeMap = new Map<string, any>()
    const studentScores = new Map<string, number[]>()
    
    uploads.forEach(upload => {
      const teacherKey = upload.teacherName
      const gradeKey = upload.grade
      
      // Teacher data
      if (!teacherMap.has(teacherKey)) {
        teacherMap.set(teacherKey, {
          teacherName: upload.teacherName,
          grade: upload.grade,
          className: upload.className,
          uploads: [],
          students: new Set(),
          scores: [],
          subjects: new Set()
        })
      }
      const teacher = teacherMap.get(teacherKey)
      teacher.uploads.push(upload)
      teacher.subjects.add(upload.subject)
      
      // Grade data
      if (!gradeMap.has(gradeKey)) {
        gradeMap.set(gradeKey, {
          grade: upload.grade,
          students: new Set(),
          scores: [],
          teachers: new Set()
        })
      }
      const grade = gradeMap.get(gradeKey)
      grade.teachers.add(upload.teacherName)
      
      // Student scores
      upload.students?.forEach((student: any) => {
        teacher.students.add(student.studentId)
        teacher.scores.push(student.score)
        grade.students.add(student.studentId)
        grade.scores.push(student.score)
        
        if (!studentScores.has(student.studentId)) {
          studentScores.set(student.studentId, [])
        }
        studentScores.get(student.studentId)!.push(student.score)
      })
    })

    // 2. TEACHER PERFORMANCE
    const teacherPerformance: TeacherPerformance[] = Array.from(teacherMap.values()).map(teacher => {
      const avgScore = teacher.scores.length > 0
        ? Math.round(teacher.scores.reduce((sum: number, s: number) => sum + s, 0) / teacher.scores.length)
        : 0
      
      return {
        teacherName: teacher.teacherName,
        grade: teacher.grade,
        className: teacher.className,
        totalUploads: teacher.uploads.length,
        totalStudents: teacher.students.size,
        averageScore: avgScore,
        trend: 'stable' as const,
        lastUpload: teacher.uploads[teacher.uploads.length - 1]?.uploadTime || '',
        subjects: Array.from(teacher.subjects) as string[]
      }
    }).sort((a, b) => b.averageScore - a.averageScore)

    // 3. GRADE COMPARISON
    const gradeComparison: GradeComparison[] = Array.from(gradeMap.values()).map(grade => {
      const avgScore = grade.scores.length > 0
        ? Math.round(grade.scores.reduce((sum: number, s: number) => sum + s, 0) / grade.scores.length)
        : 0
      
      const distribution = {
        green: grade.scores.filter((s: number) => s >= 85).length,
        yellow: grade.scores.filter((s: number) => s >= 70 && s < 85).length,
        red: grade.scores.filter((s: number) => s >= 60 && s < 70).length,
        grey: grade.scores.filter((s: number) => s < 60).length
      }
      
      return {
        grade: grade.grade,
        totalStudents: grade.students.size,
        averageScore: avgScore,
        teacherCount: grade.teachers.size,
        distribution
      }
    }).sort((a, b) => {
      const gradeOrder = ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']
      return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade)
    })

    // 4. SCHOOL STATS
    const totalStudents = studentScores.size
    const allScores = Array.from(studentScores.values()).map(scores => 
      scores.reduce((sum, s) => sum + s, 0) / scores.length
    )
    const schoolAverage = allScores.length > 0
      ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
      : 0
    
    const distribution = {
      green: allScores.filter(s => s >= 85).length,
      yellow: allScores.filter(s => s >= 70 && s < 85).length,
      red: allScores.filter(s => s >= 60 && s < 70).length,
      grey: allScores.filter(s => s < 60).length
    }

    setTeachers(teacherPerformance)
    setGrades(gradeComparison)
    setAllAssessments(uploads)
    setSchoolStats({
      totalTeachers: teacherMap.size,
      totalStudents,
      totalAssessments: uploads.length,
      schoolAverage,
      distribution
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10B981'
    if (score >= 70) return '#F59E0B'
    if (score >= 60) return '#EF4444'
    return '#6B7280'
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
          <p style={{ color: '#6B7280' }}>Loading admin dashboard...</p>
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
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <School style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
            </div>
            School Administration
          </h1>
          <p style={{ color: '#6B7280', fontSize: '1.125rem' }}>
            Complete overview of school performance and teacher analytics
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem' }}>
        
        {/* View Mode Tabs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '0.5rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {[
            { id: 'overview', icon: School, label: 'School Overview' },
            { id: 'teachers', icon: Users, label: 'Teacher Performance' },
            { id: 'assessments', icon: BookOpen, label: 'All Assessments' },
            { id: 'grades', icon: GraduationCap, label: 'Grade Comparison' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: viewMode === tab.id ? '#3B82F6' : 'transparent',
                color: viewMode === tab.id ? 'white' : '#6B7280',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <tab.icon style={{ width: '1rem', height: '1rem' }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. SCHOOL-WIDE OVERVIEW */}
        {viewMode === 'overview' && (
          <>
            {/* Header with Print Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                School Overview Report
              </h2>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Download style={{ width: '1rem', height: '1rem' }} />
                🖨️ Print Overview Report
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
                  <Users style={{ width: '1.5rem', height: '1.5rem', color: '#3B82F6' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>Total Teachers</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827' }}>
                  {schoolStats.totalTeachers}
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
                  <GraduationCap style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>Total Students</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827' }}>
                  {schoolStats.totalStudents}
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
                  <BarChart3 style={{ width: '1.5rem', height: '1.5rem', color: '#8B5CF6' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>School Average</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: getScoreColor(schoolStats.schoolAverage) }}>
                  {schoolStats.schoolAverage}%
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
                  <BookOpen style={{ width: '1.5rem', height: '1.5rem', color: '#F59E0B' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280' }}>Total Assessments</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827' }}>
                  {schoolStats.totalAssessments}
                </div>
              </div>
            </div>

            {/* Performance Distribution */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                School-Wide Performance Distribution
              </h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '1rem', backgroundColor: '#DCFCE7', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>{schoolStats.distribution.green}</div>
                  <div style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '500' }}>🟢 Excellent (85-100%)</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '1rem', backgroundColor: '#FEF3C7', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>{schoolStats.distribution.yellow}</div>
                  <div style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: '500' }}>🟡 Good (70-84%)</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '1rem', backgroundColor: '#FEE2E2', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>{schoolStats.distribution.red}</div>
                  <div style={{ fontSize: '0.875rem', color: '#991B1B', fontWeight: '500' }}>🔴 Needs Improvement (60-69%)</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '1rem', backgroundColor: '#F3F4F6', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#6B7280' }}>{schoolStats.distribution.grey}</div>
                  <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>⚫ Needs Help (0-59%)</div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Top 3 Teachers */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Award style={{ width: '1.25rem', height: '1.25rem', color: '#F59E0B' }} />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Top 3 Teachers</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {teachers.slice(0, 3).map((teacher, idx) => (
                    <div key={idx} style={{
                      padding: '0.75rem',
                      backgroundColor: '#FFFBEB',
                      borderRadius: '0.5rem',
                      border: '1px solid #FCD34D'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{teacher.teacherName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{teacher.grade}, Section {teacher.className}</div>
                        </div>
                        <div style={{
                          backgroundColor: getScoreColor(teacher.averageScore),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '700'
                        }}>
                          {teacher.averageScore}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 3 Grades */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Top Performing Grades</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[...grades].sort((a, b) => b.averageScore - a.averageScore).slice(0, 3).map((grade, idx) => (
                    <div key={idx} style={{
                      padding: '0.75rem',
                      backgroundColor: '#F0FDF4',
                      borderRadius: '0.5rem',
                      border: '1px solid #BBF7D0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{grade.grade}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{grade.totalStudents} students, {grade.teacherCount} teachers</div>
                        </div>
                        <div style={{
                          backgroundColor: getScoreColor(grade.averageScore),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '700'
                        }}>
                          {grade.averageScore}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 2. TEACHER PERFORMANCE VIEW */}
        {viewMode === 'teachers' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                Teacher Performance Rankings
              </h2>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Download style={{ width: '1rem', height: '1rem' }} />
                Print Report
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {teachers.map((teacher, idx) => (
                <div key={idx} style={{
                  padding: '1.25rem',
                  backgroundColor: '#FAFAFA',
                  borderRadius: '0.75rem',
                  border: '1px solid #E5E7EB'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{
                          width: '1.5rem',
                          height: '1.5rem',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          {idx + 1}
                        </span>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                          {teacher.teacherName}
                        </h3>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '2rem' }}>
                        {teacher.grade}, Section {teacher.className} • {teacher.subjects.join(', ')}
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: getScoreColor(teacher.averageScore),
                      color: 'white',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '0.75rem',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      minWidth: '5rem',
                      textAlign: 'center'
                    }}>
                      {teacher.averageScore}%
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#6B7280', marginLeft: '2rem' }}>
                    <div>📊 {teacher.totalUploads} uploads</div>
                    <div>👥 {teacher.totalStudents} students</div>
                    <div>📅 Last: {new Date(teacher.lastUpload).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. ALL ASSESSMENTS VIEW */}
        {viewMode === 'assessments' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                All Assessments Across School ({allAssessments.length})
              </h2>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Download style={{ width: '1rem', height: '1rem' }} />
                Print Assessment Report
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {allAssessments.map((assessment, idx) => (
                <div key={idx} style={{
                  padding: '1.25rem',
                  backgroundColor: '#FAFAFA',
                  borderRadius: '0.75rem',
                  border: '1px solid #E5E7EB'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                        📝 {assessment.assessmentName || `Assessment ${assessment.weekNumber}`}
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        {assessment.teacherName} • {assessment.grade}, Section {assessment.className} • {assessment.subject}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                        📅 {new Date(assessment.assessmentDate || assessment.uploadTime).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: getScoreColor(assessment.averageScore),
                      color: 'white',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '0.75rem',
                      fontSize: '1.5rem',
                      fontWeight: '700'
                    }}>
                      {Math.round(assessment.averageScore)}%
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>👥 {assessment.totalStudents} students</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. GRADE COMPARISON VIEW */}
        {viewMode === 'grades' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                Grade Level Performance Comparison
              </h2>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Download style={{ width: '1rem', height: '1rem' }} />
                Print Comparison
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {grades.map((grade, idx) => (
                <div key={idx} style={{
                  padding: '1.5rem',
                  backgroundColor: '#FAFAFA',
                  borderRadius: '0.75rem',
                  border: '2px solid #E5E7EB'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                        {grade.grade}
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        {grade.totalStudents} students • {grade.teacherCount} teachers
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: getScoreColor(grade.averageScore),
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.75rem',
                      fontSize: '2rem',
                      fontWeight: '700'
                    }}>
                      {grade.averageScore}%
                    </div>
                  </div>

                  {/* Performance Distribution Bar */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', marginBottom: '0.5rem' }}>
                      Performance Distribution:
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', height: '2.5rem' }}>
                      {grade.distribution.green > 0 && (
                        <div style={{
                          flex: grade.distribution.green,
                          backgroundColor: '#10B981',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {grade.distribution.green}
                        </div>
                      )}
                      {grade.distribution.yellow > 0 && (
                        <div style={{
                          flex: grade.distribution.yellow,
                          backgroundColor: '#F59E0B',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {grade.distribution.yellow}
                        </div>
                      )}
                      {grade.distribution.red > 0 && (
                        <div style={{
                          flex: grade.distribution.red,
                          backgroundColor: '#EF4444',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {grade.distribution.red}
                        </div>
                      )}
                      {grade.distribution.grey > 0 && (
                        <div style={{
                          flex: grade.distribution.grey,
                          backgroundColor: '#6B7280',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {grade.distribution.grey}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6B7280' }}>
                    <div>🟢 {grade.distribution.green} Excellent</div>
                    <div>🟡 {grade.distribution.yellow} Good</div>
                    <div>🔴 {grade.distribution.red} Needs Improvement</div>
                    <div>⚫ {grade.distribution.grey} Needs Help</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media print {
          button {
            display: none !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  )
}
