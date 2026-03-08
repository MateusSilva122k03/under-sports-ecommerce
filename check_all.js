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
  conn.exec('docker ps -a --filter "name=compose-generate"', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('📦 Containers:');
      console.log(output);
      
      // Ver logs do compose
      conn.exec('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose logs --tail=50', (err2, stream2) => {
        let logs = '';
        stream2.on('close', () => {
          console.log('\n📝 Logs do Compose:');
          console.log(logs);
          
          // Ver docker-compose.yml
          conn.exec('cat /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml', (err3, stream3) => {
            let compose = '';
            stream3.on('close', () => {
              console.log('\n📄 Docker Compose:');
              console.log(compose);
              conn.end();
            });
            stream3.on('data', (data) => { compose += data.toString(); });
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
