'use client'

import React, { useState } from 'react'
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
  const [selectedPeriod, setSelectedPeriod] = useState('This Week')

  // Sample data
  const stats = [
    {
      title: 'Total Students',
      value: '156',
      change: '+12',
      changeType: 'positive',
      icon: Users,
      color: '#3B82F6', // blue
      bgColor: '#EFF6FF'
    },
    {
      title: 'Average Score',
      value: '78.4%',
      change: '+2.1%',
      changeType: 'positive',
      icon: Target,
      color: '#10B981', // green
      bgColor: '#ECFDF5'
    },
    {
      title: 'Weekly Tests',
      value: '24',
      change: '+6',
      changeType: 'positive',
      icon: Calendar,
      color: '#8B5CF6', // purple
      bgColor: '#F3E8FF'
    },
    {
      title: 'Growth Rate',
      value: '+12.3%',
      change: 'vs last week',
      changeType: 'neutral',
      icon: TrendingUp,
      color: '#F59E0B', // orange
      bgColor: '#FFFBEB'
    }
  ]

  const subjects = [
    { name: 'Mathematics', score: 78, students: 121, total: 156, color: '#3B82F6' },
    { name: 'Reading', score: 85, students: 133, total: 156, color: '#10B981' }
  ]

  const topClasses = [
    { name: 'Grade 5-A', teacher: 'Ms. Brown', students: 27, math: 84, reading: 87, trend: '+4.7%' },
    { name: 'Grade 4-A', teacher: 'Ms. Johnson', students: 24, math: 82, reading: 85, trend: '+3.2%' },
    { name: 'Grade 3-A', teacher: 'Mrs. Taylor', students: 26, math: 80, reading: 83, trend: '+2.9%' }
  ]

  const recentActivity = [
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

        {/* Subject Performance */}
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
                    {Math.round(subject.students * 0.6)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Green</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#F59E0B' }}>
                    {Math.round(subject.students * 0.3)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Orange</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#EF4444' }}>
                    {Math.round(subject.students * 0.1)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Red</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '2rem' 
        }}>
          
          {/* Top Classes */}
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
                      {classroom.name.includes('Grade') ? classroom.name.split(' ')[1] : classroom.name.split('-')[0]}
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
                        Math: {classroom.math}% | Reading: {classroom.reading}%
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

          {/* Recent Activity */}
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
              <Bell style={{ width: '1.25rem', height: '1.25rem', color: '#3B82F6' }} />
              Recent Activity
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentActivity.map((activity, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.75rem' }}>
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
                </div>
              ))}
            </div>
          </div>
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
