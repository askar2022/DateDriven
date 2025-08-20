// Mock data service for demo purposes
export const mockData = {
  // Dashboard summary stats
  summary: {
    totalStudents: 156,
    weeklyAssessments: 24,
    averageScore: 78.4,
    improvementRate: 12.3
  },

  // Performance by tier
  tierDistribution: [
    {
      subject: "MATH",
      green: 45,
      orange: 38,
      red: 22,
      gray: 8,
      total: 113
    },
    {
      subject: "READING", 
      green: 52,
      orange: 34,
      red: 18,
      gray: 9,
      total: 113
    }
  ],

  // Weekly trends (last 8 weeks)
  weeklyTrends: [
    { week: "2024-01-01", math: 75.2, reading: 77.8 },
    { week: "2024-01-08", math: 76.1, reading: 78.3 },
    { week: "2024-01-15", math: 74.8, reading: 79.1 },
    { week: "2024-01-22", math: 77.3, reading: 80.2 },
    { week: "2024-01-29", math: 78.1, reading: 81.0 },
    { week: "2024-02-05", math: 79.2, reading: 80.5 },
    { week: "2024-02-12", math: 78.7, reading: 82.1 },
    { week: "2024-02-19", math: 80.3, reading: 83.4 }
  ],

  // Classroom performance
  classroomPerformance: [
    {
      classroom: "G3-A",
      grade: "Grade 3", 
      mathAverage: 82.5,
      readingAverage: 85.1,
      studentCount: 24,
      teacher: "Ms. Johnson",
      trend: "+3.2%"
    },
    {
      classroom: "G3-B",
      grade: "Grade 3",
      mathAverage: 79.3,
      readingAverage: 81.7,
      studentCount: 23,
      teacher: "Mr. Smith", 
      trend: "+1.8%"
    },
    {
      classroom: "G4-A", 
      grade: "Grade 4",
      mathAverage: 77.8,
      readingAverage: 83.2,
      studentCount: 26,
      teacher: "Mrs. Davis",
      trend: "-0.5%"
    },
    {
      classroom: "G4-B",
      grade: "Grade 4", 
      mathAverage: 75.2,
      readingAverage: 78.9,
      studentCount: 25,
      teacher: "Mr. Wilson",
      trend: "+2.1%"
    },
    {
      classroom: "G5-A",
      grade: "Grade 5",
      mathAverage: 84.1,
      readingAverage: 87.3, 
      studentCount: 27,
      teacher: "Ms. Brown",
      trend: "+4.7%"
    },
    {
      classroom: "G5-B",
      grade: "Grade 5",
      mathAverage: 81.6,
      readingAverage: 84.8,
      studentCount: 26,
      teacher: "Mrs. Taylor",
      trend: "+2.9%"
    }
  ],

  // Recent activities for activity feed
  recentActivities: [
    {
      id: 1,
      type: "upload",
      message: "Ms. Johnson uploaded Math scores for G3-A",
      timestamp: "2 hours ago",
      icon: "upload",
      color: "blue"
    },
    {
      id: 2, 
      type: "achievement",
      message: "G5-A achieved 90% Green tier in Reading",
      timestamp: "4 hours ago",
      icon: "trophy",
      color: "green"
    },
    {
      id: 3,
      type: "alert",
      message: "G4-B needs attention - 15% Gray tier in Math",
      timestamp: "6 hours ago", 
      icon: "alert",
      color: "red"
    },
    {
      id: 4,
      type: "report",
      message: "Weekly report generated for administration",
      timestamp: "1 day ago",
      icon: "document",
      color: "purple"
    }
  ],

  // Top performers (anonymized)
  topPerformers: [
    { id: "S001", grade: "Grade 5", mathScore: 98, readingScore: 96, improvement: "+5" },
    { id: "S042", grade: "Grade 4", mathScore: 95, readingScore: 94, improvement: "+3" },
    { id: "S089", grade: "Grade 3", mathScore: 94, readingScore: 97, improvement: "+7" },
    { id: "S156", grade: "Grade 5", mathScore: 93, readingScore: 95, improvement: "+2" },
    { id: "S023", grade: "Grade 4", mathScore: 92, readingScore: 93, improvement: "+4" }
  ],

  // Students needing support (anonymized)
  needsSupport: [
    { id: "S078", grade: "Grade 3", mathScore: 58, readingScore: 62, decline: "-3" },
    { id: "S134", grade: "Grade 4", mathScore: 61, readingScore: 59, decline: "-5" },
    { id: "S045", grade: "Grade 5", mathScore: 64, readingScore: 66, decline: "-2" },
    { id: "S098", grade: "Grade 3", mathScore: 59, readingScore: 61, decline: "-4" }
  ]
}

// Helper functions
export function getTierColor(score: number): string {
  if (score >= 85) return "text-green-600 bg-green-50 border-green-200"
  if (score >= 75) return "text-orange-600 bg-orange-50 border-orange-200" 
  if (score >= 65) return "text-red-600 bg-red-50 border-red-200"
  return "text-gray-600 bg-gray-50 border-gray-200"
}

export function getTierLabel(score: number): string {
  if (score >= 85) return "Green"
  if (score >= 75) return "Orange"
  if (score >= 65) return "Red" 
  return "Gray"
}

export function getIconForActivity(type: string): string {
  switch (type) {
    case "upload": return "📁"
    case "achievement": return "🏆"
    case "alert": return "⚠️"
    case "report": return "📊"
    default: return "📋"
  }
}
