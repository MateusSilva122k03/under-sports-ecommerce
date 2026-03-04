const DOKPLOY_URL = 'https://dokploy.recarga8.shop';
const DOKPLOY_TOKEN = 'Orq_agentwGIuTTcAJToLMGTDwEkZbyMlEOxToHzuXpKfKlcoRlGOXGcpYAmfEujidRFYuLMB';

async function test() {
  try {
    console.log('Testing Dokploy API...');
    
    // Teste com fetch direto
    const response = await fetch(`${DOKPLOY_URL}/api/v1/projects`, {
      headers: {
        'Authorization': DOKPLOY_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Projects:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
