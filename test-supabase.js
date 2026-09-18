const supabaseUrl = "https://aobhyokrperslxrqdrxn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvYmh5b2tycGVyc2x4cnFkcnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDA4NTMsImV4cCI6MjEwNTMxNjg1M30.5H6wgJdSmuNVxt_W_M4f0VlRjl21D3TzAe1eXVDzKpE";

const mockProduct = {
  id: "test-12345",
  sku: "TEST-SKU",
  barcode: "12345",
  name: "Test",
  description: "Test Desc",
  category: "impresoras_3d",
  techType: "fdm",
  brand: "Test",
  price: 100,
  originalPrice: 150,
  images: ["test"],
  sizes: ["Unica"],
  colors: [{name: "Negro", hex: "#000"}],
  stock: 10,
  lowStockThreshold: 4,
  tags: ["test"],
  isFeatured: false,
  isNew: true,
  materials: "Plastic",
  careGuide: "Care",
  createdAt: new Date().toISOString()
};

async function testInsert() {
  const url = `${supabaseUrl}/rest/v1/products`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(mockProduct)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("HTTP Error:", res.status, errorText);
    } else {
      console.log("Success Insert!");
    }
  } catch(e) {
    console.error("Fetch Error:", e);
  }
}

testInsert();
