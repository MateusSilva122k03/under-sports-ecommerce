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
  
  // Verificar rotas do Traefik
  conn.exec('docker exec dokploy-traefik cat /etc/traefik/dynamic-config.yml 2>/dev/null || docker exec dokploy-traefik cat /etc/traefik/traefik.yml 2>/dev/null || echo "Config não encontrada"', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('🔍 Configuração do Traefik:');
      console.log('=========================');
      console.log(output || 'Não foi possível ler a config');
      
      // Verificar labels do container frontend
      conn.exec('docker inspect compose-generate-auxiliary-application-i6hn29-frontend-1 --format "{{json .Config.Labels}}"', (err2, stream2) => {
        let labels = '';
        stream2.on('close', () => {
          console.log('\n🏷️ Labels do Frontend (Traefik):');
          console.log('===============================');
          console.log(labels || 'Sem labels');
          
          // Verificar labels do container backend
          conn.exec('docker inspect compose-generate-auxiliary-application-i6hn29-backend-1 --format "{{json .Config.Labels}}"', (err3, stream3) => {
            let labelsBackend = '';
            stream3.on('close', () => {
              console.log('\n🏷️ Labels do Backend (Traefik):');
              console.log('===============================');
              console.log(labelsBackend || 'Sem labels');
              
              // Testar acesso ao frontend via Traefik
              conn.exec('docker exec dokploy-traefik wget -qO- http://10.0.1.50:3001/api/health 2>&1 || curl -s http://10.0.1.50:3001/api/health 2>&1 || echo "Falha ao testar"', (err4, stream4) => {
                let test = '';
                stream4.on('close', () => {
                  console.log('\n🧪 Teste Traefik -> Backend:');
                  console.log('===========================');
                  console.log(test);
                  conn.end();
                });
                stream4.on('data', (data) => { test += data.toString(); });
              });
            });
            stream3.on('data', (data) => { labelsBackend += data.toString(); });
          });
        });
        stream2.on('data', (data) => { labels += data.toString(); });
      });
    });
    stream.on('data', (data) => { output += data.toString(); });
  });
});

conn.on('error', (err) => {
  console.log('❌ Erro:', err.message);
});

conn.connect(config);
