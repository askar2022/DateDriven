import { NextResponse } from 'next/server'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function loadUploadedData(): Promise<any[]> {
  try {
    if (!supabase) {
      console.error('Supabase not configured')
      return []
    }
    
    const { data: uploads, error } = await supabase
      .from('uploads')
      .select(`
        id,
        teacher_name,
        upload_time,
        week_number,
        week_label,
        total_students,
        average_score,
        grade,
        class_name,
        subject,
        students (
          student_id,
          student_name,
          subject,
          score,
          grade,
          class_name,
          week_number
        )
      `)
      .order('upload_time', { ascending: false })

    if (error) {
      console.error('Supabase fetch error:', error)
      return []
    }

    return uploads.map(upload => {
      // Extract assessment name from weekLabel (same logic as main API)
      const assessmentName = upload.week_label ? upload.week_label.split(' - ')[0] : `Assessment ${upload.week_number}`
      
      return {
        id: upload.id,
        teacherName: upload.teacher_name,
        uploadTime: upload.upload_time,
        weekNumber: upload.week_number,
        weekLabel: upload.week_label,
        assessmentName: assessmentName,
        assessmentType: 'custom',
        assessmentDate: upload.upload_time,
        totalStudents: upload.total_students,
        averageScore: upload.average_score,
        grade: upload.grade,
        className: upload.class_name,
        subject: upload.subject,
        students: upload.students.map((s: any) => ({
          studentId: s.student_id,
          studentName: s.student_name,
          subject: s.subject,
          score: s.score,
          grade: s.grade,
          className: s.class_name,
          weekNumber: s.week_number,
          uploadDate: upload.upload_time
        })),
        errors: []
      }
    })
  } catch (error) {
    console.error('Error loading data from Supabase:', error)
    return []
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const week = searchParams.get('week') || 'current';
    const assessment = searchParams.get('assessment');

    console.log('PDF GET request for week:', week, 'assessment:', assessment);

    let uploads = await loadUploadedData()
    console.log('Loaded uploads count:', uploads.length);
    
    // Filter by assessment if specified
    if (assessment && uploads && Array.isArray(uploads)) {
      console.log('Filtering by assessment:', assessment);
      console.log('Available uploads before filtering:', uploads.map(u => ({ 
        id: u.id, 
        assessmentName: u.assessmentName, 
        weekNumber: u.weekNumber 
      })));
      
      uploads = uploads.filter((upload: any) => {
        const uploadAssessmentName = upload.assessmentName || `Assessment ${upload.weekNumber}`
        console.log(`Comparing "${uploadAssessmentName}" with "${assessment}": ${uploadAssessmentName === assessment}`);
        return uploadAssessmentName === assessment
      })
      console.log('Filtered uploads count:', uploads.length);
      console.log('Filtered uploads:', uploads.map(u => ({ 
        id: u.id, 
        assessmentName: u.assessmentName, 
        totalStudents: u.totalStudents 
      })));
    }
    
    // Calculate data based on filter
    let totalStudents = 0
    let totalAssessments = uploads ? uploads.length : 0
    
    if (!assessment) {
      // Count unique students across all uploads
      const studentMap = new Map()
      if (uploads && Array.isArray(uploads)) {
        uploads.forEach(upload => {
          if (upload.students) {
            upload.students.forEach(student => {
              studentMap.set(student.studentId, student)
            })
          }
        })
      }
      totalStudents = studentMap.size
      console.log('All Assessments - Unique students:', totalStudents);
    } else {
      // Count students from filtered uploads only
      totalStudents = uploads && Array.isArray(uploads) ? uploads.reduce((sum, upload) => sum + (upload.totalStudents || 0), 0) : 0
      console.log('Specific Assessment - Total students:', totalStudents);
    }
    
    const schoolAverage = (() => {
      if (!uploads || !Array.isArray(uploads) || uploads.length === 0) return 0
      
      const totalScore = uploads.reduce((sum, upload) => 
        sum + (upload.averageScore * upload.totalStudents), 0)
      const totalStudentsForAvg = uploads.reduce((sum, upload) => 
        sum + upload.totalStudents, 0)
      
      return totalStudentsForAvg > 0 ? (totalScore / totalStudentsForAvg).toFixed(1) : 0
    })()

    // Calculate grade breakdown
    const gradeBreakdown: Array<{
      grade: string;
      mathAverage: number;
      readingAverage: number;
      studentCount: number;
    }> = []
    const gradeGroups: { [key: string]: {
      grade: string;
      mathScores: number[];
      readingScores: number[];
      studentCount: number;
    }} = {}
    
    if (uploads && Array.isArray(uploads)) {
      uploads.forEach(upload => {
        if (!gradeGroups[upload.grade]) {
          gradeGroups[upload.grade] = {
            grade: upload.grade,
            mathScores: [],
            readingScores: [],
            studentCount: 0
          }
        }
      
      gradeGroups[upload.grade].studentCount += upload.totalStudents || 0
      
      if (upload.subject === 'Both Math & Reading' && upload.students) {
        const mathStudents = upload.students.filter(student => student.subject === 'Math')
        const readingStudents = upload.students.filter(student => student.subject === 'Reading')
        
        gradeGroups[upload.grade].mathScores.push(...mathStudents.map(s => s.score))
        gradeGroups[upload.grade].readingScores.push(...readingStudents.map(s => s.score))
      } else if (upload.subject === 'Math') {
        const studentsInUpload = upload.totalStudents || 1
        for (let i = 0; i < studentsInUpload; i++) {
          gradeGroups[upload.grade].mathScores.push(upload.averageScore)
        }
      } else if (upload.subject === 'Reading') {
        const studentsInUpload = upload.totalStudents || 1
        for (let i = 0; i < studentsInUpload; i++) {
          gradeGroups[upload.grade].readingScores.push(upload.averageScore)
        }
      }
      })
    }
    
    Object.values(gradeGroups).forEach(grade => {
      const mathAverage = grade.mathScores.length > 0 
        ? (grade.mathScores.reduce((sum, score) => sum + score, 0) / grade.mathScores.length).toFixed(1)
        : '0'
      const readingAverage = grade.readingScores.length > 0 
        ? (grade.readingScores.reduce((sum, score) => sum + score, 0) / grade.readingScores.length).toFixed(1)
        : '0'
      
      gradeBreakdown.push({
        grade: grade.grade,
        mathAverage: parseFloat(mathAverage),
        readingAverage: parseFloat(readingAverage),
        studentCount: grade.studentCount
      })
    })
    
    // Process tier distribution
    const tierDistribution: Array<{
      subject: string;
      green: number;
      orange: number;
      red: number;
      gray: number;
      total: number;
    }> = []
    
    const allMathScores: number[] = []
    const allReadingScores: number[] = []
    
    if (uploads && Array.isArray(uploads)) {
      uploads.forEach(upload => {
        if (upload.subject === 'Both Math & Reading' && upload.students) {
          upload.students.forEach(student => {
            if (student.subject === 'Math') {
              allMathScores.push(student.score)
            } else if (student.subject === 'Reading') {
              allReadingScores.push(student.score)
            }
          })
      } else if (upload.subject === 'Math') {
        const studentsInUpload = upload.totalStudents || 1
        for (let i = 0; i < studentsInUpload; i++) {
          allMathScores.push(upload.averageScore)
        }
      } else if (upload.subject === 'Reading') {
        const studentsInUpload = upload.totalStudents || 1
        for (let i = 0; i < studentsInUpload; i++) {
          allReadingScores.push(upload.averageScore)
        }
      }
      })
    }
    
    // Calculate Math tier distribution
    if (allMathScores.length > 0) {
      const green = allMathScores.filter(score => score >= 85).length
      const orange = allMathScores.filter(score => score >= 75 && score < 85).length
      const red = allMathScores.filter(score => score >= 65 && score < 75).length
      const gray = allMathScores.filter(score => score < 65).length
      
      tierDistribution.push({
        subject: 'Mathematics',
        green,
        orange,
        red,
        gray,
        total: totalStudents
      })
    }
    
    // Calculate Reading tier distribution
    if (allReadingScores.length > 0) {
      const green = allReadingScores.filter(score => score >= 85).length
      const orange = allReadingScores.filter(score => score >= 75 && score < 85).length
      const red = allReadingScores.filter(score => score >= 65 && score < 75).length
      const gray = allReadingScores.filter(score => score < 65).length
      
      tierDistribution.push({
        subject: 'Reading',
        green,
        orange,
        red,
        gray,
        total: totalStudents
      })
    }

    // Generate beautiful HTML
    const html = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; }
        .header { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #F8FAFC; color: #374151; border-bottom: 2px solid #E5E7EB; }
        .summary { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Student Performance Analytics Report</h1>
        <p><strong>Week:</strong> ${week}</p>
        ${assessment ? `<p><strong>Assessment:</strong> ${assessment}</p>` : '<p><strong>Assessment:</strong> All Assessments</p>'}
        <p><strong>Generated:</strong> ${format(new Date(), 'yyyy-MM-dd HH:mm')}</p>
      </div>
      <div class="summary">
        <h2>📈 Performance Summary</h2>
        <p><strong>Total Students:</strong> ${totalStudents}</p>
        <p><strong>Total Assessments:</strong> ${totalAssessments}</p>
        <p><strong>Average Score:</strong> ${schoolAverage}%</p>
      </div>

      ${tierDistribution.length > 0 ? `
      <h2>📊 Subject Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Green Tier (≥85)</th>
            <th>Orange Tier (75-84)</th>
            <th>Red Tier (65-74)</th>
            <th>Gray Tier (<65)</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${tierDistribution.map(subject => `
            <tr>
              <td>${subject.subject}</td>
              <td>
                <span style="
                  background-color: #DCFCE7;
                  color: #166534;
                  padding: 0.5rem 0.75rem;
                  border-radius: 0.5rem;
                  font-size: 0.875rem;
                  font-weight: 600;
                  display: inline-block;
                  min-width: 80px;
                  text-align: center;
                  border: 1px solid #BBF7D0;
                ">
                  ${subject.green} students
                </span>
              </td>
              <td>
                <span style="
                  background-color: #FED7AA;
                  color: #9A3412;
                  padding: 0.5rem 0.75rem;
                  border-radius: 0.5rem;
                  font-size: 0.875rem;
                  font-weight: 600;
                  display: inline-block;
                  min-width: 80px;
                  text-align: center;
                  border: 1px solid #FED7AA;
                ">
                  ${subject.orange} students
                </span>
              </td>
              <td>
                <span style="
                  background-color: #FECACA;
                  color: #991B1B;
                  padding: 0.5rem 0.75rem;
                  border-radius: 0.5rem;
                  font-size: 0.875rem;
                  font-weight: 600;
                  display: inline-block;
                  min-width: 80px;
                  text-align: center;
                  border: 1px solid #FCA5A5;
                ">
                  ${subject.red} students
                </span>
              </td>
              <td>
                <span style="
                  background-color: #F3F4F6;
                  color: #374151;
                  padding: 0.5rem 0.75rem;
                  border-radius: 0.5rem;
                  font-size: 0.875rem;
                  font-weight: 600;
                  display: inline-block;
                  min-width: 80px;
                  text-align: center;
                  border: 1px solid #D1D5DB;
                ">
                  ${subject.gray} students
                </span>
              </td>
              <td>${subject.total} students</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : '<p>No performance data available for this week.</p>'}

      ${gradeBreakdown.length > 0 ? `
      <h2>📈 Grade Level Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Grade</th>
            <th>Students</th>
            <th>Math Average</th>
            <th>Reading Average</th>
            <th>Overall Average</th>
          </tr>
        </thead>
        <tbody>
          ${gradeBreakdown.map(grade => {
            const overall = (grade.mathAverage + grade.readingAverage) / 2
            return `
              <tr>
                <td>${grade.grade}</td>
                <td>${grade.studentCount}</td>
                <td>
                  <span style="
                    background-color: ${grade.mathAverage >= 85 ? '#DCFCE7' : grade.mathAverage >= 75 ? '#FED7AA' : grade.mathAverage >= 65 ? '#FECACA' : '#F3F4F6'};
                    color: ${grade.mathAverage >= 85 ? '#166534' : grade.mathAverage >= 75 ? '#9A3412' : grade.mathAverage >= 65 ? '#991B1B' : '#374151'};
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: inline-block;
                    min-width: 60px;
                    text-align: center;
                    border: 1px solid ${grade.mathAverage >= 85 ? '#BBF7D0' : grade.mathAverage >= 75 ? '#FED7AA' : grade.mathAverage >= 65 ? '#FCA5A5' : '#D1D5DB'};
                  ">
                    ${grade.mathAverage.toFixed(1)}%
                  </span>
                </td>
                <td>
                  <span style="
                    background-color: ${grade.readingAverage >= 85 ? '#DCFCE7' : grade.readingAverage >= 75 ? '#FED7AA' : grade.readingAverage >= 65 ? '#FECACA' : '#F3F4F6'};
                    color: ${grade.readingAverage >= 85 ? '#166534' : grade.readingAverage >= 75 ? '#9A3412' : grade.readingAverage >= 65 ? '#991B1B' : '#374151'};
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: inline-block;
                    min-width: 60px;
                    text-align: center;
                    border: 1px solid ${grade.readingAverage >= 85 ? '#BBF7D0' : grade.readingAverage >= 75 ? '#FED7AA' : grade.readingAverage >= 65 ? '#FCA5A5' : '#D1D5DB'};
                  ">
                    ${grade.readingAverage.toFixed(1)}%
                  </span>
                </td>
                <td>
                  <span style="
                    background-color: ${overall >= 85 ? '#DCFCE7' : overall >= 75 ? '#FED7AA' : overall >= 65 ? '#FECACA' : '#F3F4F6'};
                    color: ${overall >= 85 ? '#166534' : overall >= 75 ? '#9A3412' : overall >= 65 ? '#991B1B' : '#374151'};
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: inline-block;
                    min-width: 60px;
                    text-align: center;
                    border: 1px solid ${overall >= 85 ? '#BBF7D0' : overall >= 75 ? '#FED7AA' : overall >= 65 ? '#FCA5A5' : '#D1D5DB'};
                  ">
                    ${overall.toFixed(1)}%
                  </span>
                </td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
      ` : ''}

      <div class="footer">
        <p>© 2025 Data Driven by Dr. Askar. All rights reserved.</p>
        <p>This report was generated automatically by the Student Performance Analytics System.</p>
      </div>
    </body>
    </html>
    `;

    // Return HTML that can be printed to PDF (same approach as teacher page)
    console.log('Generating HTML report for download...');
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="weekly-report-${week}.html"`,
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error) {
    console.error('Error in GET /api/reports/pdf:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { week = 'current' } = body

    console.log('PDF POST request for week:', week);

    const url = new URL(req.url)
    url.searchParams.set('week', week)
    
    return GET(new Request(url.toString()))
  } catch (error) {
    console.error('Error in POST /api/reports/pdf:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
