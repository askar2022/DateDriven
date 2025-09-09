const fs = require('fs');
const path = require('path');

// Create clean baseline data - one upload per teacher for Week 35 only
const cleanBaselineData = [
  // Kindergarten - Ms.Kelly
  {
    "id": "week35_kelly",
    "teacherName": "Ms.Kelly",
    "uploadTime": "2025-08-25T00:00:00.000Z",
    "weekNumber": 35,
    "weekLabel": "Week 35 - Aug 25",
    "totalStudents": 16,
    "averageScore": 67.2,
    "grade": "Kindergarten",
    "className": "Class K-A",
    "subject": "Both Math & Reading",
    "students": Array.from({length: 16}, (_, i) => [
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Math",
        "score": Math.floor(Math.random() * 30) + 55, // 55-85 range
        "grade": "Kindergarten",
        "className": "Class K-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      },
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Reading",
        "score": Math.floor(Math.random() * 30) + 55, // 55-85 range
        "grade": "Kindergarten",
        "className": "Class K-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      }
    ]).flat()
  },
  // Grade 1 - Mr.Adams
  {
    "id": "week35_adams",
    "teacherName": "Mr.Adams",
    "uploadTime": "2025-08-25T00:00:00.000Z",
    "weekNumber": 35,
    "weekLabel": "Week 35 - Aug 25",
    "totalStudents": 18,
    "averageScore": 76.1,
    "grade": "Grade 1",
    "className": "Class 1-A",
    "subject": "Both Math & Reading",
    "students": Array.from({length: 18}, (_, i) => [
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Math",
        "score": Math.floor(Math.random() * 35) + 60, // 60-95 range
        "grade": "Grade 1",
        "className": "Class 1-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      },
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Reading",
        "score": Math.floor(Math.random() * 35) + 60, // 60-95 range
        "grade": "Grade 1",
        "className": "Class 1-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      }
    ]).flat()
  },
  // Grade 2 - Ms.Brown
  {
    "id": "week35_brown",
    "teacherName": "Ms.Brown",
    "uploadTime": "2025-08-25T00:00:00.000Z",
    "weekNumber": 35,
    "weekLabel": "Week 35 - Aug 25",
    "totalStudents": 19,
    "averageScore": 77.6,
    "grade": "Grade 2",
    "className": "Class 2-A",
    "subject": "Both Math & Reading",
    "students": Array.from({length: 19}, (_, i) => [
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Math",
        "score": Math.floor(Math.random() * 35) + 60,
        "grade": "Grade 2",
        "className": "Class 2-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      },
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Reading",
        "score": Math.floor(Math.random() * 35) + 60,
        "grade": "Grade 2",
        "className": "Class 2-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      }
    ]).flat()
  },
  // Grade 3 - Mr.Johnson
  {
    "id": "week35_johnson",
    "teacherName": "Mr.Johnson",
    "uploadTime": "2025-08-25T00:00:00.000Z",
    "weekNumber": 35,
    "weekLabel": "Week 35 - Aug 25",
    "totalStudents": 18,
    "averageScore": 78.6,
    "grade": "Grade 3",
    "className": "Class 3-A",
    "subject": "Both Math & Reading",
    "students": Array.from({length: 18}, (_, i) => [
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Math",
        "score": Math.floor(Math.random() * 35) + 65,
        "grade": "Grade 3",
        "className": "Class 3-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      },
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Reading",
        "score": Math.floor(Math.random() * 35) + 65,
        "grade": "Grade 3",
        "className": "Class 3-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      }
    ]).flat()
  },
  // Grade 4 - Ms.Sahra
  {
    "id": "week35_sahra",
    "teacherName": "Ms.Sahra",
    "uploadTime": "2025-08-25T00:00:00.000Z",
    "weekNumber": 35,
    "weekLabel": "Week 35 - Aug 25",
    "totalStudents": 20,
    "averageScore": 72.0,
    "grade": "Grade 4",
    "className": "Class 4-A",
    "subject": "Both Math & Reading",
    "students": Array.from({length: 20}, (_, i) => [
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Math",
        "score": Math.floor(Math.random() * 40) + 55,
        "grade": "Grade 4",
        "className": "Class 4-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      },
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Reading",
        "score": Math.floor(Math.random() * 40) + 55,
        "grade": "Grade 4",
        "className": "Class 4-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      }
    ]).flat()
  },
  // Grade 5 - Ms.Davis
  {
    "id": "week35_davis",
    "teacherName": "Ms.Davis",
    "uploadTime": "2025-08-25T00:00:00.000Z",
    "weekNumber": 35,
    "weekLabel": "Week 35 - Aug 25",
    "totalStudents": 22,
    "averageScore": 84.6,
    "grade": "Grade 5",
    "className": "Class 5-A",
    "subject": "Both Math & Reading",
    "students": Array.from({length: 22}, (_, i) => [
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Math",
        "score": Math.floor(Math.random() * 30) + 70,
        "grade": "Grade 5",
        "className": "Class 5-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      },
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Reading",
        "score": Math.floor(Math.random() * 30) + 70,
        "grade": "Grade 5",
        "className": "Class 5-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      }
    ]).flat()
  },
  // Grade 6 - Mr.Wilson
  {
    "id": "week35_wilson",
    "teacherName": "Mr.Wilson",
    "uploadTime": "2025-08-25T00:00:00.000Z",
    "weekNumber": 35,
    "weekLabel": "Week 35 - Aug 25",
    "totalStudents": 24,
    "averageScore": 84.4,
    "grade": "Grade 6",
    "className": "Class 6-A",
    "subject": "Both Math & Reading",
    "students": Array.from({length: 24}, (_, i) => [
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Math",
        "score": Math.floor(Math.random() * 30) + 70,
        "grade": "Grade 6",
        "className": "Class 6-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      },
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Reading",
        "score": Math.floor(Math.random() * 30) + 70,
        "grade": "Grade 6",
        "className": "Class 6-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      }
    ]).flat()
  },
  // Grade 7 - Ms.Garcia
  {
    "id": "week35_garcia",
    "teacherName": "Ms.Garcia",
    "uploadTime": "2025-08-25T00:00:00.000Z",
    "weekNumber": 35,
    "weekLabel": "Week 35 - Aug 25",
    "totalStudents": 23,
    "averageScore": 87.6,
    "grade": "Grade 7",
    "className": "Class 7-A",
    "subject": "Both Math & Reading",
    "students": Array.from({length: 23}, (_, i) => [
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Math",
        "score": Math.floor(Math.random() * 25) + 75,
        "grade": "Grade 7",
        "className": "Class 7-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      },
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Reading",
        "score": Math.floor(Math.random() * 25) + 75,
        "grade": "Grade 7",
        "className": "Class 7-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      }
    ]).flat()
  },
  // Grade 8 - Mr.Thompson
  {
    "id": "week35_thompson",
    "teacherName": "Mr.Thompson",
    "uploadTime": "2025-08-25T00:00:00.000Z",
    "weekNumber": 35,
    "weekLabel": "Week 35 - Aug 25",
    "totalStudents": 25,
    "averageScore": 88.2,
    "grade": "Grade 8",
    "className": "Class 8-A",
    "subject": "Both Math & Reading",
    "students": Array.from({length: 25}, (_, i) => [
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Math",
        "score": Math.floor(Math.random() * 25) + 75,
        "grade": "Grade 8",
        "className": "Class 8-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      },
      {
        "studentId": `${i + 1}`,
        "studentName": `Student ${i + 1}`,
        "subject": "Reading",
        "score": Math.floor(Math.random() * 25) + 75,
        "grade": "Grade 8",
        "className": "Class 8-A",
        "weekNumber": 35,
        "uploadDate": "2025-08-25T00:00:00.000Z"
      }
    ]).flat()
  }
];

