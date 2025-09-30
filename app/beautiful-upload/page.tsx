'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Upload, FileText, AlertCircle, CheckCircle, Download, Clock, Users } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Footer } from '@/components/Footer'

interface UploadResult {
  success: boolean
  processedCount: number
  errors: string[]
  unmatchedStudents: Array<{
    name: string
    grade: string
    classroom: string
  }>
  summary?: {
    totalStudents: number
    averageScore: number
    grade: string
    teacher: string
  }
}

export default function BeautifulUploadPage() {
  console.log('BeautifulUploadPage component is rendering...')
  
  const { data: session } = useSession()
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('Grade 3')
  const [selectedClass, setSelectedClass] = useState('3-A')
  const [selectedSubject, setSelectedSubject] = useState('Math')
  const [selectedWeek, setSelectedWeek] = useState('1')
  const [currentWeek, setCurrentWeek] = useState(1)
  const [assessmentName, setAssessmentName] = useState('')
  const [assessmentDate, setAssessmentDate] = useState('')
  const [uploadedData, setUploadedData] = useState<any[]>([])
  
  // Debug logging for uploadedData changes
  useEffect(() => {
    console.log('uploadedData changed:', uploadedData.length, 'items')
    console.log('uploadedData content:', uploadedData)
  }, [uploadedData])
  const [teachers, setTeachers] = useState<any[]>([])

  // Load teachers from Supabase and auto-populate teacher name
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        
        if (data.users) {
          // Filter for teachers only and format for dropdown
          const teacherList = data.users
            .filter((user: any) => user.role === 'TEACHER')
            .map((user: any) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              // For display in dropdown, we'll use name only since we don't have grade/class in users table
              displayName: user.name
            }))
          
          setTeachers(teacherList)
          console.log('Loaded teachers from Supabase:', teacherList)
        }
      } catch (error) {
        console.error('Error fetching teachers from Supabase:', error)
        // Fallback to default teachers if Supabase fails
        const defaultTeachers = [
          { id: '1', name: 'Mr. Adams', email: 'mr.adams@school.edu', role: 'TEACHER', displayName: 'Mr. Adams' },
          { id: '2', name: 'Ms. Johnson', email: 'ms.johnson@school.edu', role: 'TEACHER', displayName: 'Ms. Johnson' },
          { id: '3', name: 'Mrs. Taylor', email: 'mrs.taylor@school.edu', role: 'TEACHER', displayName: 'Mrs. Taylor' }
        ]
        setTeachers(defaultTeachers)
      }
    }
    
    fetchTeachers()
    
    // Auto-populate teacher name from session
    if (session?.user?.name && !selectedTeacher) {
      const teacherName = session.user.name as string
      setSelectedTeacher(teacherName)
      console.log('Auto-populated teacher name from session:', teacherName)
    }
  }, [session, selectedTeacher])

  // Set default assessment date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setAssessmentDate(today)
  }, [])

  // Auto-suggest next assessment based on teacher's previous uploads
  useEffect(() => {
    const fetchAndSuggestNext = async () => {
      if (selectedTeacher) {
        try {
          const params = new URLSearchParams()
          params.append('role', 'TEACHER')
          params.append('user', selectedTeacher)
          
          const response = await fetch(`/api/upload/weekly-scores?${params.toString()}`)
          const data = await response.json()
          
          if (data.uploads && data.uploads.length > 0) {
            // Find the highest week number for this teacher
            const maxWeek = Math.max(...data.uploads.map((upload: any) => upload.weekNumber || 0))
            const nextWeek = maxWeek + 1
            setSelectedWeek(nextWeek.toString())
            setCurrentWeek(nextWeek)
            
            // Only auto-suggest if field is empty
            if (!assessmentName || assessmentName.startsWith('Assessment ')) {
              setAssessmentName(`Assessment ${nextWeek}`)
            }
            
            console.log(`Auto-suggested next assessment: Week ${nextWeek} for teacher: ${selectedTeacher}`)
          } else {
            // No previous uploads, start with week 1
            setSelectedWeek('1')
            setCurrentWeek(1)
            if (!assessmentName || assessmentName.startsWith('Assessment ')) {
              setAssessmentName('Assessment 1')
            }
            console.log(`No previous uploads found, starting with Week 1 for teacher: ${selectedTeacher}`)
          }
        } catch (error) {
          console.error('Error fetching teacher uploads for assessment calculation:', error)
          // Fallback to week 1 if there's an error
          setSelectedWeek('1')
          setCurrentWeek(1)
          if (!assessmentName || assessmentName.startsWith('Assessment ')) {
            setAssessmentName('Assessment 1')
          }
        }
      }
    }
    
    fetchAndSuggestNext()
  }, [selectedTeacher])

  // Use the actual session, fallback to mock only if needed
  const currentSession = session || {
    user: {
      name: 'Mr. Adams',
      email: 'mr.adams@school.edu',
      role: 'TEACHER'
    }
  }
  const userRole = (currentSession?.user as any)?.role

  // Check permissions
  if (!currentSession || !['TEACHER', 'STAFF', 'LEADER'].includes(userRole)) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'black' // Force text color
      }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '3rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          maxWidth: '28rem',
          border: '2px solid red' // Add visible border for testing
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
            You don't have permission to upload files.
          </p>
        </div>
      </div>
    )
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Get teacher name from session or selection
    const teacherName = selectedTeacher || (currentSession?.user?.name as string) || 'Unknown Teacher'

    setUploading(true)
    setResult(null)

    try {
      // Validate required fields
      if (!selectedTeacher) {
        setResult({
          success: false,
          processedCount: 0,
          errors: ['Please select a teacher name'],
          unmatchedStudents: [],
        })
        return
      }
      
      if (!assessmentName) {
        setResult({
          success: false,
          processedCount: 0,
          errors: ['Please enter an assessment name'],
          unmatchedStudents: [],
        })
        return
      }
      
      if (!assessmentDate) {
        setResult({
          success: false,
          processedCount: 0,
          errors: ['Please select an assessment date'],
          unmatchedStudents: [],
        })
        return
      }
      
      // Use selected values from form
      const grade = selectedGrade
      const className = selectedClass
      const teacherName = selectedTeacher
      
      console.log('Selected teacher:', teacherName)
      console.log('Selected grade:', grade)
      console.log('Selected class:', className)
      console.log('Selected subject:', selectedSubject)
      console.log('Assessment name:', assessmentName)
      console.log('Assessment date:', assessmentDate)
     
     const formData = new FormData()
     formData.append('file', file)
     formData.append('teacherName', teacherName)
     formData.append('weekNumber', selectedWeek)
     formData.append('weekStart', assessmentDate)
     formData.append('grade', grade)
     formData.append('className', className)
     formData.append('subject', selectedSubject) // Use selected subject
     formData.append('assessmentName', assessmentName)
     formData.append('assessmentType', 'custom')
     
     console.log('=== UPLOAD DEBUG ===')
     console.log('Selected grade:', selectedGrade)
     console.log('Selected class:', selectedClass)
     console.log('Selected subject:', selectedSubject)
     console.log('Selected teacher:', teacherName)

      // Call the actual upload API
      const response = await fetch('/api/upload/weekly-scores', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

             if (response.ok) {
         setResult({
           success: true,
           processedCount: result.processedCount || 0,
           errors: result.errors || [],
           unmatchedStudents: result.unmatchedStudents || [],
         })
         // Refresh uploaded data after successful upload
         console.log('Upload successful, refreshing data...')
         setTimeout(() => {
           fetchUploadedData()
           // Auto-increment week number for next upload
           setCurrentWeek(prev => prev + 1)
           setSelectedWeek((currentWeek + 1).toString())
         }, 1000) // Small delay to ensure data is saved
       } else {
        setResult({
          success: false,
          processedCount: 0,
          errors: [result.error || 'Upload failed. Please try again.'],
          unmatchedStudents: [],
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setResult({
        success: false,
        processedCount: 0,
        errors: ['Upload failed. Please try again.'],
        unmatchedStudents: [],
      })
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  })

  const downloadTemplate = () => {
    // Create and download the template with student names for the selected subject
    const csvContent = `Student Name,Score
John Smith,85
Sarah Johnson,92
Michael Brown,78
Emma Davis,88
James Wilson,91
Olivia Martinez,85
William Anderson,82
Sophia Garcia,90
Benjamin Taylor,87
Isabella Thomas,94`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedSubject}-scores-template.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const fetchUploadedData = async () => {
    try {
      // Only fetch data for the current teacher, not all teachers
      const params = new URLSearchParams()
      params.append('role', userRole || 'TEACHER')
      params.append('user', selectedTeacher || session?.user?.name || '')
      
      console.log('Fetching uploaded data for:', selectedTeacher || session?.user?.name)
      const response = await fetch(`/api/upload/weekly-scores?${params.toString()}`)
      const data = await response.json()
      console.log('Fetched data:', data.uploads?.length || 0, 'uploads')
      console.log('Full API response:', data)
      console.log('Uploads array:', data.uploads)
      setUploadedData(data.uploads || [])
    } catch (error) {
      console.error('Error fetching uploaded data:', error)
    }
  }

  const handleDeleteUpload = async (uploadId: string) => {
    if (!confirm('Are you sure you want to delete this upload? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/upload/weekly-scores?id=${uploadId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove the deleted upload from the local state
        setUploadedData(prev => prev.filter(upload => upload.id !== uploadId))
        console.log('Upload deleted successfully')
      } else {
        console.error('Failed to delete upload')
        alert('Failed to delete upload. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting upload:', error)
      alert('Error deleting upload. Please try again.')
    }
  }

  // Fetch uploaded data when component mounts or teacher changes
  useEffect(() => {
    console.log('Component mounted, fetching data for:', selectedTeacher || session?.user?.name)
    if (selectedTeacher || session?.user?.name) {
      fetchUploadedData()
    }
  }, [selectedTeacher, session?.user?.name])

  // Also fetch data on page load
  useEffect(() => {
    fetchUploadedData()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Main Content */}
      <div style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: '1.5rem 1.5rem'
      }}>
        
        {/* Upload Controls */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #f3f4f6',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
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
                  <Upload style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                </div>
                Upload Assessment Scores
              </h2>
              <p style={{ color: '#6B7280', fontSize: '1rem' }}>
                Upload student names with their scores for each subject separately
              </p>
            </div>
            
            <button
              onClick={downloadTemplate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <Download style={{ width: '1rem', height: '1rem' }} />
              Download Template
            </button>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '2rem' 
        }}>
          
                     {/* Upload Area */}
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
              <FileText style={{ width: '1.25rem', height: '1.25rem', color: '#8B5CF6' }} />
              Upload File
            </h3>

            {/* Important Notice */}
            <div style={{ 
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#EFF6FF',
              border: '1px solid #3B82F6',
              borderRadius: '0.5rem'
            }}>
              <p style={{ 
                color: '#1E40AF', 
                fontSize: '0.875rem', 
                fontWeight: '600',
                margin: 0,
                marginBottom: '0.5rem'
              }}>
                📝 Important: Upload Requirements
              </p>
              <ul style={{ 
                color: '#1E40AF', 
                fontSize: '0.875rem',
                margin: 0,
                paddingLeft: '1.25rem',
                lineHeight: '1.6'
              }}>
                <li>Use <strong>student names</strong> (not student ID numbers)</li>
                <li>Upload <strong>one subject at a time</strong> (Math or Reading separately)</li>
                <li>Each student must have a name and a score</li>
              </ul>
            </div>

            {/* Subject Selection - First Priority */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '0.5rem' 
              }}>
                Subject: <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #3B82F6',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontWeight: '600',
                  boxSizing: 'border-box',
                  lineHeight: '1.5'
                }}
              >
                <option value="Math">Math</option>
                <option value="Reading">Reading</option>
                <option value="Science">Science</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Writing">Writing</option>
                <option value="Other">Other</option>
              </select>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#6B7280', 
                marginTop: '0.25rem' 
              }}>
                Select the subject for this upload. Upload each subject separately.
              </p>
            </div>

            {/* Grade Level Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '0.5rem' 
              }}>
                Grade Level: <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  boxSizing: 'border-box',
                  lineHeight: '1.5',
                  fontWeight: '500'
                }}
              >
                <option value="Kindergarten">Kindergarten (K)</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
              </select>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#6B7280', 
                marginTop: '0.25rem' 
              }}>
                Select the grade level for this class
              </p>
            </div>

            {/* Class/Section Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.5rem' 
              }}>
                Class/Section: <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  boxSizing: 'border-box',
                  lineHeight: '1.5'
                }}
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
                <option value="E">Section E</option>
              </select>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#6B7280', 
                marginTop: '0.25rem' 
              }}>
                Select the class section (if applicable)
              </p>
            </div>

            {/* Teacher Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
               <label style={{ 
                 display: 'block', 
                 fontSize: '0.875rem', 
                 fontWeight: '500', 
                 color: '#374151', 
                 marginBottom: '0.5rem' 
               }}>
                 Teacher Name:
               </label>
               {userRole === 'LEADER' ? (
                 <select
                   value={selectedTeacher}
                   onChange={(e) => setSelectedTeacher(e.target.value)}
                   style={{
                     width: '100%',
                     padding: '0.75rem',
                     border: '1px solid #D1D5DB',
                     borderRadius: '0.5rem',
                     fontSize: '0.875rem',
                     backgroundColor: 'white',
                     color: '#374151',
                     boxSizing: 'border-box',
                     lineHeight: '1.5'
                   }}
               >
                 <option value="">Select a teacher...</option>
                 {teachers.map((teacher) => (
                   <option key={teacher.id} value={teacher.name}>
                     {teacher.displayName || teacher.name}
                   </option>
                 ))}
               </select>
               ) : (
                 <input
                   type="text"
                   value={selectedTeacher}
                   readOnly
                   style={{
                     width: '100%',
                     padding: '0.75rem',
                     border: '1px solid #D1D5DB',
                     borderRadius: '0.5rem',
                     fontSize: '0.875rem',
                     backgroundColor: '#F9FAFB',
                     color: '#374151',
                     cursor: 'not-allowed',
                     boxSizing: 'border-box',
                     lineHeight: '1.5'
                   }}
                 />
               )}
             </div>

            {/* Assessment Name Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.5rem' 
              }}>
                Assessment Name: <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  placeholder="Type anything: Math Quiz, Reading Test, etc."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: assessmentName ? '4rem' : '0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    outline: 'none',
                    boxSizing: 'border-box',
                    lineHeight: '1.5',
                    verticalAlign: 'middle'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6'
                    e.target.style.borderWidth = '2px'
                    e.target.select()
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB'
                    e.target.style.borderWidth = '1px'
                  }}
                />
                {assessmentName && (
                  <button
                    type="button"
                    onClick={() => setAssessmentName('')}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: '#EF4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.375rem 0.625rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      lineHeight: '1'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
                  >
                    Clear
                  </button>
                )}
              </div>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#6B7280', 
                marginTop: '0.25rem' 
              }}>
                💡 <strong>Tip:</strong> Click in the box and type your own name (e.g., "Math Chapter 3", "Reading Quiz")
              </p>
            </div>

             {/* Assessment Date Input */}
             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{ 
                 display: 'block', 
                 fontSize: '0.875rem', 
                 fontWeight: '500', 
                 color: '#374151',
                 marginBottom: '0.5rem' 
               }}>
                 Assessment Date: <span style={{ color: '#DC2626' }}>*</span>
               </label>
               <input
                 type="date"
                 value={assessmentDate}
                 onChange={(e) => setAssessmentDate(e.target.value)}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #D1D5DB',
                   borderRadius: '0.5rem',
                   fontSize: '0.875rem',
                   backgroundColor: 'white',
                   color: '#374151',
                   boxSizing: 'border-box',
                   lineHeight: '1.5'
                 }}
               />
               <p style={{ 
                 fontSize: '0.75rem', 
                 color: '#6B7280', 
                 marginTop: '0.25rem' 
               }}>
                 When was this assessment taken?
               </p>
             </div>


             
            
            <div
              {...getRootProps()}
              style={{
                border: isDragActive ? '2px dashed #3B82F6' : '2px dashed #D1D5DB',
                borderRadius: '0.75rem',
                padding: '2rem',
                textAlign: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer',
                backgroundColor: isDragActive ? '#EFF6FF' : uploading ? '#F9FAFB' : '#FAFAFA',
                opacity: uploading ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              <input {...getInputProps()} />
              
              {uploading ? (
                <div>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    border: '2px solid #3B82F6',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem auto'
                  }} />
                  <p style={{ color: '#6B7280', fontSize: '1rem', fontWeight: '500' }}>
                    Processing file...
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: isDragActive ? '#3B82F6' : '#E5E7EB',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}>
                    <Upload style={{ 
                      width: '1.5rem', 
                      height: '1.5rem', 
                      color: isDragActive ? 'white' : '#6B7280' 
                    }} />
                  </div>
                  
                  {isDragActive ? (
                    <p style={{ color: '#3B82F6', fontSize: '1rem', fontWeight: '600' }}>
                      Drop the Excel file here...
                    </p>
                  ) : (
                    <div>
                      <p style={{ color: '#374151', fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                        Drag and drop an Excel file here, or click to select
                      </p>
                      <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                        Supports .xlsx, .xls, and .csv files (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Template Information */}
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
              <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />
              Excel Template Format
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>Required Columns:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: 'Student Name', desc: 'Full student name (e.g., "John Smith", "Sarah Johnson")' },
                  { label: 'Score', desc: 'Number between 0-100' }
                ].map((col, index) => (
                  <div key={index} style={{ 
                    padding: '0.5rem', 
                    backgroundColor: '#F8FAFC', 
                    borderRadius: '0.5rem',
                    border: '1px solid #E2E8F0'
                  }}>
                    <span style={{ fontWeight: '600', color: '#374151' }}>{col.label}:</span>
                    <span style={{ color: '#6B7280', marginLeft: '0.5rem' }}>{col.desc}</span>
                  </div>
                ))}
              </div>
              <div style={{ 
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FCD34D',
                borderRadius: '0.5rem'
              }}>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#92400E',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  💡 <strong>Important:</strong> Use student names, not ID numbers! Upload one subject per file.
                </p>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>Validation Rules:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {[
                  'Scores must be between 0 and 100',
                  'Student names must be provided (not ID numbers)',
                  'Upload ONE subject per file (Math, Reading, etc.)',
                  'File must have "Student Name" and "Score" columns',
                  'Supports CSV, Excel (.xlsx, .xls) formats'
                ].map((rule, index) => (
                  <div key={index} style={{ 
                    fontSize: '0.875rem', 
                    color: '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{ 
                      width: '0.25rem', 
                      height: '0.25rem', 
                      backgroundColor: '#10B981', 
                      borderRadius: '50%' 
                    }} />
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f3f4f6',
            marginTop: '2rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              marginBottom: '1.5rem' 
            }}>
              {result.success ? (
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  backgroundColor: '#DCFCE7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#16A34A' }} />
                </div>
              ) : (
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  backgroundColor: '#FEF2F2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#DC2626' }} />
                </div>
              )}
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>
                {result.success ? 'Upload Successful!' : 'Upload Issues'}
              </h3>
            </div>

                         {result.processedCount > 0 && (
               <div style={{
                 padding: '1rem',
                 backgroundColor: '#DCFCE7',
                 borderRadius: '0.75rem',
                 marginBottom: '1rem',
                 border: '1px solid #BBF7D0'
               }}>
                 <div style={{ 
                   color: '#166534', 
                   fontWeight: '600',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem',
                   marginBottom: '0.5rem'
                 }}>
                   <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                   Successfully processed {result.processedCount} scores
                 </div>
                 <div style={{ 
                   color: '#166534', 
                   fontSize: '0.875rem',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem'
                 }}>
                   <Users style={{ width: '1rem', height: '1rem' }} />
                   Uploaded by: {result.summary?.teacher || 'Unknown Teacher'}
                 </div>
               </div>
             )}

            {result.errors.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: '600', color: '#DC2626', marginBottom: '0.75rem' }}>Errors:</h4>
                <div style={{
                  backgroundColor: '#FEF2F2',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid #FECACA'
                }}>
                  {result.errors.map((error, index) => (
                    <div key={index} style={{ 
                      color: '#991B1B', 
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{ 
                        width: '0.25rem', 
                        height: '0.25rem', 
                        backgroundColor: '#DC2626', 
                        borderRadius: '50%' 
                      }} />
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.unmatchedStudents.length > 0 && (
              <div>
                <h4 style={{ 
                  fontWeight: '600', 
                  color: '#D97706', 
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Users style={{ width: '1.25rem', height: '1.25rem' }} />
                  Unmatched Students ({result.unmatchedStudents.length}):
                </h4>
                <div style={{
                  backgroundColor: '#FFFBEB',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid #FED7AA'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {result.unmatchedStudents.map((student, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#92400E',
                        fontSize: '0.875rem'
                      }}>
                        <div style={{ 
                          width: '0.25rem', 
                          height: '0.25rem', 
                          backgroundColor: '#D97706', 
                          borderRadius: '50%' 
                        }} />
                        {student.name} ({student.grade}, {student.classroom})
                      </div>
                    ))}
                  </div>
                  <p style={{ color: '#92400E', fontSize: '0.875rem', margin: 0 }}>
                    These students need to be added to the roster or their names corrected.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

                       {/* Uploaded Data Section */}
         {true && (
           <div style={{
             backgroundColor: 'white',
             borderRadius: '1rem',
             padding: '1.5rem',
             boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
             border: '1px solid #f3f4f6',
             marginTop: '2rem'
           }}>
             <div style={{ 
               display: 'flex', 
               justifyContent: 'space-between', 
               alignItems: 'center',
               marginBottom: '1rem'
             }}>
               <h3 style={{ 
                 fontSize: '1.25rem', 
                 fontWeight: '600', 
                 color: '#111827',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '0.5rem',
                 margin: 0
               }}>
                 <Upload style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />
                 Your Uploaded Data ({uploadedData.length} uploads)
               </h3>
             </div>
             
             {/* Privacy Notice - Only show for teachers, not admins */}
             {userRole !== 'LEADER' && (
               <div style={{
                 backgroundColor: '#EFF6FF',
                 border: '1px solid #93C5FD',
                 borderRadius: '0.5rem',
                 padding: '0.75rem',
                 marginBottom: '1.5rem'
               }}>
                 <div style={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem',
                   color: '#1E40AF',
                   fontSize: '0.875rem',
                   fontWeight: '500'
                 }}>
                   <div style={{
                     width: '1rem',
                     height: '1rem',
                     backgroundColor: '#3B82F6',
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     color: 'white',
                     fontSize: '0.75rem'
                   }}>
                     🔒
                   </div>
                   Privacy Protected: Your data is only visible to you and administrators
                 </div>
               </div>
             )}
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {uploadedData.length === 0 ? (
                 <div style={{ 
                   textAlign: 'center', 
                   padding: '2rem',
                   color: '#6B7280',
                   backgroundColor: '#F9FAFB',
                   borderRadius: '0.75rem',
                   border: '1px solid #E5E7EB'
                 }}>
                   <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                   <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                     No uploads found
                   </p>
                   <p style={{ fontSize: '0.875rem' }}>
                     Upload a file to see your data here
                   </p>
                 </div>
               ) : (
                 uploadedData.map((upload, index) => (
                 <div key={upload.id} style={{
                   padding: '1rem',
                   backgroundColor: '#F8FAFC',
                   borderRadius: '0.75rem',
                   border: '1px solid #E2E8F0'
                 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                     <div>
                       <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem', fontSize: '1rem' }}>
                         📝 {upload.assessmentName || upload.weekLabel || `Week ${upload.weekNumber}`}
                       </div>
                       <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.125rem' }}>
                         {upload.teacherName} • {upload.grade}, Section {upload.className}
                       </div>
                       <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                         Subject: <span style={{ fontWeight: '600', color: '#3B82F6' }}>{upload.subject}</span>
                       </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        {upload.uploadTime}
                      </div>
                       <button
                         onClick={() => handleDeleteUpload(upload.id)}
                         style={{
                           backgroundColor: '#FEF2F2',
                           color: '#DC2626',
                           border: '1px solid #FECACA',
                           borderRadius: '0.375rem',
                           padding: '0.5rem 0.75rem',
                           fontSize: '0.75rem',
                           fontWeight: '500',
                           cursor: 'pointer',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '0.25rem',
                           transition: 'all 0.2s ease'
                         }}
                         onMouseOver={(e) => {
                           e.currentTarget.style.backgroundColor = '#FEE2E2'
                           e.currentTarget.style.borderColor = '#FCA5A5'
                         }}
                         onMouseOut={(e) => {
                           e.currentTarget.style.backgroundColor = '#FEF2F2'
                           e.currentTarget.style.borderColor = '#FECACA'
                         }}
                       >
                         🗑️ Delete
                       </button>
                     </div>
                   </div>
                   <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                     {upload.totalStudents} students • Average: {upload.averageScore}%
                   </div>
                 </div>
               ))
               )}
             </div>
           </div>
         )}

      <Footer bgColor="#FCE7F3" textColor="#831843" />

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
