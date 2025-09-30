// Simple test to check if file upload processing works
const XLSX = require('xlsx');
const fs = require('fs');

// Read the test CSV file
const testFile = './public/student-names-template.csv';

if (fs.existsSync(testFile)) {
  console.log('✅ Template file exists');
  
  const workbook = XLSX.readFile(testFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('Headers:', jsonData[0]);
  console.log('Data rows:', jsonData.length - 1);
  console.log('Sample data:', jsonData.slice(1, 4));
  
  const headers = jsonData[0];
  const hasStudentName = headers.some(h => h && h.toLowerCase().includes('name'));
  const hasScore = headers.some(h => h && h.toLowerCase().includes('score'));
  
  console.log('\nValidation:');
  console.log('Has Student Name column:', hasStudentName);
  console.log('Has Score column:', hasScore);
  
  if (hasStudentName && hasScore) {
    console.log('\n✅ Template format is correct!');
  } else {
    console.log('\n❌ Template format is incorrect');
  }
} else {
  console.log('❌ Template file not found');
}