// Calculate proper averages for each upload
cleanBaselineData.forEach(upload => {
  const allScores = upload.students.map(s => s.score);
  upload.averageScore = Math.round((allScores.reduce((sum, score) => sum + score, 0) / allScores.length) * 10) / 10;
});

// Now create Week 36 and 37 for the SAME students
const allWeeksData = [];

cleanBaselineData.forEach(week35Upload => {
  // Add Week 35 (baseline)
  allWeeksData.push(week35Upload);
  
  // Create Week 36 and 37 for the SAME students
  [36, 37].forEach(weekNumber => {
    const weekDate = new Date('2025-08-25');
    weekDate.setDate(weekDate.getDate() + ((weekNumber - 35) * 7));
    
    const newWeekUpload = {
      ...week35Upload,
      id: `week${weekNumber}_${week35Upload.teacherName.toLowerCase().replace(/[^a-z]/g, '')}`,
      weekNumber: weekNumber,
      weekLabel: `Week ${weekNumber} - ${weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      uploadTime: weekDate.toISOString(),
      // Same students, improved scores
      students: week35Upload.students.map(student => ({
        ...student,
        score: Math.min(100, Math.max(0, student.score + Math.floor(Math.random() * 8) + (weekNumber - 35) * 2)), // Gradual improvement
        weekNumber: weekNumber,
        uploadDate: weekDate.toISOString()
      }))
    };
    
    // Recalculate average
    const allScores = newWeekUpload.students.map(s => s.score);
    newWeekUpload.averageScore = Math.round((allScores.reduce((sum, score) => sum + score, 0) / allScores.length) * 10) / 10;
    
    allWeeksData.push(newWeekUpload);
  });
});

// Sort by teacher and week
allWeeksData.sort((a, b) => {
  if (a.teacherName !== b.teacherName) {
    return a.teacherName.localeCompare(b.teacherName);
  }
  return a.weekNumber - b.weekNumber;
});

// Write clean data
fs.writeFileSync(
  path.join(__dirname, '../data/uploads.json'),
  JSON.stringify(allWeeksData, null, 2),
  'utf8'
);

console.log('✅ Reset complete! Clean data generated:');
console.log(`Total uploads: ${allWeeksData.length} (should be 27: 9 teachers × 3 weeks)`);

// Verify data integrity
const weekCounts = {};
const teacherCounts = {};
const studentCounts = {};

allWeeksData.forEach(upload => {
  weekCounts[upload.weekNumber] = (weekCounts[upload.weekNumber] || 0) + 1;
  teacherCounts[upload.teacherName] = (teacherCounts[upload.teacherName] || 0) + 1;
  if (!studentCounts[upload.grade]) studentCounts[upload.grade] = upload.totalStudents;
});

console.log('\nWeek distribution:', weekCounts);
console.log('Teachers (should have 3 weeks each):', Object.entries(teacherCounts));
console.log('Student counts by grade:', studentCounts);
