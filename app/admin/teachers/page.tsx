'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Teacher {
  id: string
  name: string
  grade: string
  className: string
  email?: string
}

export default function TeachersManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    grade: 'Grade 3',
    className: 'Class 3-A',
    email: ''
  })

  // Load teachers from localStorage on component mount
  useEffect(() => {
    const savedTeachers = localStorage.getItem('teachers')
    if (savedTeachers) {
      setTeachers(JSON.parse(savedTeachers))
    } else {
      // Default teachers if none exist
      const defaultTeachers: Teacher[] = [
        { id: '1', name: 'Ms. Johnson', grade: 'Grade 3', className: 'Class 3-A', email: 'johnson@school.edu' },
        { id: '2', name: 'Mrs. Taylor', grade: 'Grade 4', className: 'Class 4-A', email: 'taylor@school.edu' },
        { id: '3', name: 'Ms. Brown', grade: 'Grade 5', className: 'Class 5-A', email: 'brown@school.edu' },
        { id: '4', name: 'Mr. Davis', grade: 'Grade 3', className: 'Class 3-B', email: 'davis@school.edu' },
        { id: '5', name: 'Mrs. Wilson', grade: 'Grade 4', className: 'Class 4-B', email: 'wilson@school.edu' },
        { id: '6', name: 'Mr. Smith', grade: 'Grade 5', className: 'Class 5-B', email: 'smith@school.edu' }
      ]
      setTeachers(defaultTeachers)
      localStorage.setItem('teachers', JSON.stringify(defaultTeachers))
    }
  }, [])

  // Save teachers to localStorage whenever teachers change
  useEffect(() => {
    localStorage.setItem('teachers', JSON.stringify(teachers))
  }, [teachers])

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({ name: '', grade: 'Grade 3', className: 'Class 3-A', email: '' })
  }

  const handleEdit = (teacher: Teacher) => {
    setEditingId(teacher.id)
    setFormData({
      name: teacher.name,
      grade: teacher.grade,
      className: teacher.className,
      email: teacher.email || ''
    })
  }

  const handleSave = () => {
    if (!formData.name.trim()) return

    if (isAdding) {
      const newTeacher: Teacher = {
        id: Date.now().toString(),
        name: formData.name,
        grade: formData.grade,
        className: formData.className,
        email: formData.email
      }
      setTeachers([...teachers, newTeacher])
      setIsAdding(false)
    } else if (editingId) {
      setTeachers(teachers.map(teacher => 
        teacher.id === editingId 
          ? { ...teacher, ...formData }
          : teacher
      ))
      setEditingId(null)
    }
    
    setFormData({ name: '', grade: 'Grade 3', className: 'Class 3-A', email: '' })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      setTeachers(teachers.filter(teacher => teacher.id !== id))
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: '', grade: 'Grade 3', className: 'Class 3-A', email: '' })
  }

  const getDisplayName = (teacher: Teacher) => {
    return `${teacher.name} - ${teacher.grade} - ${teacher.className}`
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
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '0.5rem' 
          }}>
            Teacher Management
          </h1>
          <p style={{ color: '#6B7280' }}>
            Add, edit, and manage teachers for your school
          </p>
        </div>

        {/* Add Teacher Button */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={handleAdd}
            disabled={isAdding || editingId !== null}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: isAdding || editingId !== null ? 'not-allowed' : 'pointer',
              opacity: isAdding || editingId !== null ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={16} />
            Add New Teacher
          </button>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#111827', 
              marginBottom: '1.5rem' 
            }}>
              {isAdding ? 'Add New Teacher' : 'Edit Teacher'}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '0.5rem' 
                }}>
                  Teacher Name:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    color: '#374151'
                  }}
                  placeholder="Enter teacher name"
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '0.5rem' 
                }}>
                  Email (optional):
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    color: '#374151'
                  }}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '0.5rem' 
                }}>
                  Grade:
                </label>
                                 <select
                   value={formData.grade}
                   onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                   style={{
                     width: '100%',
                     padding: '0.75rem',
                     border: '1px solid #D1D5DB',
                     borderRadius: '0.5rem',
                     fontSize: '0.875rem',
                     backgroundColor: 'white',
                     color: '#374151'
                   }}
                 >
                   <option value="Kindergarten">Kindergarten</option>
                   <option value="Grade 1">Grade 1</option>
                   <option value="Grade 2">Grade 2</option>
                   <option value="Grade 3">Grade 3</option>
                   <option value="Grade 4">Grade 4</option>
                   <option value="Grade 5">Grade 5</option>
                   <option value="Grade 6">Grade 6</option>
                   <option value="Grade 7">Grade 7</option>
                   <option value="Grade 8">Grade 8</option>
                 </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '0.5rem' 
                }}>
                  Class:
                </label>
                                 <select
                   value={formData.className}
                   onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                   style={{
                     width: '100%',
                     padding: '0.75rem',
                     border: '1px solid #D1D5DB',
                     borderRadius: '0.5rem',
                     fontSize: '0.875rem',
                     backgroundColor: 'white',
                     color: '#374151'
                   }}
                 >
                   <option value="Class K-A">Class K-A</option>
                   <option value="Class K-B">Class K-B</option>
                   <option value="Class 1-A">Class 1-A</option>
                   <option value="Class 1-B">Class 1-B</option>
                   <option value="Class 2-A">Class 2-A</option>
                   <option value="Class 2-B">Class 2-B</option>
                   <option value="Class 3-A">Class 3-A</option>
                   <option value="Class 3-B">Class 3-B</option>
                   <option value="Class 4-A">Class 4-A</option>
                   <option value="Class 4-B">Class 4-B</option>
                   <option value="Class 5-A">Class 5-A</option>
                   <option value="Class 5-B">Class 5-B</option>
                   <option value="Class 6-A">Class 6-A</option>
                   <option value="Class 6-B">Class 6-B</option>
                   <option value="Class 7-A">Class 7-A</option>
                   <option value="Class 7-B">Class 7-B</option>
                   <option value="Class 8-A">Class 8-A</option>
                   <option value="Class 8-B">Class 8-B</option>
                 </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                style={{
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: !formData.name.trim() ? 'not-allowed' : 'pointer',
                  opacity: !formData.name.trim() ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Save size={16} />
                {isAdding ? 'Add Teacher' : 'Save Changes'}
              </button>
              
              <button
                onClick={handleCancel}
                style={{
                  backgroundColor: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Teachers List */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #f3f4f6',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '1.5rem', 
            borderBottom: '1px solid #f3f4f6',
            backgroundColor: '#f9fafb'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#111827',
              margin: 0
            }}>
              Teachers ({teachers.length})
            </h2>
          </div>
          
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {teachers.length === 0 ? (
              <div style={{ 
                padding: '3rem', 
                textAlign: 'center', 
                color: '#6B7280' 
              }}>
                No teachers found. Add your first teacher above.
              </div>
            ) : (
              teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: editingId === teacher.id ? '#FEF3C7' : 'white'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#111827',
                      marginBottom: '0.25rem'
                    }}>
                      {getDisplayName(teacher)}
                    </h3>
                    {teacher.email && (
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#6B7280',
                        margin: 0
                      }}>
                        {teacher.email}
                      </p>
                    )}
                  </div>
                  
                                     <div style={{ display: 'flex', gap: '0.5rem' }}>
                     <button
                       onClick={() => handleEdit(teacher)}
                       disabled={isAdding || editingId !== null}
                       style={{
                         backgroundColor: '#3B82F6',
                         color: 'white',
                         border: 'none',
                         borderRadius: '0.375rem',
                         padding: '0.5rem',
                         cursor: isAdding || editingId !== null ? 'not-allowed' : 'pointer',
                         opacity: isAdding || editingId !== null ? 0.6 : 1
                       }}
                       title="Edit teacher"
                     >
                       <Edit size={16} />
                     </button>
                     
                     <button
                       onClick={() => handleDelete(teacher.id)}
                       disabled={isAdding || editingId !== null}
                       style={{
                         backgroundColor: '#EF4444',
                         color: 'white',
                         border: 'none',
                         borderRadius: '0.375rem',
                         padding: '0.5rem',
                         cursor: isAdding || editingId !== null ? 'not-allowed' : 'pointer',
                         opacity: isAdding || editingId !== null ? 0.6 : 1
                       }}
                       title="Delete teacher"
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
