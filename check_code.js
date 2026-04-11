const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '178.18.251.129',
  port: 22,
  username: 'root',
  password: 'NontonOrangeMantap122k03'
};

console.log('🔌 Conectando...\n');

conn.on('ready', () => {
  console.log('✅ Conectado!\n');
  
  // Ver variáveis do novo backend
  conn.exec('docker exec code-backend-1 env | grep -E "(SAFEPAY|CHECKIFY|PORT)"', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('🔐 Variáveis do code-backend:');
      console.log(output || 'Nenhuma');
      
      // Ver logs
      conn.exec('docker logs code-backend-1 --tail 20', (err2, stream2) => {
        let out2 = '';
        stream2.on('close', () => {
          console.log('\n📝 Logs do code-backend:');
          console.log(out2);
          
          // Testar health interno
          conn.exec('docker exec code-backend-1 wget -qO- http://localhost:3001/api/health', (err3, stream3) => {
            let out3 = '';
            stream3.on('close', () => {
              console.log('\n🌐 Health interno:', out3 || 'Falhou');
              
              // Ver rotas do Traefik
              conn.exec('docker exec dokploy-traefik wget -qO- http://localhost:8080/api/http/routers 2>/dev/null | python3 -m json.tool 2>/dev/null | grep -E "code|undersports" | head -20', (err4, stream4) => {
                let out4 = '';
                stream4.on('close', () => {
                  console.log('\n🛣️ Rotas do Traefik:');
                  console.log(out4 || 'Nenhuma rota encontrada');
                  conn.end();
                });
                stream4.on('data', (data) => { out4 += data.toString(); });
              });
            });
            stream3.on('data', (data) => { out3 += data.toString(); });
          });
        });
        stream2.on('data', (data) => { out2 += data.toString(); });
      });
    });
    stream.on('data', (data) => { output += data.toString(); });
  });
});

conn.on('error', (err) => {
  console.log('❌ Erro:', err.message);
});

conn.connect(config);
