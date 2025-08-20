'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Users,
  Calendar
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default function SimpleUploadPage() {
  const { data: session } = useSession()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Mock session for testing
  const mockSession = { user: { name: 'Demo User', role: 'TEACHER' } }
  const currentSession = session || mockSession

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Upload className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h1>
          <p className="text-gray-600">Sign in to upload weekly scores.</p>
        </div>
      </div>
    )
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadStatus('idle')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false)
      setUploadStatus('success')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Weekly Scores</h1>
          <p className="text-lg text-gray-600">
            Upload Excel files containing student assessment data
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Upload Status */}
        {uploadStatus === 'success' && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-900">Upload Successful!</div>
              <div className="text-sm text-green-700">
                {selectedFile?.name} has been processed and added to the system.
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Upload Area */}
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Select Excel File
            </h2>

            {/* File Drop Zone */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">
                Drop your Excel file here, or click to browse
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Supported formats: .xlsx, .xls (Max 10MB)
              </div>
              
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Choose File
              </label>
            </div>

            {/* Selected File */}
            {selectedFile && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">{selectedFile.name}</div>
                      <div className="text-sm text-blue-700">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <Badge variant="blue" size="sm">Ready</Badge>
                </div>
                
                <button
                  onClick={handleUpload}
                  disabled={isUploading || uploadStatus === 'success'}
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : uploadStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Uploaded Successfully
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload File
                    </>
                  )}
                </button>
              </div>
            )}
          </Card>

          {/* Instructions & Template */}
          <div className="space-y-6">
            
            {/* Download Template */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Download className="h-5 w-5" />
                Excel Template
              </h3>
              <p className="text-gray-600 mb-4">
                Download our Excel template to ensure your data is formatted correctly.
              </p>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </button>
            </Card>

            {/* Upload Guidelines */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Guidelines</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Include student ID, subject, and score columns</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Scores should be between 0-100</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Use week dates in YYYY-MM-DD format</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Remove any empty rows at the end</span>
                </div>
              </div>
            </Card>

            {/* Recent Uploads */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Uploads
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Math_Week_Aug19.xlsx</div>
                    <div className="text-sm text-gray-600">2 hours ago</div>
                  </div>
                  <Badge variant="green" size="sm">Processed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Reading_Week_Aug19.xlsx</div>
                    <div className="text-sm text-gray-600">1 day ago</div>
                  </div>
                  <Badge variant="green" size="sm">Processed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Math_Week_Aug12.xlsx</div>
                    <div className="text-sm text-gray-600">1 week ago</div>
                  </div>
                  <Badge variant="green" size="sm">Processed</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
