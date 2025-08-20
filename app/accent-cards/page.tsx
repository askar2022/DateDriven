'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/radix/Button'
import { AccentCard, AccentCardContent } from '@/components/ui/radix/AccentCard'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/radix/Dialog'
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Award, 
  Calendar,
  BookOpen,
  Calculator,
  GraduationCap,
  Target,
  AlertTriangle,
  CheckCircle,
  Upload,
  Download,
  Eye,
  Plus,
  Search,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AccentCardsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Sample data for different types of cards
  const overviewCards = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Can't find your student roster?",
      subtitle: "Upload your class lists to get started with performance tracking",
      badge: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Upload className="h-3 w-3 mr-1" />
        Upload Class List
      </span>,
      action: <Button variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Students
      </Button>,
      accentColor: 'cyan' as const
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-green-600" />,
      title: "Ready to view performance analytics?",
      subtitle: "Comprehensive dashboards showing Math and Reading progress",
      badge: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        156 Students Active
      </span>,
      action: <Button variant="outline" size="sm">
        <Eye className="h-4 w-4 mr-2" />
        View Dashboard
      </Button>,
      accentColor: 'green' as const
    },
    {
      icon: <Calendar className="h-6 w-6 text-purple-600" />,
      title: "Need to upload weekly scores?",
      subtitle: "Import Excel files with Math and Reading assessment data",
      badge: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        <Calendar className="h-3 w-3 mr-1" />
        Week of Feb 19
      </span>,
      action: <Button variant="outline" size="sm">
        <Upload className="h-4 w-4 mr-2" />
        Upload Scores
      </Button>,
      accentColor: 'purple' as const
    }
  ]

  const classroomCards = [
    {
      icon: <GraduationCap className="h-6 w-6 text-blue-600" />,
      title: "Grade 3-A Performance Review",
      subtitle: "Ms. Johnson • 24 students • Math: 82% | Reading: 85%",
      badge: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <TrendingUp className="h-3 w-3 mr-1" />
        +3.2% Growth
      </span>,
      action: <Button variant="outline" size="sm">
        <ExternalLink className="h-4 w-4 mr-2" />
        View Details
      </Button>,
      accentColor: 'blue' as const
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-orange-600" />,
      title: "Grade 4-B Needs Attention",
      subtitle: "Mr. Wilson • 25 students • Math: 75% | Reading: 79%",
      badge: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        <AlertTriangle className="h-3 w-3 mr-1" />
        15% Gray Tier
      </span>,
      action: <Button variant="outline" size="sm">
        <Target className="h-4 w-4 mr-2" />
        Create Plan
      </Button>,
      accentColor: 'orange' as const
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-green-600" />,
      title: "Grade 5-A Excellent Progress",
      subtitle: "Ms. Brown • 27 students • Math: 84% | Reading: 87%",
      badge: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Award className="h-3 w-3 mr-1" />
        Top Performing
      </span>,
      action: <Button variant="outline" size="sm">
        <Award className="h-4 w-4 mr-2" />
        Celebrate
      </Button>,
      accentColor: 'green' as const
    }
  ]

  const studentCards = [
    {
      icon: <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">EJ</div>,
      title: "Emma Johnson - Outstanding Performance",
      subtitle: "Grade 5 • Math: 95% | Reading: 92% • Consistent Green Tier",
      badge: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <TrendingUp className="h-3 w-3 mr-1" />
        +7% This Week
      </span>,
      action: <Button variant="outline" size="sm">
        <Eye className="h-4 w-4 mr-2" />
        Profile
      </Button>,
      accentColor: 'green' as const
    },
    {
      icon: <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">NT</div>,
      title: "Noah Thompson - Needs Support",
      subtitle: "Grade 3 • Math: 65% | Reading: 68% • Requires Intervention",
      badge: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Red Tier Alert
      </span>,
      action: <Button variant="outline" size="sm">
        <Target className="h-4 w-4 mr-2" />
        Support Plan
      </Button>,
      accentColor: 'red' as const
    },
    {
      icon: <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">SC</div>,
      title: "Sophia Chen - Strong Reader",
      subtitle: "Grade 3 • Math: 88% | Reading: 90% • Excellent Progress",
      badge: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <BookOpen className="h-3 w-3 mr-1" />
        Reading Star
      </span>,
      action: <Button variant="outline" size="sm">
        <Award className="h-4 w-4 mr-2" />
        Recognize
      </Button>,
      accentColor: 'blue' as const
    }
  ]

  const quickActions = [
    {
      icon: <Upload className="h-6 w-6 text-blue-600" />,
      title: "Upload new assessment data",
      subtitle: "Import Excel files with weekly Math and Reading scores",
      action: <Button variant="primary" size="sm">
        <Upload className="h-4 w-4 mr-2" />
        Upload
      </Button>,
      accentColor: 'blue' as const
    },
    {
      icon: <Download className="h-6 w-6 text-green-600" />,
      title: "Generate weekly reports",
      subtitle: "Export performance summaries for administration",
      action: <Button variant="primary" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Generate
      </Button>,
      accentColor: 'green' as const
    },
    {
      icon: <Search className="h-6 w-6 text-purple-600" />,
      title: "Find students needing support",
      subtitle: "Identify students in Red or Gray performance tiers",
      action: <Button variant="primary" size="sm">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>,
      accentColor: 'purple' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Performance Center</h1>
            <p className="text-lg text-gray-600">
              Clean, organized cards for managing student analytics
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        {/* Quick Overview Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
          <div className="space-y-4">
            {overviewCards.map((card, index) => (
              <AccentCard key={index} accentColor={card.accentColor}>
                <AccentCardContent
                  icon={card.icon}
                  title={card.title}
                  subtitle={card.subtitle}
                  badge={card.badge}
                  action={card.action}
                />
              </AccentCard>
            ))}
          </div>
        </div>

        {/* Classroom Performance Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Classroom Insights</h2>
          <div className="space-y-4">
            {classroomCards.map((card, index) => (
              <AccentCard key={index} accentColor={card.accentColor}>
                <AccentCardContent
                  icon={card.icon}
                  title={card.title}
                  subtitle={card.subtitle}
                  badge={card.badge}
                  action={card.action}
                />
              </AccentCard>
            ))}
          </div>
        </div>

        {/* Student Highlights */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Student Highlights</h2>
          <div className="space-y-4">
            {studentCards.map((card, index) => (
              <AccentCard key={index} accentColor={card.accentColor}>
                <AccentCardContent
                  icon={card.icon}
                  title={card.title}
                  subtitle={card.subtitle}
                  badge={card.badge}
                  action={card.action}
                />
              </AccentCard>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <AccentCard key={index} accentColor={action.accentColor}>
                <AccentCardContent
                  icon={action.icon}
                  title={action.title}
                  subtitle={action.subtitle}
                  action={action.action}
                />
              </AccentCard>
            ))}
          </div>
        </div>

        {/* Sample Interactive Card */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Interactive Example</h2>
          <AccentCard accentColor="cyan">
            <AccentCardContent
              icon={<Search className="h-6 w-6 text-cyan-600" />}
              title="Can't find your student data?"
              subtitle="Search through all student records or upload new assessment files"
              badge={
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                    <Users className="h-3 w-3 mr-1" />
                    156 Students
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Calendar className="h-3 w-3 mr-1" />
                    Updated Today
                  </span>
                </div>
              }
              action={
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Explore
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Student Data Explorer</DialogTitle>
                      <DialogDescription>
                        Search and filter through all student performance data
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Search Students</label>
                          <input 
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter student name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Grade Level</label>
                            <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                              <option>All Grades</option>
                              <option>Grade 3</option>
                              <option>Grade 4</option>
                              <option>Grade 5</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Performance Tier</label>
                            <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                              <option>All Tiers</option>
                              <option>Green (85%+)</option>
                              <option>Orange (75-84%)</option>
                              <option>Red (65-74%)</option>
                              <option>Gray (&lt;65%)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              }
            />
          </AccentCard>
        </div>
      </div>
    </div>
  )
}
