'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  AlertCircle,
  UserPlus
} from 'lucide-react'

interface Student {
  id: string
  externalId?: string
  gradeLevelId: number
  active: boolean
  gradeLevel: {
    name: string
  }
  pii?: {
    fullName: string
  }
}

export default function StudentsPage() {
  const { data: session } = useSession()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Temporary: Skip authentication for testing
  const mockSession = {
    user: {
      name: 'Demo User',
      email: 'demo@school.edu',
      role: 'STAFF' // Allow student management access for testing
    }
  }

  // Use mock session for testing
  const currentSession = session || mockSession
  const userRole = (currentSession?.user as any)?.role

  // Check permissions
  if (!currentSession || !['STAFF', 'LEADER'].includes(userRole)) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '3rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          maxWidth: '28rem'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: '#FEF2F2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <AlertCircle style={{ width: '2rem', height: '2rem', color: '#EF4444' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            Access Denied
          </h1>
          <p style={{ color: '#6B7280' }}>
            You don't have permission to manage students.
          </p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchStudents()
  }, [selectedGrade])

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedGrade !== 'all') params.append('grade', selectedGrade)
      
      const response = await fetch(`/api/students?${params}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => 
    student.pii?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.externalId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setStudents(students.filter(s => s.id !== studentId))
      }
    } catch (error) {
      console.error('Failed to delete student:', error)
    }
  }

  const toggleStudentStatus = async (studentId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      })

      if (response.ok) {
        setStudents(students.map(s => 
          s.id === studentId ? { ...s, active } : s
        ))
      }
    } catch (error) {
      console.error('Failed to update student status:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          textAlign: 'center'
        }}>
          <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            <div style={{ height: '2rem', backgroundColor: '#E5E7EB', borderRadius: '0.375rem', width: '25%', marginBottom: '2rem' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ height: '4rem', backgroundColor: '#E5E7EB', borderRadius: '0.375rem' }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: '1.5rem 1.5rem'
      }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #f3f4f6',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ 
                fontSize: '1.875rem', 
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
                  <Users style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                </div>
                Student Management
              </h1>
              <p style={{ color: '#6B7280', fontSize: '1rem' }}>
                Manage student roster and resolve upload conflicts
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #f3f4f6',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  width: '1rem', 
                  height: '1rem', 
                  color: '#9CA3AF' 
                }} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    paddingLeft: '2.5rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.375rem',
                    width: '16rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                style={{
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem'
                }}
              >
                <option value="all">All Grades</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1D4ED8'}
              onMouseOut={(e) => e.currentTarget.style.background = '#3B82F6'}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #f3f4f6',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th style={{
                    padding: '0.75rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #E5E7EB'
                  }}>
                    Student
                  </th>
                  <th style={{
                    padding: '0.75rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #E5E7EB'
                  }}>
                    Student ID
                  </th>
                  <th style={{
                    padding: '0.75rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #E5E7EB'
                  }}>
                    Grade Level
                  </th>
                  <th style={{
                    padding: '0.75rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #E5E7EB'
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '0.75rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #E5E7EB'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'white' }}>
                {filteredStudents.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          backgroundColor: '#F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem'
                        }}>
                          <Users style={{ width: '1.25rem', height: '1.25rem', color: '#6B7280' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                            {student.pii?.fullName || 'Anonymous Student'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#111827' }}>
                      {student.externalId || '-'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#111827' }}>
                      {student.gradeLevel.name}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '9999px',
                        backgroundColor: student.active ? '#D1FAE5' : '#FEE2E2',
                        color: student.active ? '#065F46' : '#991B1B'
                      }}>
                        {student.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6B7280' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                          onClick={() => toggleStudentStatus(student.id, !student.active)}
                          style={{
                            color: '#2563EB',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem'
                          }}
                          title={student.active ? 'Deactivate' : 'Activate'}
                        >
                          <Edit2 style={{ width: '1rem', height: '1rem' }} />
                        </button>
                        <button
                          onClick={() => deleteStudent(student.id)}
                          style={{
                            color: '#DC2626',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem'
                          }}
                          title="Delete"
                        >
                          <Trash2 style={{ width: '1rem', height: '1rem' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <Users style={{ width: '3rem', height: '3rem', color: '#9CA3AF', margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                  No students found
                </h3>
                <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
                  {searchTerm ? 'No students match your search criteria.' : 'No students have been added yet.'}
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    margin: '0 auto'
                  }}
                >
                  <UserPlus style={{ width: '1rem', height: '1rem' }} />
                  <span>Add First Student</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Student Modal - Beautiful version */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 50
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '28rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem'
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
                  <UserPlus style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0
                }}>
                  Add New Student
                </h3>
              </div>
              
              <p style={{
                color: '#6B7280',
                fontSize: '1rem',
                lineHeight: '1.5',
                marginBottom: '2rem'
              }}>
                Student management interface coming soon. For now, students are added automatically when scores are uploaded.
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem'
              }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
