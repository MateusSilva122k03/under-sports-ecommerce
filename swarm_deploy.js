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
  
  // Verificar se swarm está ativo
  conn.exec('docker info | grep "Swarm"', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('Swarm status:');
      console.log(output);
      
      // Ver serviços do Dokploy
      conn.exec('docker stack ps dokploy 2>/dev/null || docker service ls 2>/dev/null | head -10', (err2, stream2) => {
        let out2 = '';
        stream2.on('close', () => {
          console.log('\nServiços:');
          console.log(out2);
          
          // O problema é que dokploy usa compose-generate-auxiliary entã vamos ver
          conn.exec('docker ps -a | grep -E "(compose|backend|frontend)" | head -20', (err3, stream3) => {
            let out3 = '';
            stream3.on('close', () => {
              console.log('\nTodos os containers:');
              console.log(out3);
              
              // Vamos verificar o compose que o Dokploy criou
              conn.exec('ls -la /etc/dokploy/compose/', (err4, stream4) => {
                let out4 = '';
                stream4.on('close', () => {
                  console.log('\nDiretórios do compose:');
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
