const http = require('http');

const data = JSON.stringify({
  usuario: 'admin',
  password: 'Jaguares2025!'
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', responseData);
    try {
      const json = JSON.parse(responseData);
      console.log('\nParsed:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('No es JSON válido');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
