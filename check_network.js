const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '178.18.251.129',
  port: 22,
  username: 'root',
  password: 'NontonOrangeMantap122k03'
};

console.log('🔌 Conectando ao servidor...\n');

conn.on('ready', () => {
  console.log('✅ Conectado!\n');
  
  // Verificar rede do compose
  conn.exec('docker network inspect compose-generate-auxiliary-application-i6hn29_default', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('🔍 Rede do Compose:');
      console.log('==================');
      console.log(output.substring(0, 3000)); // Primeiros 3000 chars
      
      // Verificar logs do frontend
      conn.exec('docker logs compose-generate-auxiliary-application-i6hn29-frontend-1 --tail 20', (err2, stream2) => {
        let logs = '';
        stream2.on('close', () => {
          console.log('\n📝 Logs do Frontend:');
          console.log('===================');
          console.log(logs);
          
          // Verificar logs do backend
          conn.exec('docker logs compose-generate-auxiliary-application-i6hn29-backend-1 --tail 20', (err3, stream3) => {
            let logs3 = '';
            stream3.on('close', () => {
              console.log('\n📝 Logs do Backend:');
              console.log('===================');
              console.log(logs3);
              conn.end();
            });
            stream3.on('data', (data) => { logs3 += data.toString(); });
          });
        });
        stream2.on('data', (data) => { logs += data.toString(); });
      });
    });
    stream.on('data', (data) => { output += data.toString(); });
  });
});

conn.on('error', (err) => {
  console.log('❌ Erro:', err.message);
});

conn.connect(config);
