const fs = require('fs');
const path = require('path');

// Realistic school structure: multiple teachers per grade
const schoolStructure = {
  'Kindergarten': [
    { teacher: 'Ms.Kelly', class: 'Class K-A', students: 16 },
    { teacher: 'Mr.Brown', class: 'Class K-B', students: 17 }
  ],
  'Grade 1': [
    { teacher: 'Mr.Adams', class: 'Class 1-A', students: 18 },
    { teacher: 'Ms.Parker', class: 'Class 1-B', students: 19 }
  ],
  'Grade 2': [
    { teacher: 'Ms.Brown', class: 'Class 2-A', students: 19 },
    { teacher: 'Mr.Davis', class: 'Class 2-B', students: 18 }
  ],
  'Grade 3': [
    { teacher: 'Mr.Johnson', class: 'Class 3-A', students: 18 },
    { teacher: 'Ms.Wilson', class: 'Class 3-B', students: 20 }
  ],
  'Grade 4': [
    { teacher: 'Ms.Sahra', class: 'Class 4-A', students: 20 },
    { teacher: 'Mr.Martinez', class: 'Class 4-B', students: 19 }
  ],
  'Grade 5': [
    { teacher: 'Ms.Davis', class: 'Class 5-A', students: 22 },
    { teacher: 'Ms.Taylor', class: 'Class 5-B', students: 21 }
  ],
  'Grade 6': [
    { teacher: 'Mr.Wilson', class: 'Class 6-A', students: 24 },
    { teacher: 'Ms.Anderson', class: 'Class 6-B', students: 23 }
  ],
  'Grade 7': [
    { teacher: 'Ms.Garcia', class: 'Class 7-A', students: 23 },
    { teacher: 'Mr.Clark', class: 'Class 7-B', students: 22 }
  ],
  'Grade 8': [
    { teacher: 'Mr.Thompson', class: 'Class 8-A', students: 25 },
    { teacher: 'Ms.Rodriguez', class: 'Class 8-B', students: 24 }
  ]
};

// Generate score ranges by grade level
const gradeScoreRanges = {
  'Kindergarten': { min: 55, max: 85 },
  'Grade 1': { min: 60, max: 90 },
  'Grade 2': { min: 60, max: 90 },
  'Grade 3': { min: 65, max: 95 },
  'Grade 4': { min: 55, max: 95 },
  'Grade 5': { min: 70, max: 100 },
  'Grade 6': { min: 70, max: 100 },
  'Grade 7': { min: 75, max: 100 },
  'Grade 8': { min: 75, max: 100 }
};

function generateScore(grade) {
  const range = gradeScoreRanges[grade];
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

function generateProgressiveScore(baseScore, weekNumber) {
  if (weekNumber === 35) return baseScore;
  
  // Gradual improvement: 0-5 points per week with some randomness
  const improvement = (weekNumber - 35) * (Math.random() * 5 + 1);
  return Math.min(100, Math.max(0, Math.round(baseScore + improvement)));
}

// Generate complete school data
const allUploads = [];

Object.entries(schoolStructure).forEach(([grade, teachers]) => {
  teachers.forEach(({ teacher, class: className, students: studentCount }) => {
    
    // Generate baseline students for Week 35
    const baselineStudents = Array.from({ length: studentCount }, (_, i) => [
      {
        studentId: `${i + 1}`,
        studentName: `Student ${i + 1}`,
        subject: 'Math',
        score: generateScore(grade),
        grade: grade,
        className: className,
        weekNumber: 35,
        uploadDate: '2025-08-25T00:00:00.000Z'
      },
      {
        studentId: `${i + 1}`,
        studentName: `Student ${i + 1}`,
        subject: 'Reading',
        score: generateScore(grade),
        grade: grade,
        className: className,
        weekNumber: 35,
        uploadDate: '2025-08-25T00:00:00.000Z'
      }
    ]).flat();

    // Create uploads for all 3 weeks (35, 36, 37)
    [35, 36, 37].forEach(weekNumber => {
      const weekDate = new Date('2025-08-25');
      weekDate.setDate(weekDate.getDate() + ((weekNumber - 35) * 7));
      
      const weekStudents = baselineStudents.map(student => ({
        ...student,
        score: generateProgressiveScore(student.score, weekNumber),
        weekNumber: weekNumber,
        uploadDate: weekDate.toISOString()
      }));
      
      const averageScore = weekStudents.reduce((sum, s) => sum + s.score, 0) / weekStudents.length;
      
      const upload = {
        id: `week${weekNumber}_${teacher.toLowerCase().replace(/[^a-z]/g, '')}_${className.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        teacherName: teacher,
        uploadTime: weekDate.toISOString(),
        weekNumber: weekNumber,
        weekLabel: `Week ${weekNumber} - ${weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        totalStudents: studentCount,
        averageScore: Math.round(averageScore * 10) / 10,
        grade: grade,
        className: className,
        subject: 'Both Math & Reading',
        students: weekStudents
      };
      
      allUploads.push(upload);
    });
  });
});

// Sort by grade, teacher, then week
allUploads.sort((a, b) => {
  if (a.grade !== b.grade) return a.grade.localeCompare(b.grade);
  if (a.teacherName !== b.teacherName) return a.teacherName.localeCompare(b.teacherName);
  return a.weekNumber - b.weekNumber;
});

// Write the data
fs.writeFileSync(
  path.join(__dirname, '../data/uploads.json'),
  JSON.stringify(allUploads, null, 2),
  'utf8'
);

console.log('✅ Realistic school data generated!');
console.log(`Total uploads: ${allUploads.length}`);
console.log(`Expected: ${Object.values(schoolStructure).flat().length * 3} uploads (${Object.values(schoolStructure).flat().length} teachers × 3 weeks)`);

// Verify structure
console.log('\nSchool structure verification:');
const gradeStats = {};
allUploads.forEach(upload => {
  if (!gradeStats[upload.grade]) {
    gradeStats[upload.grade] = { teachers: new Set(), weeks: new Set(), totalStudents: 0 };
  }
  gradeStats[upload.grade].teachers.add(upload.teacherName);
  gradeStats[upload.grade].weeks.add(upload.weekNumber);
  if (upload.weekNumber === 35) { // Count students only once
    gradeStats[upload.grade].totalStudents += upload.totalStudents;
  }
});

Object.entries(gradeStats).forEach(([grade, stats]) => {
  console.log(`${grade}: ${stats.teachers.size} teachers, ${stats.totalStudents} students, weeks ${[...stats.weeks].sort().join(',')}`);
});

const weekCounts = {};
allUploads.forEach(upload => {
  weekCounts[upload.weekNumber] = (weekCounts[upload.weekNumber] || 0) + 1;
});
console.log('\nWeek distribution:', weekCounts);
