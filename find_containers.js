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
  
  // Ver todos os containers
  conn.exec('docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -E "compose|code|backend|frontend"', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('📦 Containers:');
      console.log(output);
      
      // Se não encontrou, ver todos
      if (!output) {
        conn.exec('docker ps -a --format "table {{.Names}}\t{{.Image}}"', (err2, stream2) => {
          let out2 = '';
          stream2.on('close', () => {
            console.log('Todos os containers:');
            console.log(out2);
            conn.end();
          });
          stream2.on('data', (data) => { out2 += data.toString(); });
        });
      } else {
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
