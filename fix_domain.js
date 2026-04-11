const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '178.18.251.129',
  port: 22,
  username: 'root',
  password: 'NontonOrangeMantap122k03'
};

const DOMAIN = 'undersports.shop';

console.log('🔌 Conectando ao servidor...\n');

conn.on('ready', () => {
  console.log('✅ Conectado!\n');
  
  // Atualizar o docker-compose.yml com o novo domínio
  const composeUpdate = `
version: "3.8"
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    depends_on:
      - backend
    restart: unless-stopped
    environment:
      - VITE_API_URL=/api
    labels:
      - traefik.docker.network=dokploy-network
      - traefik.enable=true
      - traefik.http.routers.frontend.rule=Host(\`${DOMAIN}\`)
      - traefik.http.routers.frontend.entrypoints=web
      - traefik.http.routers.frontend.middlewares=redirect-to-https@file
      - traefik.http.routers.frontend-secure.rule=Host(\`${DOMAIN}\`)
      - traefik.http.routers.frontend-secure.entrypoints=websecure
      - traefik.http.routers.frontend-secure.tls.certresolver=letsencrypt
      - traefik.http.services.frontend.loadbalancer.server.port=80
    networks:
      - dokploy-network
      - default
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    restart: unless-stopped
    networks:
      - dokploy-network
networks:
  dokploy-network:
    external: true
`;

  // Escrever novo compose
  const cmd = `cat > /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml << 'EOF'
${composeUpdate}
EOF`;

  console.log('📝 Atualizando docker-compose.yml com domínio:', DOMAIN);
  
  conn.exec(cmd, (err, stream) => {
    let output = '';
    stream.on('close', (code) => {
      console.log('✅ docker-compose.yml atualizado!\n');
      
      // Agora fazer o redeploy
      console.log('🔄 Fazendo redeploy...');
      
      conn.exec('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose up -d --build', (err2, stream2) => {
        let output2 = '';
        stream2.on('close', (code2) => {
          console.log('✅ Redeploy concluído!\n');
          
          // Verificar se os containers estão rodando
          conn.exec('docker ps --filter "name=compose-generate" --format "table {{.Names}}\\t{{.Status}}"', (err3, stream3) => {
            let output3 = '';
            stream3.on('close', () => {
              console.log('📦 Containers em execução:');
              console.log(output3);
              
              // Testar o domínio
              console.log('🌐 Testando domínio...');
              conn.end();
            });
            stream3.on('data', (data) => { output3 += data.toString(); });
          });
        });
        stream2.on('data', (data) => { output2 += data.toString(); });
      });
    });
    stream.on('data', (data) => { output += data.toString(); });
  });
});

conn.on('error', (err) => {
  console.log('❌ Erro:', err.message);
});

conn.connect(config);
