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
  
  // Ver logs do container ativo
  conn.exec('docker ps --format "{{.Names}}" | grep backend', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('Container backend:', output.trim() || 'Nenhum');
      
      // Ver logs
      const containerName = output.trim();
      if (containerName) {
        conn.exec('docker logs ' + containerName + ' --tail 50 2>&1', (err2, stream2) => {
          let out2 = '';
          stream2.on('close', () => {
            console.log('\n📝 Logs:');
            console.log(out2);
            conn.end();
          });
          stream2.on('data', (data) => { out2 += data.toString(); });
        });
      } else {
        console.log('Nenhum container de backend encontrado');
        conn.end();
      }
    });
    stream.on('data', (data) => { output += data.toString(); });
  });
});

conn.on('error', (err) => {
  console.log('❌ Erro:', err.message);
});

conn.connect(config);
