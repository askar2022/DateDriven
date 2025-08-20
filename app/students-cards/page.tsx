'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/radix/Button'
import { Progress } from '@/components/ui/radix/Progress'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/radix/Card'
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
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  MoreHorizontal,
  Award,
  AlertTriangle,
  BookOpen,
  Calculator,
  GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StudentsCardsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedTier, setSelectedTier] = useState('all')

  // Sample student data
  const students = [
    {
      id: 'S001',
      name: 'Emma Johnson',
      grade: 'Grade 5',
      classroom: 'G5-A',
      teacher: 'Ms. Brown',
      mathScore: 95,
      readingScore: 92,
      lastAssessment: '2024-02-19',
      trend: 'up',
      trendValue: 7,
      avatar: 'EJ'
    },
    {
      id: 'S002',
      name: 'Marcus Davis',
      grade: 'Grade 4',
      classroom: 'G4-B',
      teacher: 'Mr. Wilson',
      mathScore: 78,
      readingScore: 84,
      lastAssessment: '2024-02-19',
      trend: 'up',
      trendValue: 3,
      avatar: 'MD'
    },
    {
      id: 'S003',
      name: 'Sophia Chen',
      grade: 'Grade 3',
      classroom: 'G3-A',
      teacher: 'Ms. Johnson',
      mathScore: 88,
      readingScore: 90,
      lastAssessment: '2024-02-19',
      trend: 'up',
      trendValue: 5,
      avatar: 'SC'
    },
    {
      id: 'S004',
      name: 'Liam Rodriguez',
      grade: 'Grade 5',
      classroom: 'G5-B',
      teacher: 'Mrs. Taylor',
      mathScore: 82,
      readingScore: 79,
      lastAssessment: '2024-02-19',
      trend: 'down',
      trendValue: 2,
      avatar: 'LR'
    },
    {
      id: 'S005',
      name: 'Ava Williams',
      grade: 'Grade 4',
      classroom: 'G4-A',
      teacher: 'Mrs. Davis',
      mathScore: 91,
      readingScore: 94,
      lastAssessment: '2024-02-19',
      trend: 'up',
      trendValue: 8,
      avatar: 'AW'
    },
    {
      id: 'S006',
      name: 'Noah Thompson',
      grade: 'Grade 3',
      classroom: 'G3-B',
      teacher: 'Mr. Smith',
      mathScore: 65,
      readingScore: 68,
      lastAssessment: '2024-02-19',
      trend: 'down',
      trendValue: 4,
      avatar: 'NT'
    },
    {
      id: 'S007',
      name: 'Isabella Garcia',
      grade: 'Grade 5',
      classroom: 'G5-A',
      teacher: 'Ms. Brown',
      mathScore: 97,
      readingScore: 96,
      lastAssessment: '2024-02-19',
      trend: 'up',
      trendValue: 6,
      avatar: 'IG'
    },
    {
      id: 'S008',
      name: 'Ethan Lee',
      grade: 'Grade 4',
      classroom: 'G4-B',
      teacher: 'Mr. Wilson',
      mathScore: 74,
      readingScore: 77,
      lastAssessment: '2024-02-19',
      trend: 'up',
      trendValue: 2,
      avatar: 'EL'
    }
  ]

  const getTierColor = (score: number) => {
    if (score >= 85) return { color: 'green', label: 'Green', bg: 'bg-green-100', text: 'text-green-800' }
    if (score >= 75) return { color: 'orange', label: 'Orange', bg: 'bg-orange-100', text: 'text-orange-800' }
    if (score >= 65) return { color: 'red', label: 'Red', bg: 'bg-red-100', text: 'text-red-800' }
    return { color: 'purple', label: 'Gray', bg: 'bg-purple-100', text: 'text-purple-800' }
  }

  const getOverallTier = (mathScore: number, readingScore: number) => {
    const avg = (mathScore + readingScore) / 2
    return getTierColor(avg)
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade = selectedGrade === 'all' || student.grade.includes(selectedGrade)
    const matchesTier = selectedTier === 'all' || getOverallTier(student.mathScore, student.readingScore).label === selectedTier
    
    return matchesSearch && matchesGrade && matchesTier
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Management</h1>
              <p className="text-lg text-gray-600">
                View and manage student performance data
              </p>
            </div>
            
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                      Enter student information to add them to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Student Name</label>
                      <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter full name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Student ID</label>
                      <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter student ID" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Grade</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">Grade 3</SelectItem>
                            <SelectItem value="4">Grade 4</SelectItem>
                            <SelectItem value="5">Grade 5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Classroom</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select classroom" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="G3-A">G3-A</SelectItem>
                            <SelectItem value="G3-B">G3-B</SelectItem>
                            <SelectItem value="G4-A">G4-A</SelectItem>
                            <SelectItem value="G4-B">G4-B</SelectItem>
                            <SelectItem value="G5-A">G5-A</SelectItem>
                            <SelectItem value="G5-B">G5-B</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="primary">Add Student</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="3">Grade 3</SelectItem>
                    <SelectItem value="4">Grade 4</SelectItem>
                    <SelectItem value="5">Grade 5</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="Green">Green Tier</SelectItem>
                    <SelectItem value="Orange">Orange Tier</SelectItem>
                    <SelectItem value="Red">Red Tier</SelectItem>
                    <SelectItem value="Gray">Gray Tier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student) => {
            const mathTier = getTierColor(student.mathScore)
            const readingTier = getTierColor(student.readingScore)
            const overallTier = getOverallTier(student.mathScore, student.readingScore)
            
            return (
              <Card key={student.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {student.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <CardDescription>{student.id} • {student.grade}</CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {student.trend === 'up' ? (
                        <div className="flex items-center text-green-600 text-sm">
                          <TrendingUp className="h-4 w-4" />
                          <span className="ml-1">+{student.trendValue}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600 text-sm">
                          <TrendingDown className="h-4 w-4" />
                          <span className="ml-1">-{student.trendValue}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Classroom Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>{student.classroom} - {student.teacher}</span>
                  </div>

                  {/* Performance Scores */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Mathematics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', mathTier.bg, mathTier.text)}>
                            {mathTier.label}
                          </span>
                          <span className="font-semibold">{student.mathScore}%</span>
                        </div>
                      </div>
                      <Progress value={student.mathScore} color={mathTier.color as any} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Reading</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', readingTier.bg, readingTier.text)}>
                            {readingTier.label}
                          </span>
                          <span className="font-semibold">{student.readingScore}%</span>
                        </div>
                      </div>
                      <Progress value={student.readingScore} color={readingTier.color as any} className="h-2" />
                    </div>
                  </div>

                  {/* Overall Performance */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Overall Performance</span>
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', overallTier.bg, overallTier.text)}>
                          {overallTier.label} Tier
                        </span>
                        <span className="font-bold">{Math.round((student.mathScore + student.readingScore) / 2)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2 pt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{student.name} - Detailed Performance</DialogTitle>
                        <DialogDescription>
                          Comprehensive performance analytics and trends
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="text-center p-6 bg-blue-50 rounded-lg">
                            <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-600">{student.mathScore}%</div>
                            <div className="text-sm text-gray-600">Mathematics</div>
                            <div className={cn('inline-block px-2 py-1 rounded-full text-xs font-medium mt-2', mathTier.bg, mathTier.text)}>
                              {mathTier.label} Tier
                            </div>
                          </div>
                          <div className="text-center p-6 bg-green-50 rounded-lg">
                            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-600">{student.readingScore}%</div>
                            <div className="text-sm text-gray-600">Reading</div>
                            <div className={cn('inline-block px-2 py-1 rounded-full text-xs font-medium mt-2', readingTier.bg, readingTier.text)}>
                              {readingTier.label} Tier
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-gray-900">{student.grade}</div>
                            <div className="text-sm text-gray-600">Grade Level</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">{student.classroom}</div>
                            <div className="text-sm text-gray-600">Classroom</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">{student.teacher}</div>
                            <div className="text-sm text-gray-600">Teacher</div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Results Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Showing {filteredStudents.length} of {students.length} students</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Export PDF</Button>
                <Button variant="outline" size="sm">Export Excel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
