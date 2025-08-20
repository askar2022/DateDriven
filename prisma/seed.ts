import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create grade levels
  const grade3 = await prisma.gradeLevel.upsert({
    where: { name: 'Grade 3' },
    update: {},
    create: { name: 'Grade 3' },
  })

  const grade4 = await prisma.gradeLevel.upsert({
    where: { name: 'Grade 4' },
    update: {},
    create: { name: 'Grade 4' },
  })

  const grade5 = await prisma.gradeLevel.upsert({
    where: { name: 'Grade 5' },
    update: {},
    create: { name: 'Grade 5' },
  })

  // Create sample users
  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher1@school.edu' },
    update: {},
    create: {
      email: 'teacher1@school.edu',
      name: 'Ms. Johnson',
      role: Role.TEACHER,
    },
  })

  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@school.edu' },
    update: {},
    create: {
      email: 'teacher2@school.edu',
      name: 'Mr. Smith',
      role: Role.TEACHER,
    },
  })

  const staffAdmin = await prisma.user.upsert({
    where: { email: 'admin@school.edu' },
    update: {},
    create: {
      email: 'admin@school.edu',
      name: 'Assistant Principal',
      role: Role.STAFF,
    },
  })

  const leader = await prisma.user.upsert({
    where: { email: 'coach@school.edu' },
    update: {},
    create: {
      email: 'coach@school.edu',
      name: 'Instructional Coach',
      role: Role.LEADER,
    },
  })

  // Create classrooms
  const classrooms = [
    { code: 'G3-A', gradeLevelId: grade3.id, teacherId: teacher1.id },
    { code: 'G3-B', gradeLevelId: grade3.id, teacherId: teacher2.id },
    { code: 'G4-A', gradeLevelId: grade4.id, teacherId: teacher1.id },
    { code: 'G4-B', gradeLevelId: grade4.id, teacherId: teacher2.id },
    { code: 'G5-A', gradeLevelId: grade5.id, teacherId: teacher1.id },
    { code: 'G5-B', gradeLevelId: grade5.id, teacherId: teacher2.id },
  ]

  for (const classroom of classrooms) {
    await prisma.classroom.upsert({
      where: { code: classroom.code },
      update: {},
      create: classroom,
    })
  }

  // Create sample students (anonymized)
  const sampleStudents = [
    { gradeLevelId: grade3.id, externalId: 'STU001' },
    { gradeLevelId: grade3.id, externalId: 'STU002' },
    { gradeLevelId: grade3.id, externalId: 'STU003' },
    { gradeLevelId: grade4.id, externalId: 'STU004' },
    { gradeLevelId: grade4.id, externalId: 'STU005' },
    { gradeLevelId: grade5.id, externalId: 'STU006' },
  ]

  for (const student of sampleStudents) {
    await prisma.student.create({
      data: student,
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
