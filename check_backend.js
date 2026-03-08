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
  
  // Verificar redes do backend
  conn.exec('docker inspect compose-generate-auxiliary-application-i6hn29-backend-1 --format "{{json .NetworkSettings.Networks}}"', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('🔍 Redes do Backend:');
      console.log('===================');
      console.log(output);
      
      // Verificar IP do backend
      conn.exec('docker inspect compose-generate-auxiliary-application-i6hn29-backend-1 --format "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}"', (err2, stream2) => {
        let ip = '';
        stream2.on('close', () => {
          console.log('\n📍 IP do Backend:', ip || 'NÃO ENCONTRADO');
          
          // Testar conectividade do backend
          conn.exec('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 curl -s http://localhost:3001/api/health', (err3, stream3) => {
            let health = '';
            stream3.on('close', () => {
              console.log('\n🏥 Health check (interno):', health);
              
              // Ver se o backend tem variáveis de ambiente
              conn.exec('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep -E "(PORT|SAFEPAY|CHECKIFY)"', (err4, stream4) => {
                let envs = '';
                stream4.on('close', () => {
                  console.log('\n🔐 Variáveis de Ambiente do Backend:');
                  console.log(envs || 'Nenhuma variável encontrada');
                  conn.end();
                });
                stream4.on('data', (data) => { envs += data.toString(); });
              });
            });
            stream3.on('data', (data) => { health += data.toString(); });
          });
        });
        stream2.on('data', (data) => { ip += data.toString(); });
      });
    });
    stream.on('data', (data) => { output += data.toString(); });
  });
});

conn.on('error', (err) => {
  console.log('❌ Erro:', err.message);
});

conn.connect(config);
