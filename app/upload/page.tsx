'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react'
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

export default function UploadPage() {
  const { data: session } = useSession()
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [selectedGrade, setSelectedGrade] = useState('Grade 3')
  const [selectedTeacher, setSelectedTeacher] = useState('Mrs. Taylor')
  const [selectedClass, setSelectedClass] = useState('3-A')
  const [selectedSubject, setSelectedSubject] = useState('Math')

  // Temporary: Skip authentication for testing
  const mockSession = {
    user: {
      name: 'Demo User',
      email: 'demo@school.edu',
      role: 'STAFF' // Allow upload access for testing
    }
  }

  // Use mock session for testing
  const currentSession = session || mockSession
  const userRole = (currentSession?.user as any)?.role

  // Check permissions
  if (!currentSession || !['TEACHER', 'STAFF', 'LEADER'].includes(userRole)) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to upload files.</p>
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
       formData.append('grade', selectedGrade)
       formData.append('teacherName', selectedTeacher)
       formData.append('class', selectedClass)
       formData.append('subject', selectedSubject)

       console.log('=== UPLOAD DEBUG ===')
       console.log('Selected grade:', selectedGrade)
       console.log('Selected teacher:', selectedTeacher)
       console.log('Selected class:', selectedClass)
       console.log('Selected subject:', selectedSubject)
       console.log('FormData entries:')
       for (const [key, value] of formData.entries()) {
         console.log(`${key}:`, value)
       }

      // Real API call
      const response = await fetch('/api/upload/weekly-scores', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setResult(data)
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
    // Create a simple template for demonstration
    const link = document.createElement('a')
    link.href = '/weekly_scores_template.csv'
    link.download = 'weekly_scores_template.csv'
    link.click()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Weekly Scores</h1>
        <p className="text-gray-600">
          Upload Excel files containing Math and Reading scores for your students.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Upload File</h2>
          
                     {/* Grade, Class, Subject, and Teacher Selection */}
           <div className="mb-6 space-y-4" style={{ border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#f9fafb' }}>
             <h3 style={{ marginBottom: '1rem', fontWeight: 'bold', color: '#374151' }}>📋 Select Upload Options:</h3>
             <div>
               <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                 Select Grade
               </label>
               <select
                 id="grade"
                 value={selectedGrade}
                 onChange={(e) => setSelectedGrade(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
               >
                 <option value="Grade 3">Grade 3</option>
                 <option value="Grade 4">Grade 4</option>
                 <option value="Grade 5">Grade 5</option>
               </select>
             </div>
             
             <div>
               <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                 Select Class
               </label>
               <select
                 id="class"
                 value={selectedClass}
                 onChange={(e) => setSelectedClass(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
               >
                 <option value="3-A">Class 3-A</option>
                 <option value="3-B">Class 3-B</option>
                 <option value="4-A">Class 4-A</option>
                 <option value="4-B">Class 4-B</option>
                 <option value="5-A">Class 5-A</option>
                 <option value="5-B">Class 5-B</option>
               </select>
             </div>
             
             <div>
               <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                 Select Subject
               </label>
               <select
                 id="subject"
                 value={selectedSubject}
                 onChange={(e) => {
                   console.log('Subject changed from', selectedSubject, 'to', e.target.value)
                   setSelectedSubject(e.target.value)
                 }}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
               >
                 <option value="Math">Math</option>
                 <option value="Reading">Reading</option>
               </select>
             </div>
             
             <div>
               <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-2">
                 Select Teacher
               </label>
               <select
                 id="teacher"
                 value={selectedTeacher}
                 onChange={(e) => setSelectedTeacher(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
               >
                 <option value="Mrs. Taylor">Mrs. Taylor - Grade 4</option>
                 <option value="Ms. Johnson">Ms. Johnson - Grade 3</option>
                 <option value="Ms. Brown">Ms. Brown - Grade 5</option>
               </select>
             </div>
           </div>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {uploading ? (
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Processing file...</p>
              </div>
            ) : isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the Excel file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag and drop an Excel file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports .xlsx and .xls files
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={downloadTemplate}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </button>
          </div>
        </div>

        {/* Template Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Excel Template Format</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Required Columns:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><span className="font-medium">WeekStart:</span> Date (YYYY-MM-DD format)</li>
                <li><span className="font-medium">ClassroomCode:</span> G3-A, G3-B, G4-A, etc.</li>
                <li><span className="font-medium">Subject:</span> Math or Reading</li>
                <li><span className="font-medium">StudentName:</span> Full student name</li>
                <li><span className="font-medium">StudentID:</span> Optional student ID</li>
                <li><span className="font-medium">GradeLevel:</span> Grade 3, Grade 4, Grade 5</li>
                <li><span className="font-medium">Score:</span> Number between 0-100</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Validation Rules:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Scores must be between 0 and 100</li>
                <li>• Subject must be "Math" or "Reading"</li>
                <li>• WeekStart will be adjusted to Monday</li>
                <li>• Student matching by ID first, then by name</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="mt-8 card">
          <div className="flex items-center space-x-2 mb-4">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600" />
            )}
            <h2 className="text-xl font-semibold">
              {result.success ? 'Upload Successful' : 'Upload Issues'}
            </h2>
          </div>

          {result.processedCount > 0 && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Successfully processed {result.processedCount} scores
              </p>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-red-800 mb-2">Errors:</h3>
              <div className="bg-red-50 rounded-lg p-4">
                <ul className="text-red-700 text-sm space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {result.unmatchedStudents.length > 0 && (
            <div>
              <h3 className="font-medium text-orange-800 mb-2">
                Unmatched Students ({result.unmatchedStudents.length}):
              </h3>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-orange-700 text-sm space-y-1">
                  {result.unmatchedStudents.map((student, index) => (
                    <div key={index}>
                      • {student.name} ({student.grade}, {student.classroom})
                    </div>
                  ))}
                </div>
                <p className="text-orange-600 text-sm mt-2">
                  These students need to be added to the roster or their names corrected.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Copyright Footer */}
      <div className="text-center py-8 mt-12 border-t border-gray-200">
        <p className="text-gray-500 text-sm">
          © 2025 Analytics by Dr. Askar. All rights reserved.
        </p>
      </div>
    </div>
  )
}
