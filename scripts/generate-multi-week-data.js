const fs = require('fs');
const path = require('path');

// Load current data
const currentData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/uploads.json'), 'utf8'));

// Function to generate score variation (realistic progression/regression)
function generateScoreVariation(baseScore, weekOffset) {
  // Add some realistic variation (-5 to +10 points with trend toward improvement)
  const variation = Math.random() * 15 - 5 + (weekOffset * 2); // Slight improvement trend
  const newScore = Math.max(0, Math.min(100, baseScore + variation));
  return Math.round(newScore);
}

// Function to create additional weeks data
function createAdditionalWeeks(currentWeekData) {
  const additionalWeeks = [];
  
  // Current data is Week 35, create Week 36 and Week 37
  for (let weekOffset = 1; weekOffset <= 2; weekOffset++) {
    const weekNumber = 35 + weekOffset;
    const weekDate = new Date('2025-08-25');
    weekDate.setDate(weekDate.getDate() + (weekOffset * 7));
    
    const newWeekData = {
      ...currentWeekData,
      id: `${Date.now() - weekOffset * 100000}`, // Unique ID
      weekNumber: weekNumber,
      weekLabel: `Week ${weekNumber} - ${weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      uploadTime: weekDate.toISOString(),
      students: currentWeekData.students.map(student => ({
        ...student,
        score: generateScoreVariation(student.score, weekOffset), // Later weeks have slightly improved scores
        weekNumber: weekNumber,
        uploadDate: weekDate.toISOString()
      }))
    };
    
    // Recalculate average score for the week
    const mathScores = newWeekData.students.filter(s => s.subject === 'Math').map(s => s.score);
    const readingScores = newWeekData.students.filter(s => s.subject === 'Reading').map(s => s.score);
    const allScores = [...mathScores, ...readingScores];
    newWeekData.averageScore = Math.round((allScores.reduce((sum, score) => sum + score, 0) / allScores.length) * 10) / 10;
    
    additionalWeeks.push(newWeekData);
  }
  
  return additionalWeeks;
}

// Generate multi-week data
const multiWeekData = [];

currentData.forEach(teacherWeekData => {
  // Add the current week (Week 35)
  multiWeekData.push(teacherWeekData);
  
  // Add the additional weeks (Week 36 and 37)
  const additionalWeeks = createAdditionalWeeks(teacherWeekData);
  multiWeekData.push(...additionalWeeks);
});

// Sort by teacher name and then by week number
multiWeekData.sort((a, b) => {
  if (a.teacherName !== b.teacherName) {
    return a.teacherName.localeCompare(b.teacherName);
  }
  return a.weekNumber - b.weekNumber;
});

// Write the new data
fs.writeFileSync(
  path.join(__dirname, '../data/uploads.json'),
  JSON.stringify(multiWeekData, null, 2),
  'utf8'
);

console.log(`Generated multi-week data: ${multiWeekData.length} total uploads`);
console.log('Teachers with 3 weeks of data each:');
const teacherCounts = {};
multiWeekData.forEach(upload => {
  teacherCounts[upload.teacherName] = (teacherCounts[upload.teacherName] || 0) + 1;
});
Object.entries(teacherCounts).forEach(([teacher, count]) => {
  console.log(`  ${teacher}: ${count} weeks`);
});
