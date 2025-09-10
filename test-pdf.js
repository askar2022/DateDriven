// Simple test script to check PDF generation
const puppeteer = require('puppeteer');

async function testPDF() {
  try {
    console.log('Testing PDF generation...');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test PDF</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Test PDF Generation</h1>
        <p>This is a test PDF to verify Puppeteer is working correctly.</p>
        <p>Generated at: ${new Date().toLocaleString()}</p>
      </body>
      </html>
    `;
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(1000);
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    
    await browser.close();
    
    console.log('PDF generated successfully!');
    console.log('PDF size:', pdf.length, 'bytes');
    
    // Save to file for testing
    const fs = require('fs');
    fs.writeFileSync('test-output.pdf', pdf);
    console.log('Test PDF saved as test-output.pdf');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

testPDF();
