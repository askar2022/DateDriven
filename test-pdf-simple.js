// Simple test to verify PDF generation works correctly
const puppeteer = require('puppeteer');
const fs = require('fs');

async function testPDFGeneration() {
  console.log('🔍 Testing PDF generation...');
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    console.log('✅ Browser launched successfully');

    const page = await browser.newPage();
    console.log('✅ New page created');
    
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });
    console.log('✅ Viewport set');
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test PDF</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            margin: 0;
            background: white;
          }
          h1 { color: #333; text-align: center; }
          .content { margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Student Performance Report</h1>
        <div class="content">
          <p><strong>Test PDF Generation</strong></p>
          <p>This is a test PDF to verify the generation is working correctly.</p>
          <p>Generated at: ${new Date().toLocaleString()}</p>
          <p>If you can see this content properly, the PDF generation is working!</p>
        </div>
      </body>
      </html>
    `;
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    console.log('✅ HTML content set');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Wait completed');
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      displayHeaderFooter: false,
      tagged: false
    });
    
    console.log('✅ PDF generated, size:', pdf.length, 'bytes');
    
    // Validate PDF
    if (!pdf || pdf.length === 0) {
      console.error('❌ PDF is empty or invalid');
      return;
    }
    
    // Check if it starts with PDF header
    const pdfHeader = pdf.slice(0, 4).toString();
    if (pdfHeader !== '%PDF') {
      console.error('❌ PDF does not have proper header:', pdfHeader);
      return;
    }
    
    console.log('✅ PDF generated successfully!');
    console.log('📊 PDF size:', pdf.length, 'bytes');
    console.log('📄 PDF header:', pdfHeader);
    
    // Save to file for testing
    fs.writeFileSync('test-pdf-output.pdf', pdf);
    console.log('💾 Test PDF saved as test-pdf-output.pdf');
    console.log('🔍 You can now open this file to verify it works correctly');
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error.message);
    console.error('❌ Error details:', error);
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('✅ Browser closed successfully');
      } catch (closeError) {
        console.error('❌ Error closing browser:', closeError.message);
      }
    }
  }
}

testPDFGeneration();
