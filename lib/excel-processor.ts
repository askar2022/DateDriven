import * as XLSX from 'xlsx'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Subject, Tier } from '@prisma/client'

// Validation schema for Excel data
const ExcelRowSchema = z.object({
  WeekStart: z.string().or(z.date()),
  ClassroomCode: z.string(),
  Subject: z.enum(['Math', 'Reading', 'MATH', 'READING']),
  StudentName: z.string(),
  StudentID: z.string().optional(),
  GradeLevel: z.string(),
  Score: z.number().min(0).max(100),
})

type ExcelRow = z.infer<typeof ExcelRowSchema>

export interface ProcessingResult {
  success: boolean
  processedCount: number
  errors: string[]
  unmatchedStudents: Array<{
    name: string
    grade: string
    classroom: string
  }>
}

export function calculateTier(score: number): Tier {
  if (score >= 85) return Tier.GREEN
  if (score >= 75) return Tier.ORANGE
  if (score >= 65) return Tier.RED
  return Tier.GRAY
}

export function normalizeSubject(subject: string): Subject {
  const normalized = subject.toUpperCase()
  return normalized === 'MATH' ? Subject.MATH : Subject.READING
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
  return new Date(d.setDate(diff))
}

export async function processExcelFile(
  buffer: Buffer,
  userId: string
): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    success: false,
    processedCount: 0,
    errors: [],
    unmatchedStudents: [],
  }

  try {
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet)

    if (data.length === 0) {
      result.errors.push('Excel file is empty')
      return result
    }

    // Validate and process each row
    const validRows: ExcelRow[] = []
    
    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i] as any
        const validatedRow = ExcelRowSchema.parse(row)
        validRows.push(validatedRow)
      } catch (error) {
        result.errors.push(`Row ${i + 2}: Invalid data format`)
      }
    }

    if (validRows.length === 0) {
      result.errors.push('No valid rows found in Excel file')
      return result
    }

    // Group by week, classroom, and subject
    const assessmentGroups = new Map<string, ExcelRow[]>()
    
    for (const row of validRows) {
      const weekStart = getWeekStart(new Date(row.WeekStart))
      const subject = normalizeSubject(row.Subject)
      const key = `${weekStart.toISOString()}-${row.ClassroomCode}-${subject}`
      
      if (!assessmentGroups.has(key)) {
        assessmentGroups.set(key, [])
      }
      assessmentGroups.get(key)!.push(row)
    }

    // Process each assessment group
    for (const [key, rows] of Array.from(assessmentGroups.entries())) {
      const [weekStartStr, classroomCode, subjectStr] = key.split('-')
      const weekStart = new Date(weekStartStr)
      const subject = subjectStr as Subject

      try {
        await processAssessmentGroup(rows, weekStart, classroomCode, subject, result)
      } catch (error) {
        result.errors.push(`Failed to process ${classroomCode} ${subject} for week ${weekStart.toISOString()}: ${error}`)
      }
    }

    // Create audit log
    await prisma.uploadAudit.create({
      data: {
        userId,
        fileName: 'uploaded_file.xlsx',
        fileSize: buffer.length,
        recordCount: validRows.length,
        status: result.errors.length > 0 ? 'PARTIAL_SUCCESS' : 'SUCCESS',
        errorLog: result.errors.length > 0 ? result.errors.join('\n') : null,
      },
    })

    result.success = result.errors.length === 0
    return result

  } catch (error) {
    result.errors.push(`File processing error: ${error}`)
    return result
  }
}

async function processAssessmentGroup(
  rows: ExcelRow[],
  weekStart: Date,
  classroomCode: string,
  subject: Subject,
  result: ProcessingResult
) {
  // Find or create classroom
  const classroom = await prisma.classroom.findUnique({
    where: { code: classroomCode },
    include: { gradeLevel: true },
  })

  if (!classroom) {
    result.errors.push(`Classroom ${classroomCode} not found`)
    return
  }

  // Create or update assessment
  const assessment = await prisma.assessment.upsert({
    where: {
      subject_classroomId_weekStart: {
        subject,
        classroomId: classroom.id,
        weekStart,
      },
    },
    update: {},
    create: {
      subject,
      classroomId: classroom.id,
      weekStart,
    },
  })

  // Process scores
  for (const row of rows) {
    try {
      // Find student by ID or name
      let student: any = null
      
      if (row.StudentID) {
        student = await prisma.student.findFirst({
          where: {
            externalId: row.StudentID,
            gradeLevelId: classroom.gradeLevelId,
          },
        })
      }

      if (!student) {
        // Try to find by name (exact match)
        student = await prisma.student.findFirst({
          where: {
            gradeLevelId: classroom.gradeLevelId,
            pii: {
              fullName: row.StudentName,
            },
          },
        })
      }

      if (!student) {
        result.unmatchedStudents.push({
          name: row.StudentName,
          grade: row.GradeLevel,
          classroom: classroomCode,
        })
        continue
      }

      // Create or update score
      const tier = calculateTier(row.Score)
      
      await prisma.score.upsert({
        where: {
          studentId_assessmentId: {
            studentId: student.id,
            assessmentId: assessment.id,
          },
        },
        update: {
          rawScore: row.Score,
          tier,
        },
        create: {
          studentId: student.id,
          assessmentId: assessment.id,
          rawScore: row.Score,
          tier,
        },
      })

      result.processedCount++

    } catch (error) {
      result.errors.push(`Failed to process score for ${row.StudentName}: ${error}`)
    }
  }

  // Recompute weekly aggregates
  await recomputeWeeklyAggregates(classroom.gradeLevelId, classroom.id, subject, weekStart)
}

async function recomputeWeeklyAggregates(
  gradeLevelId: number,
  classroomId: string,
  subject: Subject,
  weekStart: Date
) {
  // Get all scores for this week/classroom/subject
  const scores = await prisma.score.findMany({
    where: {
      assessment: {
        classroomId,
        subject,
        weekStart,
      },
    },
    select: {
      tier: true,
    },
  })

  // Count by tier
  const counts = {
    green: scores.filter(s => s.tier === Tier.GREEN).length,
    orange: scores.filter(s => s.tier === Tier.ORANGE).length,
    red: scores.filter(s => s.tier === Tier.RED).length,
    gray: scores.filter(s => s.tier === Tier.GRAY).length,
  }

  const total = scores.length

  // Upsert weekly aggregate
  await prisma.weeklyAggregate.upsert({
    where: {
      gradeLevelId_classroomId_subject_weekStart: {
        gradeLevelId,
        classroomId,
        subject,
        weekStart,
      },
    },
    update: {
      greenCount: counts.green,
      orangeCount: counts.orange,
      redCount: counts.red,
      grayCount: counts.gray,
      total,
    },
    create: {
      gradeLevelId,
      classroomId,
      subject,
      weekStart,
      greenCount: counts.green,
      orangeCount: counts.orange,
      redCount: counts.red,
      grayCount: counts.gray,
      total,
    },
  })
}
