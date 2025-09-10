// Test the multi-week API directly
const fetch = require('node-fetch')

async function testAPI() {
  try {
    console.log('Testing multi-week API...')
    
    const response = await fetch('http://localhost:3000/api/reports/multi-week?teacher=Ms.Johnson')
    const data = await response.json()
    
    console.log('API Response:', JSON.stringify(data, null, 2))
    
    if (data.students && data.students.length > 0) {
      console.log('Students found:', data.students.length)
      data.students.forEach(student => {
        console.log(`Student: ${student.name}`)
        console.log('Weeks:', student.weeks.map(w => ({
          week: w.weekNumber,
          math: w.mathScore,
          reading: w.readingScore
        })))
      })
    } else {
      console.log('No students found')
    }
    
  } catch (error) {
    console.error('API Error:', error.message)
  }
}

testAPI()
