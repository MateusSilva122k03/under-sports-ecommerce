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
  
  // Ver containers
  conn.exec('docker ps -a --filter "name=compose-generate"', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('📦 Containers:');
      console.log(output);
      
      // Ver variáveis
      conn.exec('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env 2>/dev/null | grep -E "(SAFEPAY|CHECKIFY|PORT)" || echo "Container não encontrado ou sem variáveis"', (err2, stream2) => {
        let out2 = '';
        stream2.on('close', () => {
          console.log('\n🔐 Variáveis:');
          console.log(out2);
          
          // Ver logs
          conn.exec('docker logs compose-generate-auxiliary-application-i6hn29-backend-1 --tail 10 2>&1', (err3, stream3) => {
            let out3 = '';
            stream3.on('close', () => {
              console.log('\n📝 Logs:');
              console.log(out3);
              conn.end();
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
