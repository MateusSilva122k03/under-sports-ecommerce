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
  conn.exec('docker ps -a', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('📦 Containers:');
      console.log(output);
      
      // Ver logs do backend
      conn.exec('docker logs compose-generate-auxiliary-application-i6hn29-backend-1 --tail 30 2>&1', (err2, stream2) => {
        let logs = '';
        stream2.on('close', () => {
          console.log('\n📝 Logs do Backend:');
          console.log(logs);
          
          // Verificar variáveis
          conn.exec('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep -E "(SAFEPAY|CHECKIFY|PORT)"', (err3, stream3) => {
            let envs = '';
            stream3.on('close', () => {
              console.log('\n🔐 Variáveis:');
              console.log(envs || 'Nenhuma');
              
              // Testar se backend responde
              conn.exec('curl -s http://localhost:3001/api/health', (err4, stream4) => {
                let health = '';
                stream4.on('close', () => {
                  console.log('\n🌐 Health interno:', health || 'Falhou');
                  conn.end();
                });
                stream4.on('data', (data) => { health += data.toString(); });
              });
            });
            stream3.on('data', (data) => { envs += data.toString(); });
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
