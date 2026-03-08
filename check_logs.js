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
  
  // Ver logs do backend
  conn.exec('docker logs compose-generate-auxiliary-application-i6hn29-backend-1 --tail 30 2>&1', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('📝 Logs do Backend:');
      console.log(output);
      
      // Ver variáveis
      conn.exec('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep -E "(SAFEPAY|CHECKIFY)"', (err2, stream2) => {
        let out2 = '';
        stream2.on('close', () => {
          console.log('\n🔐 Variáveis:');
          console.log(out2 || 'Nenhuma');
          conn.end();
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
