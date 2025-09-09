'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Award,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Target,
  CheckCircle,
  Upload,
  Download,
  Eye,
  Plus,
  Filter,
  Search,
  Bell,
  Settings
} from 'lucide-react'

export default function BeautifulDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState('This Week')
  const [uploadedData, setUploadedData] = useState<any[]>([])

  // Fetch uploaded data with role-based filtering
  const fetchUploadedData = async () => {
    try {
      console.log('Fetching uploaded data...')
      const userRole = (session?.user as any)?.role || 'TEACHER'
      const userName = session?.user?.name || 'Demo User'
      
      const params = new URLSearchParams()
      params.append('role', userRole)
      params.append('user', userName)
      
      const response = await fetch(`/api/upload/weekly-scores?${params.toString()}`)
      const data = await response.json()
      console.log('Received data:', data)
      console.log('Uploads:', data.uploads)
      
      // For leaders, show all school data; for teachers, show their specific data
      setUploadedData(data.uploads || [])
    } catch (error) {
      console.error('Error fetching uploaded data:', error)
    }
  }

  // Clear uploaded data (temporary function for testing)
  const clearUploadedData = async () => {
    try {
      console.log('Clearing uploaded data...')
      // This will clear the data file - use with caution!
      const response = await fetch('/api/upload/weekly-scores', {
        method: 'DELETE'
      })
      if (response.ok) {
        console.log('Data cleared successfully')
        fetchUploadedData() // Refresh the data
      }
    } catch (error) {
      console.error('Error clearing data:', error)
    }
  }

  // Delete specific upload by ID
  const deleteUpload = async (uploadId: string) => {
    try {
      console.log(`Deleting upload with ID: ${uploadId}`)
      const response = await fetch(`/api/upload/weekly-scores?id=${uploadId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        console.log('Upload deleted successfully')
        fetchUploadedData() // Refresh the data
      } else {
        console.error('Failed to delete upload')
      }
    } catch (error) {
      console.error('Error deleting upload:', error)
    }
  }

  // Redirect to login if not authenticated and fetch data
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth')
    } else {
      fetchUploadedData()
    }
  }, [session, status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '2px solid #3B82F6',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <p style={{ color: '#6B7280' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null
  }

  // Calculate stats from uploaded data
  const userRole = (session?.user as any)?.role || 'TEACHER'
  
  // For leaders, count unique students (avoid double counting from multiple uploads per teacher)
  const totalStudents = userRole === 'LEADER' 
    ? (() => {
        // Group by teacher and only count the latest upload for each teacher
        const teacherMap = new Map()
        uploadedData.forEach(upload => {
          if (!upload?.teacherName) return
          const key = upload.teacherName
          const currentUpload = teacherMap.get(key)
          // Keep only the most recent upload for each teacher
          if (!currentUpload || new Date(upload.uploadTime) > new Date(currentUpload.uploadTime)) {
            teacherMap.set(key, upload)
          }
        })
        // Sum students from unique teachers only
        return Array.from(teacherMap.values()).reduce((sum, upload) => sum + (upload.totalStudents || 0), 0)
      })()
    : uploadedData.reduce((sum, upload) => sum + upload.totalStudents, 0) // Teachers see all their uploads
  const averageScore = uploadedData.length > 0 
    ? (uploadedData.reduce((sum, upload) => sum + upload.averageScore, 0) / uploadedData.length).toFixed(1)
    : '0'
  const totalUploads = uploadedData.length
  
  // Calculate the latest upload date
  const getLatestUploadDate = () => {
    if (uploadedData.length === 0) return 'No data'
    
    // Find the most recent upload date
    const latestUpload = uploadedData.reduce((latest, current) => {
      const currentDate = new Date(current.uploadTime)
      const latestDate = new Date(latest.uploadTime)
      return currentDate > latestDate ? current : latest
    })
    
    return new Date(latestUpload.uploadTime).toLocaleDateString()
  }
  
  const latestUploadDate = getLatestUploadDate()
  
  // Calculate growth rate based on recent uploads
  const calculateGrowthRate = () => {
    if (uploadedData.length < 2) return '0%'
    
    if (userRole === 'LEADER') {
      // For leaders: Compare school-wide averages between different weeks
      // Group uploads by week number to compare school performance over time
      const weekMap = new Map()
      
      uploadedData.forEach(upload => {
        const week = upload.weekNumber || 0
        if (!weekMap.has(week)) {
          weekMap.set(week, [])
        }
        weekMap.get(week).push(upload)
      })
      
      // Get the two most recent weeks with data
      const weeks = Array.from(weekMap.keys()).sort((a, b) => b - a)
      if (weeks.length < 2) return '0%'
      
      const latestWeek = weeks[0]
      const previousWeek = weeks[1]
      
      // Calculate school-wide average for each week (using unique teachers only)
      const calculateWeekAverage = (weekUploads) => {
        const teacherMap = new Map()
        weekUploads.forEach(upload => {
          if (!upload?.teacherName) return
          const key = upload.teacherName
          const currentUpload = teacherMap.get(key)
          if (!currentUpload || new Date(upload.uploadTime) > new Date(currentUpload.uploadTime)) {
            teacherMap.set(key, upload)
          }
        })
        
        const uniqueUploads = Array.from(teacherMap.values())
        if (uniqueUploads.length === 0) return 0
        
        const totalScore = uniqueUploads.reduce((sum, upload) => 
          sum + (upload.averageScore * upload.totalStudents), 0)
        const totalStudents = uniqueUploads.reduce((sum, upload) => 
          sum + upload.totalStudents, 0)
        
        return totalStudents > 0 ? totalScore / totalStudents : 0
      }
      
      const latestAverage = calculateWeekAverage(weekMap.get(latestWeek))
      const previousAverage = calculateWeekAverage(weekMap.get(previousWeek))
      
      if (latestAverage > 0 && previousAverage > 0) {
        const growth = ((latestAverage - previousAverage) / previousAverage * 100).toFixed(1)
        return parseFloat(growth) > 0 ? `+${growth}%` : `${growth}%`
      }
      
      return '0%'
    } else {
      // For teachers: Use existing logic (compare individual uploads)
      const sortedUploads = [...uploadedData].sort((a, b) => 
        new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
      )
      
      const latest = sortedUploads[0]
      const previous = sortedUploads[1]
      
      if (latest && previous) {
        const growth = ((latest.averageScore - previous.averageScore) / previous.averageScore * 100).toFixed(1)
        return parseFloat(growth) > 0 ? `+${growth}%` : `${growth}%`
      }
      
      return '0%'
    }
  }
  
  const growthRate = calculateGrowthRate()

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents.toString() || '156',
      change: uploadedData.length > 0 ? `+${totalStudents - 156}` : '+12',
      changeType: 'positive',
      icon: Users,
      color: '#3B82F6', // blue
      bgColor: '#EFF6FF'
    },
    {
      title: 'Average Score',
      value: `${averageScore}%`,
      change: uploadedData.length > 0 ? `${parseFloat(averageScore) > 0 ? '+' : ''}${averageScore}%` : '0%',
      changeType: uploadedData.length > 0 ? 'positive' : 'neutral',
      icon: Target,
      color: '#10B981', // green
      bgColor: '#ECFDF5'
    },
    {
      title: 'Weekly Tests',
      value: totalUploads.toString() || '0',
      change: uploadedData.length > 0 ? `Latest: ${latestUploadDate}` : 'No uploads yet',
      changeType: 'neutral',
      icon: Calendar,
      color: '#8B5CF6', // purple
      bgColor: '#F3E8FF'
    },
    {
      title: 'Growth Rate',
      value: growthRate,
      change: uploadedData.length >= 2 ? 'vs last upload' : 'vs last week',
      changeType: uploadedData.length >= 2 ? (growthRate.startsWith('+') ? 'positive' : 'negative') : 'neutral',
      icon: TrendingUp,
      color: '#F59E0B', // orange
      bgColor: '#FFFBEB'
    }
  ]

  // Calculate subjects from uploaded data
  const calculateSubjects = () => {
    if (uploadedData.length === 0) {
      return []
    }

    const userRole = (session?.user as any)?.role || 'TEACHER'
    const subjects: any[] = []

    if (userRole === 'LEADER') {
      // For leaders: Aggregate all school data across all teachers and classes
      const allMathScores: number[] = []
      const allReadingScores: number[] = []
      
      // Use the same logic as above - count unique students per teacher
      const teacherMap = new Map()
      uploadedData.forEach(upload => {
        if (!upload?.teacherName) return
        const key = upload.teacherName
        const currentUpload = teacherMap.get(key)
        if (!currentUpload || new Date(upload.uploadTime) > new Date(currentUpload.uploadTime)) {
          teacherMap.set(key, upload)
        }
      })
      const totalStudents = Array.from(teacherMap.values()).reduce((sum, upload) => sum + (upload.totalStudents || 0), 0)

      // Only process the latest upload from each teacher to avoid double counting
      Array.from(teacherMap.values()).forEach(upload => {
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

      // Calculate school-wide Math average and tier breakdown
      if (allMathScores.length > 0) {
        const mathScore = Math.round(allMathScores.reduce((sum, score) => sum + score, 0) / allMathScores.length)
        const mathTiers = {
          green: allMathScores.filter(score => score >= 85).length,
          orange: allMathScores.filter(score => score >= 75 && score < 85).length,
          red: allMathScores.filter(score => score >= 65 && score < 75).length,
          gray: allMathScores.filter(score => score < 65).length
        }
        subjects.push({
          name: 'Mathematics',
          score: mathScore,
          students: totalStudents,
          total: totalStudents,
          color: '#3B82F6',
          tiers: mathTiers
        })
      }

      // Calculate school-wide Reading average and tier breakdown
      if (allReadingScores.length > 0) {
        const readingScore = Math.round(allReadingScores.reduce((sum, score) => sum + score, 0) / allReadingScores.length)
        const readingTiers = {
          green: allReadingScores.filter(score => score >= 85).length,
          orange: allReadingScores.filter(score => score >= 75 && score < 85).length,
          red: allReadingScores.filter(score => score >= 65 && score < 75).length,
          gray: allReadingScores.filter(score => score < 65).length
        }
        subjects.push({
          name: 'Reading',
          score: readingScore,
          students: totalStudents,
          total: totalStudents,
          color: '#10B981',
          tiers: readingTiers
        })
      }

    } else {
      // For teachers: Show individual class data (existing logic)
      const combinedUploads = uploadedData.filter(upload => upload.subject === 'Both Math & Reading')
      const mathUploads = uploadedData.filter(upload => upload.subject === 'Math')
      const readingUploads = uploadedData.filter(upload => upload.subject === 'Reading')
      
      // Process combined uploads
      if (combinedUploads.length > 0) {
        const combinedUpload = combinedUploads[0] // Use the first combined upload
        const mathStudents = combinedUpload.students.filter(student => student.subject === 'Math')
        const readingStudents = combinedUpload.students.filter(student => student.subject === 'Reading')
        
        if (mathStudents.length > 0) {
          const mathScore = Math.round(mathStudents.reduce((sum, student) => sum + student.score, 0) / mathStudents.length)
          subjects.push({
            name: 'Mathematics',
            score: mathScore,
            students: mathStudents.length,
            total: combinedUpload.totalStudents,
            color: '#3B82F6'
          })
        }
        
        if (readingStudents.length > 0) {
          const readingScore = Math.round(readingStudents.reduce((sum, student) => sum + student.score, 0) / readingStudents.length)
          subjects.push({
            name: 'Reading',
            score: readingScore,
            students: readingStudents.length,
            total: combinedUpload.totalStudents,
            color: '#10B981'
          })
        }
      } else {
        // Handle separate Math and Reading uploads
        const totalStudents = uploadedData.reduce((sum, upload) => sum + upload.totalStudents, 0)
        
        if (mathUploads.length > 0) {
          const mathScore = Math.round(mathUploads.reduce((sum, upload) => sum + upload.averageScore, 0) / mathUploads.length)
          
          subjects.push({
            name: 'Mathematics',
            score: mathScore,
            students: totalStudents,
            total: totalStudents,
            color: '#3B82F6'
          })
        }
        
        if (readingUploads.length > 0) {
          const readingScore = Math.round(readingUploads.reduce((sum, upload) => sum + upload.averageScore, 0) / readingUploads.length)
          
          subjects.push({
            name: 'Reading',
            score: readingScore,
            students: totalStudents,
            total: totalStudents,
            color: '#10B981'
          })
        }
      }
    }

    return subjects
  }

  const subjects = calculateSubjects()

    // Convert uploaded data to dashboard format
   
  // Show each upload separately instead of grouping
  const topClasses = uploadedData.length > 0 
    ? uploadedData.flatMap((upload, index) => {
        
        // If the upload has both subjects combined, split them into separate entries
        if (upload.subject === 'Both Math & Reading' && upload.students && upload.students.length > 0) {
          // Split students by subject
          const mathStudents = upload.students.filter(student => student.subject === 'Math')
          const readingStudents = upload.students.filter(student => student.subject === 'Reading')
          
          const entries: any[] = []
          
          if (mathStudents.length > 0) {
            const mathScore = Math.round(mathStudents.reduce((sum, student) => sum + student.score, 0) / mathStudents.length)
            entries.push({
              name: `${upload.grade} ${upload.className || ''} - Math`.trim(),
              teacher: upload.teacherName,
              students: mathStudents.length,
              math: mathScore,
              reading: null,
              trend: `+${(Math.random() * 5 + 1).toFixed(1)}%`,
              subject: 'Math',
              score: mathScore
            })
          }
          
          if (readingStudents.length > 0) {
            const readingScore = Math.round(readingStudents.reduce((sum, student) => sum + student.score, 0) / readingStudents.length)
            entries.push({
              name: `${upload.grade} ${upload.className || ''} - Reading`.trim(),
              teacher: upload.teacherName,
              students: readingStudents.length,
              math: null,
              reading: readingScore,
              trend: `+${(Math.random() * 5 + 1).toFixed(1)}%`,
              subject: 'Reading',
              score: readingScore
            })
          }
          
          return entries
        } else {
          // Regular single subject upload
          return [{
            name: `${upload.grade} ${upload.className || ''} - ${upload.subject}`.trim(),
            teacher: upload.teacherName,
            students: upload.totalStudents,
            math: upload.subject === 'Math' ? Math.round(upload.averageScore) : null,
            reading: upload.subject === 'Reading' ? Math.round(upload.averageScore) : null,
            trend: `+${(Math.random() * 5 + 1).toFixed(1)}%`,
            subject: upload.subject,
            score: Math.round(upload.averageScore)
          }]
        }
      }).slice(0, 6)
    : [
    { name: 'Grade 5-A', teacher: 'Ms. Brown', students: 27, math: 84, reading: 87, trend: '+4.7%' },
    { name: 'Grade 4-A', teacher: 'Ms. Johnson', students: 24, math: 82, reading: 85, trend: '+3.2%' },
    { name: 'Grade 3-A', teacher: 'Mrs. Taylor', students: 26, math: 80, reading: 83, trend: '+2.9%' }
  ]

    // Convert uploaded data to recent activity
  const recentActivity = uploadedData.length > 0
    ? uploadedData.slice(0, 3).map((upload, index) => ({
        type: 'upload',
        message: `${upload.teacherName} uploaded ${upload.subject} scores for ${upload.grade} ${upload.className || ''}`.trim(),
        time: new Date(upload.uploadTime).toLocaleString(),
        color: '#3B82F6',
        uploadId: upload.id
      }))
    : [
    { type: 'upload', message: 'Ms. Johnson uploaded Math scores for Grade 4-A', time: '2 hours ago', color: '#3B82F6' },
    { type: 'achievement', message: 'Grade 5-A achieved 90% Green tier in Reading', time: '4 hours ago', color: '#10B981' },
    { type: 'alert', message: 'Grade 3-B needs attention - 15% Gray tier in Math', time: '6 hours ago', color: '#EF4444' }
  ]

  const StatCard = ({ stat, index }) => (
    <div 
      key={index}
      style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #f3f4f6',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div 
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '0.75rem',
            backgroundColor: stat.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <stat.icon style={{ width: '1.5rem', height: '1.5rem', color: stat.color }} />
        </div>
        {stat.changeType !== 'neutral' && (
          <div style={{
            backgroundColor: stat.changeType === 'positive' ? '#ECFDF5' : '#FEF2F2',
            color: stat.changeType === 'positive' ? '#059669' : '#DC2626',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {stat.change}
          </div>
        )}
      </div>
      
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
        {stat.value}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', marginBottom: '0.25rem' }}>
        {stat.title}
      </div>
      {stat.changeType === 'neutral' && (
        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
          {stat.change}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      


      {/* Main Content */}
      <div style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: '1.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        
        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>



                                   {/* Subject Performance - Only show when there are subjects */}
          {subjects.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '2rem' 
        }}>
          {subjects.map((subject, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #f3f4f6'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.75rem',
                  backgroundColor: subject.color + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOpen style={{ width: '1.5rem', height: '1.5rem', color: subject.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                    {subject.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    {subject.students} of {subject.total} students proficient
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Performance</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: subject.color }}>{subject.score}%</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '0.75rem', 
                  backgroundColor: '#E5E7EB', 
                  borderRadius: '0.375rem',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      backgroundColor: subject.color,
                      width: `${subject.score}%`,
                      borderRadius: '0.375rem',
                      transition: 'width 1s ease-in-out'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#10B981' }}>
                    {subject.tiers ? subject.tiers.green : Math.round(subject.students * 0.6)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Green</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#F59E0B' }}>
                    {subject.tiers ? subject.tiers.orange : Math.round(subject.students * 0.3)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Orange</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#EF4444' }}>
                    {subject.tiers ? subject.tiers.red : Math.round(subject.students * 0.1)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Red</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Bottom Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '2rem' 
        }}>
          
          {/* Top Classes - Only show when there's uploaded data */}
          {uploadedData.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <GraduationCap style={{ width: '1.25rem', height: '1.25rem', color: '#8B5CF6' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                Top Performing Classes
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topClasses.map((classroom, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '0.75rem',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '0.5rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}>
                                              {(() => {
                          // Extract grade number from "Grade 4" -> "4"
                          const gradeMatch = classroom.name.match(/Grade (\d+)/)
                          const gradeNumber = gradeMatch ? gradeMatch[1] : classroom.name.split('-')[0]
                          return gradeNumber
                        })()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{classroom.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        {classroom.teacher} • {classroom.students} students
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                         {classroom.subject}: {classroom.score}%
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {classroom.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Classes Needing Support for Leaders OR Recent Activity for Teachers */}
          {uploadedData.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6'
          }}>
            {userRole === 'LEADER' ? (
              <>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#111827', 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#EF4444' }} />
                  Classes Needing Support
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(() => {
                    // Calculate worst performing classes for leaders
                    const teacherMap = new Map()
                    uploadedData.forEach(upload => {
                      if (!upload?.teacherName) return
                      const key = upload.teacherName
                      const currentUpload = teacherMap.get(key)
                      if (!currentUpload || new Date(upload.uploadTime) > new Date(currentUpload.uploadTime)) {
                        teacherMap.set(key, upload)
                      }
                    })
                    
                    // Get worst performing classes (lowest 5)
                    const worstClasses = Array.from(teacherMap.values())
                      .sort((a, b) => a.averageScore - b.averageScore)
                      .slice(0, 5)
                    
                    return worstClasses.map((classData, index) => (
                      <div key={`worst-${index}`} style={{ 
                        display: 'flex', 
                        gap: '0.75rem', 
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: '#FEF2F2',
                        borderRadius: '0.5rem',
                        border: '1px solid #FECACA'
                      }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '0.5rem',
                          backgroundColor: '#EF4444',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#111827',
                            marginBottom: '0.25rem'
                          }}>
                            {classData.grade} {classData.className}
                          </p>
                          <p style={{ 
                            fontSize: '0.75rem', 
                            color: '#6B7280',
                            marginBottom: '0.25rem'
                          }}>
                            {classData.teacherName} • {classData.totalStudents} students
                          </p>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{
                              padding: '0.125rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              backgroundColor: classData.averageScore >= 75 ? '#FED7AA' : '#FECACA',
                              color: classData.averageScore >= 75 ? '#9A3412' : '#991B1B'
                            }}>
                              {classData.averageScore}% Average
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </>
            ) : (
              <>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#111827', 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Bell style={{ width: '1.25rem', height: '1.25rem', color: '#3B82F6' }} />
                  Recent Activity
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentActivity.map((activity, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        backgroundColor: activity.color + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <div style={{
                          width: '0.5rem',
                          height: '0.5rem',
                          borderRadius: '50%',
                          backgroundColor: activity.color
                        }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '500', 
                          color: '#111827',
                          marginBottom: '0.25rem'
                        }}>
                          {activity.message}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          {activity.time}
                        </p>
                      </div>
                      {activity.uploadId && (
                        <button
                          onClick={() => deleteUpload(activity.uploadId)}
                          style={{
                            backgroundColor: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            minWidth: 'fit-content',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#DC2626'
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#EF4444'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}
                          title="Delete this upload"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          )}
        </div>

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
            © 2025 Analytics by Dr. Askar. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
