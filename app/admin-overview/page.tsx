'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  GraduationCap,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  Eye,
  FileText,
  School,
  ChevronRight
} from 'lucide-react'

interface TeacherSummary {
  teacherName: string
  grade: string
  className: string
  totalStudents: number
  averageScore: number
  uploadsCount: number
  lastUpload: string
  highPerformers: number
  needsSupport: number
}

interface SchoolOverview {
  totalTeachers: number
  totalStudents: number
  schoolAverage: number
  totalUploads: number
  teacherBreakdown: {
    teacherName: string
    grade: string
    className: string
    assessmentName: string
    students: number
    average: number
    lastUpdate: string
    weekNumber: number
  }[]
  teacherSummaries: TeacherSummary[]
  performanceDistribution: {
    green: number
    orange: number
    red: number
    gray: number
  }
}

interface ClassStudentData {
  teacher: {
    name: string
    grade: string
    className: string
  }
  weeks: any[]
  students: any[]
  totalStudents: number
  summary?: {
    totalStudents: number
    averageScore: number
    highPerformers: number
    needsSupport: number
    byTier: {
      green: number
      orange: number
      red: number
      gray: number
    }
  }
  filters?: {
    teacher: string
    grade: string
    className: string
  }
}

export default function AdminOverviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [overviewData, setOverviewData] = useState<SchoolOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [classData, setClassData] = useState<ClassStudentData | null>(null)
  const [loadingClass, setLoadingClass] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [weekOptions, setWeekOptions] = useState<Array<{weekNumber: number, label: string}>>([])
  const [selectedWeek, setSelectedWeek] = useState<string>('current')

  const userRole = (session?.user as any)?.role

  const fetchOverviewData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch ALL uploads for cumulative grade-level analysis (ignore week filter for this)
      const allWeeksParams = new URLSearchParams()
      allWeeksParams.append('role', 'LEADER')
      allWeeksParams.append('user', 'Admin')
      // Don't add week filter - we want all weeks for grade level performance
      
      const allWeeksResponse = await fetch(`/api/upload/weekly-scores?${allWeeksParams.toString()}`)
      const allWeeksData = await allWeeksResponse.json()
      
      // For teacher summary cards, use selected week data
      const params = new URLSearchParams()
      params.append('role', 'LEADER')
      params.append('user', 'Admin')
      if (selectedWeek !== 'current') {
        params.append('week', selectedWeek)
      }
      
      const response = await fetch(`/api/upload/weekly-scores?${params.toString()}`)
      const data = await response.json()
      
      if (data.uploads && allWeeksData.uploads) {
        // Process school data with both datasets
        try {
          processSchoolData(data.uploads, allWeeksData.uploads)
        } catch (processError) {
          console.error('Failed to process school data:', processError)
          // Set empty data to prevent crashes
          setOverviewData({
            totalTeachers: 0,
            totalStudents: 0,
            schoolAverage: 0,
            totalUploads: 0,
            teacherBreakdown: [],
            teacherSummaries: [],
            performanceDistribution: { green: 0, orange: 0, red: 0, gray: 0 }
          })
        }
      } else {
        // Set empty data if no uploads found
        setOverviewData({
          totalTeachers: 0,
          totalStudents: 0,
          schoolAverage: 0,
          totalUploads: 0,
          teacherBreakdown: [],
          teacherSummaries: [],
          performanceDistribution: { green: 0, orange: 0, red: 0, gray: 0 }
        })
      }
    } catch (error) {
      console.error('Failed to fetch overview data:', error)
      // Set empty data on fetch error
      setOverviewData({
        totalTeachers: 0,
        totalStudents: 0,
        schoolAverage: 0,
        totalUploads: 0,
        teacherBreakdown: [],
        teacherSummaries: [],
        performanceDistribution: { green: 0, orange: 0, red: 0, gray: 0 }
      })
    } finally {
      setLoading(false)
    }
  }, [selectedWeek])

  const processSchoolData = (uploads: any[], allWeeksUploads: any[]) => {
    console.log('=== PROCESS SCHOOL DATA DEBUG ===')
    console.log('uploads parameter:', uploads.length, 'items')
    console.log('allWeeksUploads parameter:', allWeeksUploads.length, 'items')
    console.log('uploads details:', uploads.map(u => ({ teacherName: u.teacherName, grade: u.grade, className: u.className })))
    console.log('allWeeksUploads details:', allWeeksUploads.map(u => ({ teacherName: u.teacherName, grade: u.grade, className: u.className })))
    
    // Group uploads by teacher and keep ONLY the latest week for each teacher
    const teacherMap = new Map()
    
    ;(uploads || []).forEach(upload => {
      if (!upload?.teacherName) return // Skip invalid uploads
      
      const key = upload.teacherName
      const currentUpload = teacherMap.get(key)
      
      // Keep only the most recent upload for each teacher
      if (!currentUpload || new Date(upload.uploadTime) > new Date(currentUpload.lastUpload)) {
        teacherMap.set(key, {
          teacherName: upload.teacherName,
          grade: upload.grade || 'Unknown',
          className: upload.className || 'Unknown',
          uploads: [upload], // Only keep the latest upload
          totalStudents: upload.totalStudents || 0,
          totalScores: [upload.averageScore || 0],
          lastUpload: upload.uploadTime || new Date().toISOString()
        })
      }
    })

    // Process teacher summaries
    const teacherSummaries: TeacherSummary[] = Array.from(teacherMap.values()).map(teacher => {
      const averageScore = teacher.totalScores.length > 0 
        ? teacher.totalScores.reduce((sum, score) => sum + score, 0) / teacher.totalScores.length
        : 0
      
      // Calculate performance distribution from students
      let highPerformers = 0
      let needsSupport = 0
      
      teacher.uploads.forEach(upload => {
        if (upload?.students) {
          // Group by student ID and calculate overall scores
          const studentMap = new Map()
          
          upload.students.forEach(student => {
            if (!student?.studentId) return // Skip invalid students
            
            if (!studentMap.has(student.studentId)) {
              studentMap.set(student.studentId, { scores: [] })
            }
            studentMap.get(student.studentId).scores.push(student.score || 0)
          })
          
          Array.from(studentMap.values()).forEach(student => {
            if (student.scores.length > 0) {
              const avgScore = student.scores.reduce((sum, score) => sum + score, 0) / student.scores.length
              if (avgScore >= 85) highPerformers++
              if (avgScore < 65) needsSupport++
            }
          })
        }
      })

      return {
        teacherName: teacher.teacherName,
        grade: teacher.grade,
        className: teacher.className,
        totalStudents: teacher.totalStudents,
        averageScore: Math.round(averageScore * 10) / 10,
        uploadsCount: teacher.uploads.length,
        lastUpload: teacher.lastUpload,
        highPerformers,
        needsSupport
      }
    })

    // Calculate school-wide metrics - count ALL unique students across all uploads
    const allStudentIds = new Set()
    allWeeksUploads.forEach(upload => {
      if (upload?.students) {
        upload.students.forEach(student => {
          if (student?.studentId) {
            allStudentIds.add(student.studentId)
          }
        })
      }
    })
    const totalStudents = allStudentIds.size
    const schoolAverage = totalStudents > 0 
      ? teacherSummaries.reduce((sum, t) => sum + ((t?.averageScore || 0) * (t?.totalStudents || 0)), 0) / totalStudents
      : 0
    
    // Teacher breakdown - show ALL uploads as separate entries (including assessment name)
    console.log('=== PROCESSING UPLOADS FOR CLASS BREAKDOWN ===')
    console.log('All weeks uploads:', allWeeksUploads.length)
    
    // Show each upload as a separate row, including assessment name
    const teacherBreakdown = (allWeeksUploads || []).map((upload, index) => {
      console.log(`Upload ${index + 1}:`, {
        teacherName: upload?.teacherName,
        grade: upload?.grade,
        className: upload?.className,
        assessmentName: upload?.assessmentName,
        uploadTime: upload?.uploadTime,
        totalStudents: upload?.totalStudents
      })
      
      return {
        teacherName: upload?.teacherName || 'Unknown',
        grade: upload?.grade || 'Unknown',
        className: upload?.className || 'Unknown',
        assessmentName: upload?.assessmentName || `Assessment ${upload?.weekNumber || 'Unknown'}`,
        students: upload?.totalStudents || 0,
        average: upload?.averageScore || 0,
        lastUpdate: upload?.uploadTime ? new Date(upload.uploadTime).toLocaleDateString() : 'Unknown',
        weekNumber: upload?.weekNumber || 0
      }
    }).sort((a, b) => {
      // Sort by teacher name first, then by upload time (newest first)
      if (a.teacherName !== b.teacherName) return a.teacherName.localeCompare(b.teacherName)
      return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
    })
    
    console.log('=== TEACHER BREAKDOWN DEBUG ===')
    console.log('All uploads count:', allWeeksUploads.length)
    console.log('Teacher breakdown entries:', teacherBreakdown.length)
    console.log('Class breakdown:', teacherBreakdown.map(c => `${c.teacherName} - ${c.grade} ${c.className} - ${c.assessmentName} (${c.students} students)`))

    // Performance distribution - calculate from ALL unique students across all uploads
    const studentTierCounts = { green: 0, orange: 0, red: 0, gray: 0 }
    const studentScores: number[] = [] // For debugging
    
    allWeeksUploads.forEach(upload => {
      if (upload?.students) {
        // Group by student ID and calculate overall scores
        const studentMap = new Map()
        
        upload.students.forEach(student => {
          if (!student?.studentId) return
          
          if (!studentMap.has(student.studentId)) {
            studentMap.set(student.studentId, { scores: [] })
          }
          studentMap.get(student.studentId).scores.push(student.score || 0)
        })
        
        Array.from(studentMap.values()).forEach(student => {
          if (student.scores.length > 0) {
            const avgScore = student.scores.reduce((sum, score) => sum + score, 0) / student.scores.length
            studentScores.push(avgScore) // For debugging
            
            if (avgScore >= 85) studentTierCounts.green++
            else if (avgScore >= 75) studentTierCounts.orange++
            else if (avgScore >= 65) studentTierCounts.red++
            else studentTierCounts.gray++
          }
        })
      }
    })
    
    console.log('=== SCHOOL OVERVIEW PERFORMANCE DEBUG ===')
    console.log('All student scores:', studentScores)
    console.log('Student tier counts:', studentTierCounts)
    console.log('Total students counted:', studentTierCounts.green + studentTierCounts.orange + studentTierCounts.red + studentTierCounts.gray)
    
    const { green, orange, red, gray } = studentTierCounts

    setOverviewData({
      totalTeachers: teacherSummaries?.length || 0,
      totalStudents: totalStudents || 0,
      schoolAverage: Math.round((schoolAverage || 0) * 10) / 10,
      totalUploads: uploads?.length || 0,
      teacherBreakdown: teacherBreakdown || [],
      teacherSummaries: teacherSummaries || [],
      performanceDistribution: { 
        green: green || 0, 
        orange: orange || 0, 
        red: red || 0, 
        gray: gray || 0 
      }
    })
  }

  const fetchClassData = async (teacherName: string) => {
    console.log('fetchClassData called for teacher:', teacherName)
    setLoadingClass(true)
    try {
      // Fetch multi-week data for the teacher
      const params = new URLSearchParams()
      params.append('role', 'LEADER')
      params.append('user', 'Admin')
      params.append('teacher', teacherName)
      
      console.log('Making API call to:', `/api/reports/multi-week?${params.toString()}`)
      const response = await fetch(`/api/reports/multi-week?${params.toString()}`)
      console.log('API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Frontend received multi-week data:', data)
        console.log('Students:', data.students)
        console.log('Weeks:', data.weeks)
        setClassData(data)
        setSelectedClass(teacherName)
      } else {
        console.error('Failed to fetch class data:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch class data:', error)
    } finally {
      setLoadingClass(false)
    }
  }

  const fetchWeekOptions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.append('role', 'LEADER')
      params.append('user', 'Admin')

      const response = await fetch(`/api/upload/weekly-scores?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setWeekOptions(data.weekOptions || [])
      }
    } catch (error) {
      console.error('Failed to fetch week options:', error)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchWeekOptions()
      fetchOverviewData()
    }
  }, [selectedWeek, mounted, fetchWeekOptions, fetchOverviewData])

  // Show loading if session is still loading
  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ 
          width: '2rem', 
          height: '2rem', 
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #2563eb',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  // Redirect to auth if not authenticated
  if (status === 'unauthenticated' || !session) {
    router.push('/auth')
    return null
  }

  // Show loading if session is still being processed
  if (!session) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ 
          width: '2rem', 
          height: '2rem', 
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #2563eb',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  // Check if user has admin privileges
  if (userRole !== 'LEADER') {
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
          borderRadius: '0.75rem', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
          border: '1px solid #e5e7eb', 
          padding: '3rem',
          maxWidth: '28rem'
        }}>
          <AlertTriangle style={{ 
            width: '4rem', 
            height: '4rem', 
            color: '#ef4444', 
            margin: '0 auto 1rem' 
          }} />
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '0.5rem' 
          }}>Access Denied</h1>
          <p style={{ color: '#6b7280' }}>Only administrators can access the school overview.</p>
        </div>
      </div>
    )
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || !overviewData || !overviewData.teacherBreakdown) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ 
          width: '2rem', 
          height: '2rem', 
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #2563eb',
          borderRadius: '50%',
          margin: '0 auto 1rem'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  const filteredTeachers = (overviewData?.teacherSummaries || []).filter(teacher => 
    selectedGrade === 'all' || teacher.grade === selectedGrade
  )

  const getTierBadgeStyle = (tierColor: string) => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em'
    }
    
    switch (tierColor) {
      case 'green':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' }
      case 'orange':
        return { ...baseStyle, backgroundColor: '#fed7aa', color: '#9a3412' }
      case 'red':
        return { ...baseStyle, backgroundColor: '#fecaca', color: '#991b1b' }
      case 'gray':
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' }
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' }
    }
  }

  const getScoreTier = (score: number) => {
    if (score >= 85) return 'green'
    if (score >= 75) return 'orange'
    if (score >= 65) return 'red'
    return 'gray'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ 
          width: '2rem', 
          height: '2rem', 
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #2563eb',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading school overview...</p>
      </div>
    )
  }

  if (!overviewData) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <School style={{ 
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
          No teacher data found. Teachers need to upload assessment data first.
        </p>
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
        }}>School Performance Overview</h1>
        <p style={{ color: '#6b7280' }}>
          Administrative dashboard showing all teachers and school-wide performance metrics.
        </p>
      </div>

      {/* School-Wide Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
              }}>{overviewData.totalTeachers}</div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280' 
              }}>Teachers</div>
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
            <GraduationCap style={{ 
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
              }}>{overviewData.totalStudents}</div>
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
            <BarChart3 style={{ 
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
              }}>{overviewData.schoolAverage}%</div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280' 
              }}>School Average</div>
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
            <Calendar style={{ 
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
              }}>{overviewData.totalUploads}</div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280' 
              }}>Total Uploads</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Distribution */}
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
        }}>School-Wide Performance Distribution</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>
              {overviewData.performanceDistribution.green}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#166534' }}>Green Tier (≥85%)</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fed7aa', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9a3412' }}>
              {overviewData.performanceDistribution.orange}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9a3412' }}>Orange Tier (75-84%)</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fecaca', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b' }}>
              {overviewData.performanceDistribution.red}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#991b1b' }}>Red Tier (65-74%)</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>
              {overviewData.performanceDistribution.gray}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#374151' }}>Gray Tier (&lt;65%)</div>
          </div>
        </div>
      </div>

      {/* Grade Level Breakdown */}
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
        }}>Teacher Performance Overview</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  color: '#6b7280', 
                  textTransform: 'uppercase' 
                }}>Teacher</th>
                <th style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  color: '#6b7280', 
                  textTransform: 'uppercase' 
                }}>Grade & Class</th>
                <th style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  color: '#6b7280', 
                  textTransform: 'uppercase' 
                }}>Assessment</th>
                <th style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  color: '#6b7280', 
                  textTransform: 'uppercase' 
                }}>Students</th>
                <th style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  color: '#6b7280', 
                  textTransform: 'uppercase' 
                }}>Last Update</th>
                <th style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  color: '#6b7280', 
                  textTransform: 'uppercase' 
                }}>Current Score</th>
              </tr>
            </thead>
            <tbody>
              {(overviewData.teacherBreakdown || []).map((teacher, index) => (
                <tr key={`${teacher.teacherName}-${teacher.grade}-${teacher.assessmentName}-${index}`} style={{ 
                  borderBottom: index < (overviewData.teacherBreakdown || []).length - 1 ? '1px solid #f3f4f6' : 'none' 
                }}>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: '500' }}>{teacher.teacherName}</td>
                  <td style={{ padding: '1rem 0.75rem', color: '#6b7280' }}>{teacher.grade} {teacher.className}</td>
                  <td style={{ padding: '1rem 0.75rem', color: '#374151', fontSize: '0.875rem' }}>{teacher.assessmentName}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>{teacher.students}</td>
                  <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    {teacher.lastUpdate}
                  </td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: teacher.average >= 85 ? '#dcfce7' : 
                                     teacher.average >= 75 ? '#fed7aa' : 
                                     teacher.average >= 65 ? '#fecaca' : '#f3f4f6',
                      color: teacher.average >= 85 ? '#166534' : 
                             teacher.average >= 75 ? '#9a3412' : 
                             teacher.average >= 65 ? '#991b1b' : '#374151'
                    }}>
                      {teacher.average}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Details */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '1.5rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem' 
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#111827' 
          }}>Teacher Performance Summary</h3>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Week Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'white',
                  minWidth: '10rem'
                }}
              >
                <option value="current">Current Week</option>
                {weekOptions.map((week, index) => (
                  <option key={`week-${week.weekNumber}-${index}`} value={week.weekNumber?.toString() || 'unknown'}>
                    {week.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Selector */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Grades</option>
              {[...new Set((overviewData.teacherBreakdown || []).map(teacher => teacher.grade))].map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1rem' 
        }}>
          {filteredTeachers.map(teacher => (
            <div key={teacher.teacherName} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '1rem',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '0.75rem'
              }}>
                <div>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#111827',
                    marginBottom: '0.25rem'
                  }}>{teacher.teacherName}</h4>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280' 
                  }}>{teacher.grade} {teacher.className}</p>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: teacher.averageScore >= 85 ? '#dcfce7' : 
                                 teacher.averageScore >= 75 ? '#fed7aa' : 
                                 teacher.averageScore >= 65 ? '#fecaca' : '#f3f4f6',
                  color: teacher.averageScore >= 85 ? '#166534' : 
                         teacher.averageScore >= 75 ? '#9a3412' : 
                         teacher.averageScore >= 65 ? '#991b1b' : '#374151'
                }}>
                  {teacher.averageScore}%
                </span>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <div>
                  <span style={{ color: '#6b7280' }}>Students:</span>
                  <span style={{ fontWeight: '500', marginLeft: '0.25rem' }}>
                    {teacher.totalStudents}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Uploads:</span>
                  <span style={{ fontWeight: '500', marginLeft: '0.25rem' }}>
                    {teacher.uploadsCount}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>High Performers:</span>
                  <span style={{ fontWeight: '500', marginLeft: '0.25rem', color: '#059669' }}>
                    {teacher.highPerformers}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Need Support:</span>
                  <span style={{ fontWeight: '500', marginLeft: '0.25rem', color: '#dc2626' }}>
                    {teacher.needsSupport}
                  </span>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.75rem'
              }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280' 
                }}>
                  Last upload: {mounted ? new Date(teacher.lastUpload).toLocaleDateString() : 'Loading...'}
                </div>
                
                <button
                  onClick={() => fetchClassData(teacher.teacherName)}
                  disabled={loadingClass}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#2563eb',
                    backgroundColor: 'transparent',
                    border: '1px solid #2563eb',
                    borderRadius: '0.375rem',
                    cursor: loadingClass ? 'not-allowed' : 'pointer',
                    opacity: loadingClass ? 0.6 : 1
                  }}
                >
                  <Eye style={{ width: '0.875rem', height: '0.875rem' }} />
                  View Class
                  <ChevronRight style={{ width: '0.75rem', height: '0.75rem' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Class View */}
      {selectedClass && classData && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '0.25rem'
              }}>
                Multi-Week Progress: {selectedClass}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {classData.teacher?.grade} {classData.teacher?.className} - Student progress across {classData.weeks?.length || 0} weeks
              </p>
            </div>
            
            <button
              onClick={() => {
                setSelectedClass(null)
                setClassData(null)
              }}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>

          {/* Multi-Week Comparison Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ 
                    padding: '0.75rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    textTransform: 'uppercase',
                    borderRight: '2px solid #e5e7eb',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#f9fafb',
                    zIndex: 10
                  }}>Student</th>
                  {classData.weeks?.map((week: any) => (
                    <th key={week.weekNumber} style={{ 
                      padding: '0.75rem', 
                      textAlign: 'center', 
                      fontSize: '0.75rem', 
                      fontWeight: '600', 
                      color: '#374151', 
                      borderRight: '1px solid #e5e7eb'
                    }}>
                      <div style={{ marginBottom: '0.25rem' }}>{week.weekLabel}</div>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr 1fr', 
                        gap: '0.25rem',
                        fontSize: '0.625rem',
                        color: '#6b7280',
                        textTransform: 'uppercase'
                      }}>
                        <div>Math</div>
                        <div>Read</div>
                        <div>Growth</div>
                        <div>Tier</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classData.students?.map((student: any, index: number) => (
                  <tr key={student.studentId} style={{ 
                    borderBottom: index < classData.students.length - 1 ? '1px solid #f3f4f6' : 'none',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                  }}>
                    <td style={{ 
                      padding: '0.75rem', 
                      fontWeight: '600',
                      borderRight: '2px solid #e5e7eb',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                      zIndex: 10
                    }}>
                      <div>{student.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {student.studentId}</div>
                    </td>
                    {classData.weeks?.map((week: any) => {
                      const weekData = student.weeks?.find((w: any) => w.weekNumber === week.weekNumber);
                      return (
                        <td key={week.weekNumber} style={{ 
                          padding: '0.75rem', 
                          textAlign: 'center',
                          borderRight: '1px solid #e5e7eb'
                        }}>
                          {weekData ? (
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr 1fr 1fr', 
                              gap: '0.25rem',
                              alignItems: 'center'
                            }}>
                              <div style={{ fontWeight: '500' }}>
                                {weekData.mathScore || '-'}
                              </div>
                              <div style={{ fontWeight: '500' }}>
                                {weekData.readingScore || '-'}
                              </div>
                              <div style={{ 
                                fontWeight: '600',
                                color: weekData.growthRate?.startsWith('+') ? '#166534' : 
                                       weekData.growthRate?.startsWith('-') ? '#991b1b' : 
                                       weekData.growthRate === 'N/A' ? '#6b7280' : '#9a3412'
                              }}>
                                {weekData.growthRate || '0'}
                              </div>
                              <div>
                                {weekData.tier ? (
                                  <span style={{
                                    display: 'inline-block',
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: weekData.tierColor
                                  }} title={`${weekData.tier} Tier`}></span>
                                ) : '-'}
                              </div>
                            </div>
                          ) : (
                            <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>No data</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Info */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              📊 Multi-Week Progress Summary
            </div>
            <div>
              Showing {classData.totalStudents} students across {classData.weeks?.length || 0} weeks. 
              Each cell shows: Math Score | Reading Score | Growth Rate | Performance Tier
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>📈 Growth: +5 = 5 points improvement</span>
              <span>📉 Decline: -3 = 3 points decrease</span>
              <span>📊 Base = First week (baseline)</span>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>🟢 Green: ≥85%</span>
              <span>🟠 Orange: 75-84%</span>
              <span>🔴 Red: 65-74%</span>
              <span>⚫ Gray: &lt;65%</span>
            </div>
          </div>
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
