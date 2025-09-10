// Using built-in fetch (Node.js 18+)

async function cleanupSupabase() {
  try {
    console.log('🧹 Starting Supabase cleanup...');
    
    const response = await fetch('http://localhost:3001/api/admin/cleanup', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Cleanup successful:', data.message);
    } else {
      console.error('❌ Cleanup failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

cleanupSupabase();
