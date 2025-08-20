'use client'

import { useState } from 'react'
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
}

export default function BeautifulUploadPage() {
  const { data: session } = useSession()
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)

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
            You don't have permission to upload files.
          </p>
        </div>
      </div>
    )
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Mock upload for testing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockResult = {
        success: true,
        processedCount: 18,
        errors: [],
        unmatchedStudents: [
          { name: "Emily Chen", grade: "Grade 4", classroom: "4-B" },
          { name: "Marcus Johnson", grade: "Grade 3", classroom: "3-A" }
        ]
      }
      
      setResult(mockResult)
    } catch (error) {
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
    },
    maxFiles: 1,
  })

  const downloadTemplate = () => {
    // Mock template download
    alert('Template download would start here!\nIn real implementation, this would download an Excel template.')
  }

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
                        Supports .xlsx and .xls files (Max 10MB)
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
                  { label: 'WeekStart', desc: 'Date (YYYY-MM-DD format)' },
                  { label: 'ClassroomCode', desc: 'G3-A, G4-B, G5-A, etc.' },
                  { label: 'Subject', desc: 'Math or Reading' },
                  { label: 'StudentName', desc: 'Full student name' },
                  { label: 'GradeLevel', desc: 'Grade 3, Grade 4, Grade 5' },
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
            </div>
            
            <div>
              <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>Validation Rules:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {[
                  'Scores must be between 0 and 100',
                  'Subject must be "Math" or "Reading"',
                  'Grade levels: 3, 4, or 5 only',
                  'WeekStart adjusted to Monday automatically'
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
                <p style={{ 
                  color: '#166534', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                  Successfully processed {result.processedCount} scores
                </p>
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
