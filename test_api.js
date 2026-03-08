const https = require('https');

const data = JSON.stringify({
  method: 'Pix',
  amount: 100,
  currency: 'BRL',
  description: 'Test'
});

const req = https.request({
  hostname: 'api-payment.safefypay.com.br',
  path: '/v1/transactions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env.SAFEPAY_SECRET_KEY,
    'Content-Length': data.length
  }
}, (res) => {
  let d = '';
  res.on('data', (chunk) => { d += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', d);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
