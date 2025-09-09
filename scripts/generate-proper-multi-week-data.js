const fs = require('fs');
const path = require('path');

// Load only Week 35 data (the original baseline)
const allData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/uploads.json'), 'utf8'));
const week35Data = allData.filter(upload => upload.weekNumber === 35);

console.log(`Found ${week35Data.length} Week 35 uploads to use as baseline`);

// Function to generate realistic score progression
function generateScoreProgression(baseScore, weekNumber) {
  // Week 35 = baseline, Week 36 = slight improvement, Week 37 = more improvement
  if (weekNumber === 35) return baseScore; // Keep original
  
  const weeksSinceBaseline = weekNumber - 35;
  // Add 0-8 points improvement with some randomness
  const improvement = Math.random() * 8 * weeksSinceBaseline;
  const newScore = Math.max(0, Math.min(100, baseScore + improvement));
  return Math.round(newScore);
}

// Generate multi-week data for the same students
const multiWeekData = [];

// For each teacher's Week 35 data, generate Week 36 and Week 37 for the SAME students
week35Data.forEach(week35Upload => {
  console.log(`Processing ${week35Upload.teacherName} - ${week35Upload.grade}`);
  
  // Add Week 35 (original)
  multiWeekData.push(week35Upload);
  
  // Generate Week 36 and Week 37 for the SAME students
  [36, 37].forEach(weekNumber => {
    const weekDate = new Date('2025-08-25'); // Week 35 base date
    weekDate.setDate(weekDate.getDate() + ((weekNumber - 35) * 7));
    
    // Create new week data with SAME students but updated scores
    const newWeekUpload = {
      ...week35Upload,
      id: `${week35Upload.id}_week${weekNumber}`, // Unique but traceable ID
      weekNumber: weekNumber,
      weekLabel: `Week ${weekNumber} - ${weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      uploadTime: weekDate.toISOString(),
      // Update the SAME students with new scores for this week
      students: week35Upload.students.map(student => ({
        ...student,
        score: generateScoreProgression(student.score, weekNumber),
        weekNumber: weekNumber,
        uploadDate: weekDate.toISOString()
      }))
    };
    
    // Recalculate average score for the week
    const allScores = newWeekUpload.students.map(s => s.score);
    newWeekUpload.averageScore = Math.round((allScores.reduce((sum, score) => sum + score, 0) / allScores.length) * 10) / 10;
    
    multiWeekData.push(newWeekUpload);
  });
});

// Sort by teacher name and then by week number
multiWeekData.sort((a, b) => {
  if (a.teacherName !== b.teacherName) {
    return a.teacherName.localeCompare(b.teacherName);
  }
  return a.weekNumber - b.weekNumber;
});

// Write the corrected data
fs.writeFileSync(
  path.join(__dirname, '../data/uploads.json'),
  JSON.stringify(multiWeekData, null, 2),
  'utf8'
);

console.log(`\nGenerated proper multi-week data:`);
console.log(`Total uploads: ${multiWeekData.length}`);
console.log(`Expected: ${week35Data.length * 3} (${week35Data.length} teachers × 3 weeks)`);

// Verify student consistency
console.log('\nStudent count verification:');
const teacherStats = {};
multiWeekData.forEach(upload => {
  if (!teacherStats[upload.teacherName]) {
    teacherStats[upload.teacherName] = {};
  }
  teacherStats[upload.teacherName][`week${upload.weekNumber}`] = upload.totalStudents;
});

Object.entries(teacherStats).forEach(([teacher, weeks]) => {
  const studentCounts = Object.values(weeks);
  const consistent = studentCounts.every(count => count === studentCounts[0]);
  console.log(`  ${teacher}: Week 35=${weeks.week35}, Week 36=${weeks.week36}, Week 37=${weeks.week37} ${consistent ? '✓' : '✗'}`);
});

const weekCounts = {};
multiWeekData.forEach(upload => {
  weekCounts[upload.weekNumber] = (weekCounts[upload.weekNumber] || 0) + 1;
});
console.log('\nWeek distribution:');
Object.entries(weekCounts).forEach(([week, count]) => {
  console.log(`  Week ${week}: ${count} uploads`);
});
