import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    // Temporary: Skip authentication for development
    const user = await getCurrentUser()
    
    // If no user found (no auth configured), use mock user for development
    const mockUser = user || {
      id: 'mock-user-id',
      email: 'demo@school.edu',
      name: 'Demo User',
      role: 'LEADER'
    }
    
    if (!mockUser || mockUser.role !== 'LEADER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { week } = await request.json()
    
    if (!week) {
      return NextResponse.json({ error: 'Week parameter required' }, { status: 400 })
    }

    // Fetch report data
    const reportResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/reports?week=${week}`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })

    if (!reportResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 })
    }

    const reportData = await reportResponse.json()

    // Generate HTML for PDF
    const html = generateReportHTML(reportData)

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    })

    await browser.close()

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="weekly-report-${week}.pdf"`,
      },
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

function generateReportHTML(data: any): string {
  const weekDate = new Date(data.weekStart).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Weekly Performance Report</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 30px;
          line-height: 1.6;
          color: #374151;
          background: #ffffff;
        }
        .header {
          text-align: center;
          margin-bottom: 50px;
          padding: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          color: white;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .header p {
          margin: 0;
          font-size: 18px;
          opacity: 0.9;
        }
        .header .subtitle {
          font-size: 14px;
          opacity: 0.8;
          margin-top: 10px;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 50px;
        }
        .summary-item {
          text-align: center;
          background: #ffffff;
          padding: 30px 20px;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }
        .summary-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 15px auto;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .summary-number {
          font-size: 42px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 8px 0;
          letter-spacing: -1px;
        }
        .summary-label {
          color: #6b7280;
          font-size: 15px;
          font-weight: 500;
          margin: 0;
        }
        .section {
          margin-bottom: 50px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        .section-header {
          background: #f8fafc;
          padding: 25px 30px;
          border-bottom: 1px solid #e5e7eb;
        }
        .section h2 {
          color: #111827;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .section-content {
          padding: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
          background: #ffffff;
        }
        th {
          background: #f8fafc;
          padding: 18px 20px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
        }
        td {
          padding: 18px 20px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 15px;
        }
        tr:last-child td {
          border-bottom: none;
        }
        tr:hover {
          background: #f9fafb;
        }
        .tier-green { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
          color: white; 
          padding: 6px 12px; 
          border-radius: 20px; 
          font-size: 13px; 
          font-weight: 600;
          display: inline-block;
        }
        .tier-orange { 
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
          color: white; 
          padding: 6px 12px; 
          border-radius: 20px; 
          font-size: 13px; 
          font-weight: 600;
          display: inline-block;
        }
        .tier-red { 
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
          color: white; 
          padding: 6px 12px; 
          border-radius: 20px; 
          font-size: 13px; 
          font-weight: 600;
          display: inline-block;
        }
        .tier-gray { 
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); 
          color: white; 
          padding: 6px 12px; 
          border-radius: 20px; 
          font-size: 13px; 
          font-weight: 600;
          display: inline-block;
        }
        .trends {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        .trend-item {
          text-align: center;
          padding: 20px 15px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        .trend-week {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .trend-score {
          font-size: 24px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.5px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
          padding: 25px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        .footer-logo {
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Weekly Performance Report</h1>
        <p>Week of ${weekDate}</p>
        <div class="subtitle">Student Performance Analytics System</div>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-icon" style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);">
            👥
          </div>
          <div class="summary-number">${data.summary.totalStudents}</div>
          <div class="summary-label">Total Students</div>
        </div>
        <div class="summary-item">
          <div class="summary-icon" style="background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);">
            📝
          </div>
          <div class="summary-number">${data.summary.totalAssessments}</div>
          <div class="summary-label">Assessments Completed</div>
        </div>
        <div class="summary-item">
          <div class="summary-icon" style="background: linear-gradient(135deg, #10B981 0%, #047857 100%);">
            🎯
          </div>
          <div class="summary-number">${data.summary.schoolAverage.toFixed(1)}%</div>
          <div class="summary-label">School Average</div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2>
            <div class="section-icon" style="background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: white;">📈</div>
            Performance Distribution by Subject
          </h2>
        </div>
        <div class="section-content">
          <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Green (≥85)</th>
              <th>Orange (75-84)</th>
              <th>Red (65-74)</th>
              <th>Gray (&lt;65)</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.tierDistribution.map((item: any) => `
              <tr>
                <td>${item.subject}</td>
                <td><span class="tier-green">${item.green} (${item.total > 0 ? ((item.green / item.total) * 100).toFixed(1) : 0}%)</span></td>
                <td><span class="tier-orange">${item.orange} (${item.total > 0 ? ((item.orange / item.total) * 100).toFixed(1) : 0}%)</span></td>
                <td><span class="tier-red">${item.red} (${item.total > 0 ? ((item.red / item.total) * 100).toFixed(1) : 0}%)</span></td>
                <td><span class="tier-gray">${item.gray} (${item.total > 0 ? ((item.gray / item.total) * 100).toFixed(1) : 0}%)</span></td>
                <td>${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2>
            <div class="section-icon" style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white;">🎓</div>
            Grade Level Performance
          </h2>
        </div>
        <div class="section-content">
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
            ${data.gradeBreakdown.map((grade: any) => {
              const overall = (grade.mathAverage + grade.readingAverage) / 2
              const getTierClass = (score: number) => {
                if (score >= 85) return 'tier-green'
                if (score >= 75) return 'tier-orange'
                if (score >= 65) return 'tier-red'
                return 'tier-gray'
              }
              return `
                <tr>
                  <td>${grade.grade}</td>
                  <td>${grade.studentCount}</td>
                  <td><span class="${getTierClass(grade.mathAverage)}">${grade.mathAverage.toFixed(1)}%</span></td>
                  <td><span class="${getTierClass(grade.readingAverage)}">${grade.readingAverage.toFixed(1)}%</span></td>
                  <td><span class="${getTierClass(overall)}">${overall.toFixed(1)}%</span></td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2>
            <div class="section-icon" style="background: linear-gradient(135deg, #10B981 0%, #047857 100%); color: white;">📊</div>
            8-Week Performance Trend
          </h2>
        </div>
        <div class="section-content">
          <div class="trends">
          ${data.trends.map((trend: any) => `
            <div class="trend-item">
              <div class="trend-week">${new Date(trend.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              <div class="trend-score">${trend.average.toFixed(1)}%</div>
            </div>
          `).join('')}
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-logo">📚 Student Performance Analytics System</div>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p>Confidential • For Educational Leadership Use Only</p>
      </div>
    </body>
    </html>
  `
}
