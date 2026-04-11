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
  
  // Verificar se há configuração de domínio específica
  conn.exec('docker inspect compose-generate-auxiliary-application-i6hn29-frontend-1 --format "{{json .Config.Labels}}" | jq "to_entries | map(select(.key | contains(\"traefik\")))"', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('🏷️ Labels Traefik do Frontend:');
      console.log('===========================');
      console.log(output);
      
      // Verificar rotas do Traefik via API
      conn.exec('docker exec dokploy-traefik wget -qO- http://localhost:8080/api/http/routers 2>/dev/null | head -100', (err2, stream2) => {
        let routers = '';
        stream2.on('close', () => {
          console.log('\n🛣️ Rotas do Traefik:');
          console.log('==================');
          console.log(routers || 'Não foi possível obter rotas');
          
          // Verificar se existe domínio configurado no compose
          conn.exec('cat /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml', (err3, stream3) => {
            let compose = '';
            stream3.on('close', () => {
              console.log('\n📄 docker-compose.yml:');
              console.log('====================');
              console.log(compose);
              conn.end();
            });
            stream3.on('data', (data) => { compose += data.toString(); });
          });
        });
        stream2.on('data', (data) => { routers += data.toString(); });
      });
    });
    stream.on('data', (data) => { output += data.toString(); });
  });
});

conn.on('error', (err) => {
  console.log('❌ Erro:', err.message);
});

conn.connect(config);
