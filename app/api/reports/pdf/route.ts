import { NextResponse } from 'next/server'
import { format } from 'date-fns'

// Force dynamic rendering to prevent build-time data collection
export const dynamic = 'force-dynamic'
export const revalidate = 0

// -----------------------------
// GET API Handler
// -----------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const week = searchParams.get('week') || 'current';

    // Mock trends data
    const trends = [
      { week: '2025-01-06', average: 75.2 },
      { week: '2025-01-13', average: 76.8 },
      { week: '2025-01-20', average: 78.4 }
    ]

    // Generate simple HTML content
    const html = `
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              line-height: 1.6;
            }
            h1 { 
              color: #333; 
              border-bottom: 2px solid #3B82F6;
              padding-bottom: 10px;
            }
            .header {
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #3B82F6; 
              color: white;
            }
            .summary {
              background-color: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Student Performance Analytics Report</h1>
            <p><strong>Week:</strong> ${week}</p>
            <p><strong>Generated:</strong> ${format(new Date(), 'yyyy-MM-dd HH:mm')}</p>
          </div>

          <div class="summary">
            <h2>📈 Performance Summary</h2>
            <p><strong>Total Students:</strong> 156</p>
            <p><strong>Average Score:</strong> 78.4%</p>
            <p><strong>Growth Rate:</strong> +12.3%</p>
          </div>

          <h2>📋 Weekly Trends</h2>
          <table>
            <thead>
              <tr>
                <th>Week</th>
                <th>Average Score</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              ${trends.map((trend, index) => {
                const prevAvg = index > 0 ? trends[index - 1].average : trend.average;
                const change = trend.average - prevAvg;
                const trendIcon = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
                const trendText = change > 0 ? `+${change.toFixed(1)}` : change < 0 ? `${change.toFixed(1)}` : '0.0';
                return `
                  <tr>
                    <td>${trend.week}</td>
                    <td>${trend.average.toFixed(1)}%</td>
                    <td>${trendIcon} ${trendText}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <h2>📊 Subject Performance</h2>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Green Tier</th>
                <th>Orange Tier</th>
                <th>Red Tier</th>
                <th>Gray Tier</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mathematics</td>
                <td>45 students</td>
                <td>32 students</td>
                <td>18 students</td>
                <td>5 students</td>
              </tr>
              <tr>
                <td>Reading</td>
                <td>42 students</td>
                <td>35 students</td>
                <td>20 students</td>
                <td>3 students</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>© 2025 Analytics by Dr. Askar. All rights reserved.</p>
            <p>This report was generated automatically by the Student Performance Analytics System.</p>
          </div>
        </body>
      </html>
    `;

    // For now, return a simple text response that can be saved as PDF
    // In a real implementation, you would use Puppeteer to generate actual PDF
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename=weekly-report-${week}.html`,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/reports/pdf:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
