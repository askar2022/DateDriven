'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Settings, BarChart3, Upload, FileText, Plus, Edit, Trash2 } from 'lucide-react'

interface Teacher {
  id: string
  name: string
  grade: string
  className: string
  email?: string
}

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalUploads: 0,
    totalStudents: 0
  })

  // Load teachers from localStorage
  useEffect(() => {
    const savedTeachers = localStorage.getItem('teachers')
    if (savedTeachers) {
      const teachersList = JSON.parse(savedTeachers)
      setTeachers(teachersList)
      setStats(prev => ({ ...prev, totalTeachers: teachersList.length }))
    }
  }, [])

  // Load upload stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/upload/weekly-scores')
        const data = await response.json()
        const uploads = data.uploads || []
        const totalStudents = uploads.reduce((sum: number, upload: any) => sum + (upload.totalStudents || 0), 0)
        
        setStats(prev => ({
          ...prev,
          totalUploads: uploads.length,
          totalStudents: totalStudents
        }))
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

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
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
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
                  Total Uploads
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {stats.totalUploads}
                </p>
              </div>
              <Upload style={{ width: '2rem', height: '2rem', color: '#10B981' }} />
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
              <BarChart3 style={{ width: '2rem', height: '2rem', color: '#F59E0B' }} />
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
