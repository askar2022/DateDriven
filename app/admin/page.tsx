'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  Settings, 
  BarChart3, 
  Upload, 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  TrendingUp,
  GraduationCap,
  Calendar,
  AlertTriangle,
  School,
  RefreshCw
} from 'lucide-react'

interface Teacher {
  id: string
  name: string
  grade: string
  className: string
  email?: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalUploads: 0,
    totalStudents: 0,
    schoolAverage: 0,
    highPerformers: 0,
    needsSupport: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentUploads, setRecentUploads] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  // Authentication and data loading
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchAdminData()
    }
  }, [mounted])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      // Fetch upload data for admin
      const params = new URLSearchParams()
      params.append('role', 'LEADER')
      params.append('user', 'Admin')
      
      const response = await fetch(`/api/upload/weekly-scores?${params.toString()}`)
      const data = await response.json()
      
      if (data.uploads) {
        processAdminData(data.uploads)
      }
      
      // Load teachers from localStorage
      const savedTeachers = localStorage.getItem('teachers')
      if (savedTeachers) {
        const teachersList = JSON.parse(savedTeachers)
        setTeachers(teachersList)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processAdminData = (uploads: any[]) => {
    // Calculate comprehensive stats
    const totalUploads = uploads.length
    
    // Count UNIQUE students across all uploads to avoid double counting
    const uniqueStudents = new Set()
    const studentScores = new Map() // studentId -> { scores: [], teacherName: string }
    
    uploads.forEach(upload => {
      if (upload?.students) {
        upload.students.forEach((student: any) => {
          if (!student?.studentId) return
          
          uniqueStudents.add(student.studentId)
          
          if (!studentScores.has(student.studentId)) {
            studentScores.set(student.studentId, { 
              scores: [], 
              teacherName: upload.teacherName,
              studentName: student.studentName 
            })
          }
          studentScores.get(student.studentId).scores.push(student.score || 0)
        })
      }
    })
    
    const totalStudents = uniqueStudents.size

    // Calculate school average based on unique students
    let totalScoreSum = 0
    let validStudents = 0
    
    studentScores.forEach(student => {
      if (student.scores.length > 0) {
        const avgScore = student.scores.reduce((sum: number, score: number) => sum + score, 0) / student.scores.length
        totalScoreSum += avgScore
        validStudents++
      }
    })
    
    const schoolAverage = validStudents > 0 ? totalScoreSum / validStudents : 0

    // Calculate performance distribution based on unique students
    let highPerformers = 0
    let needsSupport = 0
    
    studentScores.forEach(student => {
      if (student.scores.length > 0) {
        const avgScore = student.scores.reduce((sum: number, score: number) => sum + score, 0) / student.scores.length
        if (avgScore >= 85) highPerformers++
        if (avgScore < 65) needsSupport++
      }
    })

    // Get unique teachers
    const uniqueTeachers = new Set(uploads.map(upload => upload.teacherName)).size

    // Get recent uploads (last 5)
    const recent = uploads
      .sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime())
      .slice(0, 5)

    // Debug logging
    console.log('🔍 Admin Dashboard Debug Info:')
    console.log('- Total uploads:', totalUploads)
    console.log('- Unique students:', totalStudents)
    console.log('- Unique teachers:', uniqueTeachers)
    console.log('- School average:', Math.round(schoolAverage * 10) / 10)
    console.log('- High performers:', highPerformers)
    console.log('- Needs support:', needsSupport)
    console.log('- Student scores map size:', studentScores.size)

    setStats({
      totalTeachers: uniqueTeachers,
      totalUploads,
      totalStudents,
      schoolAverage: Math.round(schoolAverage * 10) / 10,
      highPerformers,
      needsSupport
    })
    
    setRecentUploads(recent)
  }

  const adminCards = [
    {
      title: 'Teacher Management',
      description: 'Add, edit, and manage teachers',
      icon: <Users style={{ width: '2rem', height: '2rem', color: '#3B82F6' }} />,
      href: '/admin/teachers',
      count: stats.totalTeachers,
      color: '#3B82F6'
    },
    {
      title: 'Upload Management',
      description: 'View and manage uploaded files',
      icon: <Upload style={{ width: '2rem', height: '2rem', color: '#10B981' }} />,
      href: '/beautiful-upload',
      count: stats.totalUploads,
      color: '#10B981'
    },
    {
      title: 'Data Analytics',
      description: 'View performance analytics and reports',
      icon: <BarChart3 style={{ width: '2rem', height: '2rem', color: '#F59E0B' }} />,
      href: '/beautiful-dashboard',
      count: stats.totalStudents,
      color: '#F59E0B'
    },
    {
      title: 'Reports',
      description: 'Generate and view detailed reports',
      icon: <FileText style={{ width: '2rem', height: '2rem', color: '#8B5CF6' }} />,
      href: '/beautiful-reports',
      count: 'PDF',
      color: '#8B5CF6'
    }
  ]

  // Show loading if session is still loading
  if (status === 'loading' || !mounted) {
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
        <p style={{ color: '#6b7280' }}>Loading admin dashboard...</p>
      </div>
    )
  }

  // Redirect to auth if not authenticated
  if (status === 'unauthenticated' || !session) {
    router.push('/auth')
    return null
  }

  // Check if user has admin privileges
  const userRole = (session?.user as any)?.role
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
          <p style={{ color: '#6b7280' }}>Only administrators can access the admin dashboard.</p>
        </div>
      </div>
    )
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
        <p style={{ color: '#6b7280' }}>Loading school data...</p>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '2rem' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Settings style={{ width: '2rem', height: '2rem', color: '#3B82F6' }} />
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#111827',
              margin: 0
            }}>
              Admin Dashboard
            </h1>
          </div>
          <p style={{ color: '#6B7280', margin: 0 }}>
            Manage your school's data, teachers, and analytics
          </p>
        </div>

        {/* Stats Overview */}
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
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                  Total Teachers
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {stats.totalTeachers}
                </p>
              </div>
              <Users style={{ width: '2rem', height: '2rem', color: '#3B82F6' }} />
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                  Total Students
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {stats.totalStudents}
                </p>
              </div>
              <GraduationCap style={{ width: '2rem', height: '2rem', color: '#10B981' }} />
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                  School Average
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {stats.schoolAverage}%
                </p>
              </div>
              <BarChart3 style={{ width: '2rem', height: '2rem', color: '#7c3aed' }} />
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                  Total Uploads
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {stats.totalUploads}
                </p>
              </div>
              <Upload style={{ width: '2rem', height: '2rem', color: '#F59E0B' }} />
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                  High Performers
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', margin: 0 }}>
                  {stats.highPerformers}
                </p>
              </div>
              <TrendingUp style={{ width: '2rem', height: '2rem', color: '#059669' }} />
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                  Need Support
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#DC2626', margin: 0 }}>
                  {stats.needsSupport}
                </p>
              </div>
              <AlertTriangle style={{ width: '2rem', height: '2rem', color: '#DC2626' }} />
            </div>
          </div>
        </div>

        {/* Admin Functions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem'
        }}>
          {adminCards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #f3f4f6',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                {card.icon}
                <div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: '#111827',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {card.title}
                  </h3>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#6B7280',
                    margin: 0
                  }}>
                    {card.description}
                  </p>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: '#6B7280' 
                }}>
                  Current: {card.count}
                </span>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: card.color,
                  fontWeight: '500'
                }}>
                  Manage →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Class Performance Analysis */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '2rem', 
          marginTop: '2rem' 
        }}>
          {/* Top Performing Classes */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              marginBottom: '1.5rem' 
            }}>
              <GraduationCap style={{ width: '1.5rem', height: '1.5rem', color: '#10B981' }} />
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#111827',
                margin: 0
              }}>
                Top Performing Classes
              </h2>
            </div>
            
            {recentUploads.length > 0 ? (
              <div style={{ gap: '1rem', display: 'flex', flexDirection: 'column' }}>
                {recentUploads.slice(0, 2).map((upload, index) => {
                  // Calculate performance tiers for this upload
                  const students = upload.students || []
                  const mathStudents = students.filter(s => s.subject === 'Math')
                  const readingStudents = students.filter(s => s.subject === 'Reading')
                  
                  const getTierCounts = (subjectStudents: any[]) => {
                    let green = 0, orange = 0, red = 0
                    subjectStudents.forEach(student => {
                      if (student.score >= 85) green++
                      else if (student.score >= 75) orange++
                      else red++
                    })
                    return { green, orange, red }
                  }
                  
                  const mathTiers = getTierCounts(mathStudents)
                  const readingTiers = getTierCounts(readingStudents)
                  
                  return (
                    <div key={upload.id || index} style={{ 
                      marginBottom: '1rem',
                      padding: '1rem',
                      backgroundColor: '#F0FDF4',
                      borderRadius: '0.75rem',
                      border: '1px solid #BBF7D0'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '0.75rem'
                      }}>
                        <h3 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600', 
                          color: '#111827',
                          margin: 0
                        }}>
                          {upload.grade} {upload.className} - {upload.teacherName}
                        </h3>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: '#10B981',
                          color: 'white'
                        }}>
                          {upload.totalStudents} students
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Math Performance */}
                        <div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                          }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Math</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                              {Math.round((mathTiers.green + mathTiers.orange) / mathStudents.length * 100)}%
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.25rem',
                              fontSize: '0.75rem'
                            }}>
                              <div style={{ 
                                width: '0.75rem', 
                                height: '0.75rem', 
                                borderRadius: '50%', 
                                backgroundColor: '#10B981' 
                              }}></div>
                              <span style={{ color: '#059669' }}>{mathTiers.green} Green</span>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.25rem',
                              fontSize: '0.75rem'
                            }}>
                              <div style={{ 
                                width: '0.75rem', 
                                height: '0.75rem', 
                                borderRadius: '50%', 
                                backgroundColor: '#F59E0B' 
                              }}></div>
                              <span style={{ color: '#D97706' }}>{mathTiers.orange} Orange</span>
                            </div>
                          </div>
                          {mathTiers.orange > 0 && (
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: '#059669',
                              fontStyle: 'italic'
                            }}>
                              Great work! {mathTiers.orange} students close to Green tier
                            </div>
                          )}
                        </div>
                        
                        {/* Reading Performance */}
                        <div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                          }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Reading</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                              {Math.round((readingTiers.green + readingTiers.orange) / readingStudents.length * 100)}%
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.25rem',
                              fontSize: '0.75rem'
                            }}>
                              <div style={{ 
                                width: '0.75rem', 
                                height: '0.75rem', 
                                borderRadius: '50%', 
                                backgroundColor: '#10B981' 
                              }}></div>
                              <span style={{ color: '#059669' }}>{readingTiers.green} Green</span>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.25rem',
                              fontSize: '0.75rem'
                            }}>
                              <div style={{ 
                                width: '0.75rem', 
                                height: '0.75rem', 
                                borderRadius: '50%', 
                                backgroundColor: '#F59E0B' 
                              }}></div>
                              <span style={{ color: '#D97706' }}>{readingTiers.orange} Orange</span>
                            </div>
                          </div>
                          {readingTiers.orange > 0 && (
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: '#059669',
                              fontStyle: 'italic'
                            }}>
                              Great work! {readingTiers.orange} students close to Green tier
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem 0',
                color: '#6b7280'
              }}>
                <GraduationCap style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  margin: '0 auto 0.5rem',
                  color: '#d1d5db'
                }} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>No class data available</p>
              </div>
            )}
          </div>

          {/* Classes Needing Support */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              marginBottom: '1.5rem' 
            }}>
              <AlertTriangle style={{ width: '1.5rem', height: '1.5rem', color: '#EF4444' }} />
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#111827',
                margin: 0
              }}>
                Classes Needing Support
              </h2>
            </div>
            
            {recentUploads.length > 0 ? (
              <div style={{ gap: '1rem', display: 'flex', flexDirection: 'column' }}>
                {recentUploads.slice(0, 1).map((upload, index) => {
                  const students = upload.students || []
                  const mathStudents = students.filter(s => s.subject === 'Math')
                  const readingStudents = students.filter(s => s.subject === 'Reading')
                  
                  const getTierCounts = (subjectStudents: any[]) => {
                    let green = 0, orange = 0, red = 0
                    subjectStudents.forEach(student => {
                      if (student.score >= 85) green++
                      else if (student.score >= 75) orange++
                      else red++
                    })
                    return { green, orange, red }
                  }
                  
                  const mathTiers = getTierCounts(mathStudents)
                  const readingTiers = getTierCounts(readingStudents)
                  const totalRed = mathTiers.red + readingTiers.red
                  
                  return (
                    <div key={upload.id || index} style={{ 
                      marginBottom: '1rem',
                      padding: '1rem',
                      backgroundColor: '#FEF2F2',
                      borderRadius: '0.75rem',
                      border: '1px solid #FECACA'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '0.75rem'
                      }}>
                        <h3 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600', 
                          color: '#111827',
                          margin: 0
                        }}>
                          {upload.grade} {upload.className} - {upload.teacherName}
                        </h3>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: '#EF4444',
                          color: 'white'
                        }}>
                          {upload.totalStudents} students
                        </span>
                      </div>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: '#DC2626',
                          fontWeight: '500',
                          marginBottom: '0.5rem'
                        }}>
                          Focus Areas:
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem',
                            fontSize: '0.75rem'
                          }}>
                            <div style={{ 
                              width: '0.75rem', 
                              height: '0.75rem', 
                              borderRadius: '50%', 
                              backgroundColor: '#EF4444' 
                            }}></div>
                            <span style={{ color: '#DC2626' }}>{mathTiers.red} Math Red</span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem',
                            fontSize: '0.75rem'
                          }}>
                            <div style={{ 
                              width: '0.75rem', 
                              height: '0.75rem', 
                              borderRadius: '50%', 
                              backgroundColor: '#EF4444' 
                            }}></div>
                            <span style={{ color: '#DC2626' }}>{readingTiers.red} Reading Red</span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#DC2626',
                        fontStyle: 'italic',
                        backgroundColor: '#FEE2E2',
                        padding: '0.5rem',
                        borderRadius: '0.5rem'
                      }}>
                        {totalRed} students need support to move from Red to Green tier
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem 0',
                color: '#6b7280'
              }}>
                <AlertTriangle style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  margin: '0 auto 0.5rem',
                  color: '#d1d5db'
                }} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>No class data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          marginTop: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #f3f4f6'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#111827',
            margin: '0 0 1.5rem 0'
          }}>
            Quick Actions
          </h2>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/admin/teachers"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#3B82F6'
              }}
            >
              <Plus size={16} />
              Add New Teacher
            </Link>
            
            <Link
              href="/beautiful-upload"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#059669'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#10B981'
              }}
            >
              <Upload size={16} />
              Upload Scores
            </Link>
            
            <Link
              href="/beautiful-dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#F59E0B',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#D97706'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#F59E0B'
              }}
            >
              <BarChart3 size={16} />
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
