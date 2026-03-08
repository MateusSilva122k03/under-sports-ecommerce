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
  
  // Ver containers atuais
  conn.exec('docker ps --format "table {{.Names}}\t{{.Status}}"', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('📦 Containers:');
      console.log(output);
      
      // Verificar compose no caminho correto
      conn.exec('ls -la /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/', (err2, stream2) => {
        let out2 = '';
        stream2.on('close', () => {
          console.log('\nDiretório compose:');
          console.log(out2);
          
          // Verificar se existe code dentro
          conn.exec('ls -la /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/', (err3, stream3) => {
            let out3 = '';
            stream3.on('close', () => {
              console.log('\nDiretório code:');
              console.log(out3);
              
              // Verificar docker-compose.yml atual
              conn.exec('cat /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml | head -40', (err4, stream4) => {
                let out4 = '';
                stream4.on('close', () => {
                  console.log('\nDocker compose atual:');
                  console.log(out4);
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
