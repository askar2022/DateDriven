import { NextResponse } from 'next/server'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering to prevent build-time data collection
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Load uploaded data from Supabase
async function loadUploadedData(): Promise<any[]> {
  try {
    if (!supabase) {
      console.error('Supabase not configured')
      return []
    }
    
    const { data: uploads, error } = await supabase
      .from('uploads')
      .select(`
        *,
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

    return uploads.map(upload => ({
      id: upload.id,
      teacherName: upload.teacher_name,
      uploadTime: upload.upload_time,
      weekNumber: upload.week_number,
      weekLabel: upload.week_label,
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
    }))
  } catch (error) {
    console.error('Error loading data from Supabase:', error)
    return []
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const week = searchParams.get('week') || 'current';

    console.log('Vercel PDF GET request for week:', week);

    const uploads = await loadUploadedData()
    console.log('Loaded uploads count:', uploads.length);
    
    // Calculate data
    const teacherMap = new Map()
    uploads.forEach(upload => {
      if (!upload?.teacherName) return
      const key = upload.teacherName
      const currentUpload = teacherMap.get(key)
      if (!currentUpload || new Date(upload.uploadTime) > new Date(currentUpload.uploadTime)) {
        teacherMap.set(key, upload)
      }
    })
    
    const totalStudents = Array.from(teacherMap.values()).reduce((sum, upload) => sum + (upload.totalStudents || 0), 0)
    const totalAssessments = uploads.length
    
    const schoolAverage = (() => {
      const uniqueUploads = Array.from(teacherMap.values())
      if (uniqueUploads.length === 0) return 0
      
      const totalScore = uniqueUploads.reduce((sum, upload) => 
        sum + (upload.averageScore * upload.totalStudents), 0)
      const totalStudentsForAvg = uniqueUploads.reduce((sum, upload) => 
        sum + upload.totalStudents, 0)
      
      return totalStudentsForAvg > 0 ? (totalScore / totalStudentsForAvg).toFixed(1) : 0
    })()

    // Generate HTML optimized for PDF printing
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Student Performance Analytics Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          .page-break { page-break-before: always; }
          table { page-break-inside: avoid; }
          h1, h2 { page-break-after: avoid; }
        }
        
        @page {
          margin: 0.5in;
          size: A4;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 10px;
        }
        
        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          font-weight: 700;
        }
        
        .summary {
          background: #f8fafc;
          padding: 25px;
          border-radius: 10px;
          margin: 25px 0;
          border-left: 5px solid #3b82f6;
        }
        
        .summary h2 {
          color: #1e40af;
          margin-bottom: 15px;
          font-size: 1.5em;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .summary-item {
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .summary-item .value {
          font-size: 2em;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 5px;
        }
        
        .summary-item .label {
          color: #6b7280;
          font-size: 0.9em;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #6b7280;
          font-size: 0.9em;
          padding: 20px;
          border-top: 2px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Student Performance Analytics Report</h1>
          <p><strong>Week:</strong> ${week}</p>
          <p><strong>Generated:</strong> ${format(new Date(), 'yyyy-MM-dd HH:mm')}</p>
        </div>

        <div class="summary">
          <h2>📈 Performance Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="value">${totalStudents}</div>
              <div class="label">Total Students</div>
            </div>
            <div class="summary-item">
              <div class="value">${totalAssessments}</div>
              <div class="label">Assessments</div>
            </div>
            <div class="summary-item">
              <div class="value">${schoolAverage}%</div>
              <div class="label">School Average</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>© 2025 Analytics by Dr. Askar. All rights reserved.</p>
          <p>This report was generated automatically by the Student Performance Analytics System.</p>
          <p><em>To save as PDF: Use your browser's Print function and select "Save as PDF"</em></p>
        </div>
      </div>
    </body>
    </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="weekly-report-${week}.html"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error in GET /api/reports/pdf-vercel:', error)
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

    const url = new URL(req.url)
    url.searchParams.set('week', week)
    
    return GET(new Request(url.toString()))
  } catch (error) {
    console.error('Error in POST /api/reports/pdf-vercel:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
