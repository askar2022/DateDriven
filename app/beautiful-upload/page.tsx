'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Upload, FileText, AlertCircle, CheckCircle, Download, Clock, Users } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

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
  const [selectedTeacher, setSelectedTeacher] = useState('Ms. Johnson')
  const [selectedGrade, setSelectedGrade] = useState('Grade 3')
  const [selectedClass, setSelectedClass] = useState('3-A')
  const [selectedSubject, setSelectedSubject] = useState('Math')
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [fileHasBothSubjects, setFileHasBothSubjects] = useState(false)
  const [teachers, setTeachers] = useState<any[]>([])

  // Load teachers from localStorage
  useEffect(() => {
    const savedTeachers = localStorage.getItem('teachers')
    if (savedTeachers) {
      setTeachers(JSON.parse(savedTeachers))
    }
  }, [])

  // Use the actual session, fallback to mock only if needed
  const currentSession = session || {
    user: {
      name: 'Demo User',
      email: 'demo@school.edu',
      role: 'LEADER'
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
      // Check if file has both Math and Reading columns
      let hasBothSubjects = false
      let detectedSubject = 'Math' // default
      if (file.name.endsWith('.csv')) {
        const fileContent = await file.text()
        const lines = fileContent.split('\n')
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim())
          hasBothSubjects = headers.includes('Math Grade') && headers.includes('Reading Grade')
          setFileHasBothSubjects(hasBothSubjects)
          
          // Auto-detect subject from file columns
          if (headers.includes('Math Grade') && !headers.includes('Reading Grade')) {
            detectedSubject = 'Math'
          } else if (headers.includes('Reading Grade') && !headers.includes('Math Grade')) {
            detectedSubject = 'Reading'
          }
        }
      }
      
      // Extract grade from teacher selection (e.g., "Ms. Johnson - Grade 3 - Class 3-A" -> "Grade 3")
      const gradeMatch = selectedTeacher.match(/Grade \d+/)
      const grade = gradeMatch ? gradeMatch[0] : 'Grade 3'
      
      // Extract class from teacher selection (e.g., "Ms. Johnson - Grade 3 - Class 3-A" -> "Class 3-A")
      const classMatch = selectedTeacher.match(/Class \d+-[A-B]/)
      const className = classMatch ? classMatch[0] : 'Class A'
      
      // Extract teacher name (everything before " - Grade")
      const teacherName = selectedTeacher.replace(/ - Grade \d+ - Class \d+-[A-B]$/, '')
      
      console.log('Selected teacher:', selectedTeacher)
      console.log('Extracted teacher name:', teacherName)
      console.log('Extracted grade:', grade)
      console.log('File has both subjects:', hasBothSubjects)
     
     const formData = new FormData()
     formData.append('file', file)
     formData.append('teacherName', teacherName)
     formData.append('grade', grade)
     formData.append('class', className)
     formData.append('subject', hasBothSubjects ? 'Both' : detectedSubject)
     
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
         fetchUploadedData()
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
    // Create and download the template
    const csvContent = `Student_ID,Math Grade,Reading Grade
1,43,79
2,48,74
3,51,79
4,75,67
5,68,76
6,82,78
7,91,69
8,69,71
9,74,86
10,82,82`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student-scores-template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const fetchUploadedData = async () => {
    try {
      const response = await fetch('/api/upload/weekly-scores')
      const data = await response.json()
      setUploadedData(data.uploads || [])
    } catch (error) {
      console.error('Error fetching uploaded data:', error)
    }
  }

  // Fetch uploaded data when component mounts
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
                Upload Weekly Scores
              </h2>
              <p style={{ color: '#6B7280', fontSize: '1rem' }}>
                Upload Excel files containing Math and Reading scores for Grades 3-5
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






             
             {/* Show message when file has both subjects */}
             {fileHasBothSubjects && (
               <div style={{ 
                 marginBottom: '1.5rem',
                 padding: '1rem',
                 backgroundColor: '#ECFDF5',
                 border: '1px solid #10B981',
                 borderRadius: '0.5rem',
                 textAlign: 'center'
               }}>
                 <p style={{ 
                   color: '#059669', 
                   fontSize: '0.875rem', 
                   fontWeight: '500',
                   margin: 0
                 }}>
                   ✅ File contains both Math and Reading scores. Will be processed together.
                 </p>
               </div>
             )}

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
                   color: '#374151'
                 }}
               >
                 <option value="">Select a teacher...</option>
                 {teachers.map((teacher) => (
                   <option key={teacher.id} value={`${teacher.name} - ${teacher.grade} - ${teacher.className}`}>
                     {teacher.name} - {teacher.grade} - {teacher.className}
                   </option>
                 ))}
               </select>
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
                   { label: 'Student_ID', desc: 'Student identifier (1, 2, 3, etc.)' },
                   { label: 'Scores or Grade', desc: 'Number between 0-100' }
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
            </div>
            
            <div>
              <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>Validation Rules:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                 {[
                   'Scores must be between 0 and 100',
                   'Student_ID must be a valid number',
                   'File must have Student_ID and Scores/Grade columns',
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
         {uploadedData.length > 0 && (
           <div style={{
             backgroundColor: 'white',
             borderRadius: '1rem',
             padding: '1.5rem',
             boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
             border: '1px solid #f3f4f6',
             marginTop: '2rem'
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
               <Upload style={{ width: '1.25rem', height: '1.25rem', color: '#10B981' }} />
               Uploaded Data ({uploadedData.length} uploads)
             </h3>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {uploadedData.map((upload, index) => (
                 <div key={upload.id} style={{
                   padding: '1rem',
                   backgroundColor: '#F8FAFC',
                   borderRadius: '0.75rem',
                   border: '1px solid #E2E8F0'
                 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                     <div style={{ fontWeight: '600', color: '#111827' }}>
                       {upload.teacherName} - {upload.grade}
                     </div>
                     <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                       {new Date(upload.uploadTime).toLocaleString()}
                     </div>
                   </div>
                   <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                     {upload.totalStudents} students • Average: {upload.averageScore}%
                   </div>
                 </div>
               ))}
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

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
