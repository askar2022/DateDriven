import { NextResponse } from 'next/server'
import { format } from 'date-fns'
import { prisma } from '@/lib/prisma'
import puppeteer from 'puppeteer'

// -----------------------------
// Types
// -----------------------------
interface Trend {
  week: string
  average: number
}

interface StudentScore {
  studentId: number
  rawScore: number
  weekStart: Date
}

// -----------------------------
// GET API Handler
// -----------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const week = searchParams.get('week') || 'current';

    // Get assessments with their scores
    const assessments = await prisma.assessment.findMany({
      include: {
        scores: true,
      },
      orderBy: {
        weekStart: 'asc',
      },
    })

    // Group by week and calculate averages
    const weekGroups = new Map<string, number[]>()
    
    for (const assessment of assessments) {
      const weekKey = format(assessment.weekStart, 'yyyy-MM-dd')
      const scores = assessment.scores.map(score => Number(score.rawScore))
      
      if (!weekGroups.has(weekKey)) {
        weekGroups.set(weekKey, [])
      }
      weekGroups.get(weekKey)!.push(...scores)
    }

    // Calculate averages for each week
    const trends = Array.from(weekGroups.entries()).map(([week, scores]) => ({
      week,
      average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    }))

    // Generate PDF buffer
    const pdfBuffer: Uint8Array = await generatePDF(trends)

    // Return PDF safely
    return new Response(new Blob([Buffer.from(pdfBuffer)], { type: 'application/pdf' }), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=weekly-report-${week}.pdf`,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/reports/pdf:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

// -----------------------------
// PDF Generation Function
// -----------------------------
async function generatePDF(trends: { week: string; average: number }[]): Promise<Uint8Array> {
  const browser = await puppeteer.launch({
    headless: true,
  })

  const page = await browser.newPage()

  // Generate HTML content with trends data
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Weekly Performance Report</h1>
        <p>Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')}</p>
        
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Average Score</th>
            </tr>
          </thead>
          <tbody>
            ${trends.map(trend => `
              <tr>
                <td>${trend.week}</td>
                <td>${trend.average.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `

  await page.setContent(html)
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
  await browser.close()

  return pdfBuffer
}
