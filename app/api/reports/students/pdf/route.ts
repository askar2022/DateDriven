import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'

interface StudentScore {
  score: number
  tier: string
  tierColor: string
}

interface Student {
  studentId: string
  studentName: string
  grade: string
  className: string
  weekNumber: number
  scores: {
    math?: StudentScore
    reading?: StudentScore
  }
  overallScore: number | null
  overallTier: string | null
  overallTierColor: string | null
}

interface StudentReportData {
  students: Student[]
  summary: {
    totalStudents: number
    averageScore: number
    aboveThreshold: number
    belowThreshold: number
    threshold: number
  }
  filters: {
    grade: string | null
    className: string | null
    subject: string
    minScore: string | null
    week: number
    weekLabel: string
  }
  upload: {
    teacherName: string
    uploadTime: string
    weekLabel: string
  }
}

async function loadUploadedData(): Promise<any[]> {
  try {
    // Use the same data source as the page - Supabase via API
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/upload/weekly-scores`)
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }
    const data = await response.json()
    return data.uploads || []
  } catch (error) {
    console.error('Error loading uploaded data:', error)
    return []
  }
}

function getTierLabel(score: number): string {
  if (score >= 85) return "Green"
  if (score >= 75) return "Orange"
  if (score >= 65) return "Red"
  return "Gray"
}

function getTierColor(score: number): string {
  if (score >= 85) return "green"
  if (score >= 75) return "orange"
  if (score >= 65) return "red"
  return "gray"
}

function getTierBadgeStyle(tierColor: string): string {
  switch (tierColor) {
    case 'green': 
      return 'background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0;'
    case 'orange': 
      return 'background-color: #fed7aa; color: #9a3412; border: 1px solid #fdba74;'
    case 'red': 
      return 'background-color: #fecaca; color: #991b1b; border: 1px solid #fca5a5;'
    case 'gray': 
      return 'background-color: #f3f4f6; color: #374151; border: 1px solid #d1d5db;'
    default: 
      return 'background-color: #f3f4f6; color: #374151; border: 1px solid #d1d5db;'
  }
}

async function generateStudentReportData(filters: any): Promise<StudentReportData | null> {
  let uploads = await loadUploadedData()
  
  // Filter by teacher role for privacy
  if (filters.userRole === 'TEACHER' && filters.userName) {
    uploads = uploads.filter(upload => upload.teacherName === filters.userName)
  }
  // LEADERs can see all uploads (no filtering needed)
  
  // Additional teacher filter for leaders to view specific classes
  if (filters.userRole === 'LEADER' && filters.teacherFilter) {
    uploads = uploads.filter(upload => upload.teacherName === filters.teacherFilter)
  }
  
  if (uploads.length === 0) {
    return null
  }

  // Get the most recent upload or filter by week
  let targetUpload = uploads[0] // Most recent by default
  if (filters.week) {
    const weekNum = parseInt(filters.week)
    const weekUpload = uploads.find(u => u.weekNumber === weekNum)
    if (weekUpload) targetUpload = weekUpload
  }

  let students = targetUpload.students || []

  // Apply filters
  if (filters.grade) {
    students = students.filter(s => s.grade === filters.grade)
  }
  if (filters.className) {
    students = students.filter(s => s.className === filters.className)
  }
  if (filters.subject && filters.subject !== 'all') {
    students = students.filter(s => s.subject.toLowerCase() === filters.subject.toLowerCase())
  }

  // Group by student ID to show both Math and Reading scores
  const studentMap = new Map()
  
  students.forEach(student => {
    const key = student.studentId
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        studentId: student.studentId,
        studentName: student.studentName,
        grade: student.grade,
        className: student.className,
        weekNumber: student.weekNumber,
        scores: {}
      })
    }
    
    const studentData = studentMap.get(key)
    studentData.scores[student.subject.toLowerCase()] = {
      score: student.score,
      tier: getTierLabel(student.score),
      tierColor: getTierColor(student.score)
    }
  })

  // Convert to array and calculate overall scores
  const processedStudents = Array.from(studentMap.values()).map(student => {
    const mathScore = student.scores.math?.score || null
    const readingScore = student.scores.reading?.score || null
    
    let overallScore: number | null = null
    if (mathScore !== null && readingScore !== null) {
      overallScore = (mathScore + readingScore) / 2
    } else if (mathScore !== null) {
      overallScore = mathScore
    } else if (readingScore !== null) {
      overallScore = readingScore
    }

    return {
      ...student,
      overallScore,
      overallTier: overallScore ? getTierLabel(overallScore) : null,
      overallTierColor: overallScore ? getTierColor(overallScore) : null
    }
  })

  // Apply minimum score filter
  let filteredStudents = processedStudents
  if (filters.minScore) {
    const threshold = parseFloat(filters.minScore)
    filteredStudents = processedStudents.filter(student => 
      student.overallScore !== null && student.overallScore >= threshold
    )
  }

  // Sort by overall score (highest first), then by student ID
  filteredStudents.sort((a, b) => {
    if (a.overallScore !== null && b.overallScore !== null) {
      return b.overallScore - a.overallScore
    }
    if (a.overallScore !== null) return -1
    if (b.overallScore !== null) return 1
    return a.studentId.localeCompare(b.studentId)
  })

  // Calculate summary statistics
  const validScores = processedStudents.filter(s => s.overallScore !== null)
  const averageScore = validScores.length > 0 
    ? validScores.reduce((sum, s) => sum + s.overallScore!, 0) / validScores.length 
    : 0

  const threshold = filters.minScore ? parseFloat(filters.minScore) : 85
  const aboveThreshold = validScores.filter(s => s.overallScore! >= threshold).length
  const belowThreshold = validScores.filter(s => s.overallScore! < threshold).length

  return {
    students: filteredStudents,
    summary: {
      totalStudents: processedStudents.length,
      averageScore: Math.round(averageScore * 10) / 10,
      aboveThreshold,
      belowThreshold,
      threshold
    },
    filters: {
      grade: targetUpload.grade,
      className: targetUpload.className,
      subject: filters.subject || 'all',
      minScore: filters.minScore || null,
      week: targetUpload.weekNumber,
      weekLabel: targetUpload.weekLabel
    },
    upload: {
      teacherName: targetUpload.teacherName,
      uploadTime: targetUpload.uploadTime,
      weekLabel: targetUpload.weekLabel
    }
  }
}

function generateHTML(data: StudentReportData): string {
  const highPerformers = data.students.filter(s => s.overallScore !== null && s.overallScore >= 85).slice(0, 10)
  const needsSupport = data.students.filter(s => s.overallScore !== null && s.overallScore < 65).slice(0, 10)
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Individual Student Performance Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            color: #111827;
            line-height: 1.5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 8px;
        }
        .subtitle {
            font-size: 14px;
            color: #6b7280;
        }
        .info-section {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .info-item {
            font-size: 14px;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        .card-value {
            font-size: 28px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 5px;
        }
        .card-label {
            font-size: 14px;
            color: #6b7280;
        }
        .table-container {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        th {
            background-color: #f9fafb;
            padding: 12px 8px;
            text-align: left;
            font-size: 12px;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        td {
            padding: 12px 8px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 14px;
        }
        tr:last-child td {
            border-bottom: none;
        }
        .tier-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
        }
        .insights-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .insight-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .high-performer {
            background-color: #dcfce7;
            color: #166534;
        }
        .needs-support {
            background-color: #fecaca;
            color: #991b1b;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
        }
        .page-break {
            page-break-before: always;
        }
        @media print {
            body {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Individual Student Performance Report</div>
        <div class="subtitle">Detailed analysis for teacher collaboration and student support planning</div>
    </div>

    <div class="info-section">
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Teacher:</span> ${data.upload?.teacherName || 'Mr. Adams'}
            </div>
            <div class="info-item">
                <span class="info-label">Week:</span> ${data.filters?.weekLabel || 'All Weeks'}
            </div>
            <div class="info-item">
                <span class="info-label">Class:</span> ${data.filters?.grade || ''} ${data.filters?.className || ''}
            </div>
            <div class="info-item">
                <span class="info-label">Generated:</span> ${new Date().toLocaleDateString()}
            </div>
            <div class="info-item">
                <span class="info-label">Subject Filter:</span> ${data.filters?.subject === 'all' ? 'All Subjects' : data.filters?.subject || 'All Subjects'}
            </div>
            <div class="info-item">
                <span class="info-label">Min Score Filter:</span> ${data.filters?.minScore || 'None'}
            </div>
        </div>
    </div>

    <div class="summary-cards">
        <div class="card">
            <div class="card-value">${data.summary.totalStudents}</div>
            <div class="card-label">Total Students</div>
        </div>
        <div class="card">
            <div class="card-value">${data.summary.averageScore.toFixed(1)}%</div>
            <div class="card-label">Average Score</div>
        </div>
        <div class="card">
            <div class="card-value">${data.summary.aboveThreshold}</div>
            <div class="card-label">Above ${data.summary.threshold}%</div>
        </div>
        <div class="card">
            <div class="card-value">${data.summary.belowThreshold}</div>
            <div class="card-label">Below ${data.summary.threshold}%</div>
        </div>
    </div>

    <div class="table-container">
        <div class="section-title">Student Performance Details (${data.students.length} students)</div>
        <table>
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Math Score</th>
                    <th>Reading Score</th>
                    <th>Overall Score</th>
                    <th>Performance Tier</th>
                </tr>
            </thead>
            <tbody>
                ${data.students.map(student => `
                    <tr>
                        <td><strong>Student ${student.studentId}</strong></td>
                        <td>
                            ${student.scores.math ? `
                                ${student.scores.math.score}% 
                                <span class="tier-badge" style="${getTierBadgeStyle(student.scores.math.tierColor)}">${student.scores.math.tier}</span>
                            ` : '-'}
                        </td>
                        <td>
                            ${student.scores.reading ? `
                                ${student.scores.reading.score}% 
                                <span class="tier-badge" style="${getTierBadgeStyle(student.scores.reading.tierColor)}">${student.scores.reading.tier}</span>
                            ` : '-'}
                        </td>
                        <td>
                            ${student.overallScore !== null ? `<strong>${student.overallScore.toFixed(1)}%</strong>` : '-'}
                        </td>
                        <td>
                            ${student.overallTier && student.overallTierColor ? `
                                <span class="tier-badge" style="${getTierBadgeStyle(student.overallTierColor)}">${student.overallTier} Tier</span>
                            ` : '-'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    ${data.summary.totalStudents > 0 ? `
    <div class="page-break"></div>
    <div class="section-title">Performance Insights for Teacher Discussion</div>
    <div class="insights-grid">
        <div>
            <h4 style="margin-bottom: 15px; color: #166534;">High Performers (≥85%)</h4>
            ${highPerformers.length > 0 ? highPerformers.map(student => `
                <div class="insight-item high-performer">
                    <span>Student ${student.studentId}</span>
                    <span><strong>${student.overallScore?.toFixed(1)}%</strong></span>
                </div>
            `).join('') : '<p style="color: #6b7280; font-style: italic;">No students scoring 85% or above</p>'}
        </div>

        <div>
            <h4 style="margin-bottom: 15px; color: #991b1b;">Students Needing Support (&lt;65%)</h4>
            ${needsSupport.length > 0 ? needsSupport.map(student => `
                <div class="insight-item needs-support">
                    <span>Student ${student.studentId}</span>
                    <span><strong>${student.overallScore?.toFixed(1)}%</strong></span>
                </div>
            `).join('') : '<p style="color: #6b7280; font-style: italic;">No students scoring below 65%</p>'}
        </div>
    </div>

    <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-radius: 8px;">
        <h4 style="margin-bottom: 10px; color: #1e40af;">Discussion Points for Teacher Collaboration:</h4>
        <ul style="color: #374151; line-height: 1.6;">
            <li>Review strategies that helped high-performing students succeed</li>
            <li>Identify common challenges among students needing support</li>
            <li>Plan targeted interventions for students scoring below 65%</li>
            <li>Consider peer tutoring opportunities with high performers</li>
            <li>Discuss differentiated instruction approaches for mixed-ability groups</li>
        </ul>
    </div>
    ` : ''}

    <div class="footer">
        <p>© 2025 Data Driven by Dr. Askar. All rights reserved.</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p><em>This report contains confidential student information. Please handle according to your school's privacy policy.</em></p>
    </div>
</body>
</html>
  `
}

export async function POST(request: NextRequest) {
  try {
    console.log('PDF API: POST request received')
    const body = await request.json()
    console.log('PDF API: Request body:', { filters: body.filters, hasReportData: !!body.reportData })
    
    const { filters = {}, reportData: providedReportData } = body

    // Use provided report data if available, otherwise generate it
    let reportData = providedReportData
    if (!reportData) {
      console.log('PDF API: Generating report data from filters')
      reportData = await generateStudentReportData(filters)
    }
    
    console.log('PDF API: Report data:', { hasReportData: !!reportData, studentsCount: reportData?.students?.length || 0 })
    
    if (!reportData) {
      console.log('PDF API: No report data available')
      return NextResponse.json({ error: 'No student data available' }, { status: 404 })
    }

    // Check if reportData has students
    if (!reportData.students || reportData.students.length === 0) {
      console.log('PDF API: No students in report data')
      return NextResponse.json({ error: 'No student data available for report generation' }, { status: 404 })
    }

    // Generate HTML
    const html = generateHTML(reportData)

    // Return HTML instead of PDF for faster response
    // Users can print to PDF from their browser if needed
    console.log('Returning HTML report for faster response')
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="student-performance-${reportData.filters.weekLabel?.replace(/\s+/g, '-') || 'report'}.html"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF report' }, { status: 500 })
  }
}
