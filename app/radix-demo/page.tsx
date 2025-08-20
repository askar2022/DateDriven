'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/radix/Button'
import { Progress } from '@/components/ui/radix/Progress'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/radix/Select'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/radix/Dialog'
import { StudentPerformanceCard } from '@/components/StudentPerformanceCard'
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Award, 
  Upload,
  Download,
  Filter,
  Plus
} from 'lucide-react'

export default function RadixDemoPage() {
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')

  // Sample student data
  const students = [
    {
      id: 'S001',
      name: 'Alex Johnson',
      grade: 'Grade 5',
      mathScore: 92,
      readingScore: 88,
      trend: 'up' as const,
      trendValue: 5
    },
    {
      id: 'S002', 
      name: 'Sarah Chen',
      grade: 'Grade 4',
      mathScore: 78,
      readingScore: 85,
      trend: 'up' as const,
      trendValue: 3
    },
    {
      id: 'S003',
      name: 'Marcus Davis',
      grade: 'Grade 3',
      mathScore: 65,
      readingScore: 72,
      trend: 'down' as const,
      trendValue: 2
    },
    {
      id: 'S004',
      name: 'Emma Wilson',
      grade: 'Grade 5',
      mathScore: 95,
      readingScore: 93,
      trend: 'up' as const,
      trendValue: 7
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Radix UI Demo</h1>
              <p className="text-lg text-gray-600">
                Beautiful, accessible components for Student Performance Analytics
              </p>
            </div>
            
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Student Data</DialogTitle>
                    <DialogDescription>
                      Upload your weekly assessment data in Excel format.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600">Drag and drop your Excel file here</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="primary">Upload</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">156</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">+12.3%</div>
            <div className="text-sm text-gray-600">Growth Rate</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">78.4%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">24</div>
            <div className="text-sm text-gray-600">Top Performers</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Filters:</span>
            </div>
            
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Grade 3</SelectItem>
                <SelectItem value="4">Grade 4</SelectItem>
                <SelectItem value="5">Grade 5</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Progress Showcase */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Subject Performance Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-900">Mathematics</span>
                <span className="text-sm font-semibold text-gray-600">78% average</span>
              </div>
              <Progress value={78} color="blue" className="h-3 mb-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>121 students proficient</span>
                <span>156 total</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-900">Reading</span>
                <span className="text-sm font-semibold text-gray-600">85% average</span>
              </div>
              <Progress value={85} color="green" className="h-3 mb-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>133 students proficient</span>
                <span>156 total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Cards */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Student Performance</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="primary" size="sm">
                View All
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {students.map((student) => (
              <StudentPerformanceCard key={student.id} student={student} />
            ))}
          </div>
        </div>

        {/* Button Showcase */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Button Variants</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Button variant="default">Default</Button>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
