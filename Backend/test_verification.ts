const API_BASE_URL = 'http://localhost:5000/api';

async function testApi() {
  const cases = [
    { name: 'Default pagination', url: '/medicines' },
    { name: 'Explicit zero offset', url: '/medicines?limit=2&offset=0' },
    { name: 'Non-zero offset', url: '/medicines?limit=2&offset=5' },
    { name: 'Large offset', url: '/medicines?limit=10&offset=20' },
    { name: 'Invalid offset', url: '/medicines?offset=invalid' },
    { name: 'Empty offset', url: '/medicines?offset=' },
  ];

  for (const tc of cases) {
    console.log(`Testing: ${tc.name} (${tc.url})`);
    try {
      const res = await fetch(`${API_BASE_URL}${tc.url}`);
      const data = await res.json();
      if (data.success) {
        console.log(`✅ Success. Total: ${data.meta?.total}, Limit: ${data.meta?.limit}, Offset: ${data.meta?.offset}`);
      } else {
        console.log(`❌ Error from API: ${data.message}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(`❌ Request failed: ${err.message}`);
      } else {
        console.error(`❌ Request failed: ${String(err)}`);
      }
    }
    console.log('---');
  }
}

testApi();
