const supabaseUrl = "https://aobhyokrperslxrqdrxn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvYmh5b2tycGVyc2x4cnFkcnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDA4NTMsImV4cCI6MjEwNTMxNjg1M30.5H6wgJdSmuNVxt_W_M4f0VlRjl21D3TzAe1eXVDzKpE";

async function testFetch() {
  const url = `${supabaseUrl}/rest/v1/products?limit=1`;
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("HTTP Error:", res.status, errorText);
    } else {
      const data = await res.json();
      console.log("Success Fetch!", data);
    }
  } catch(e) {
    console.error("Fetch Error:", e);
  }
}

testFetch();
