const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

const config = {
  host: '178.18.251.129',
  port: 22,
  username: 'root',
  password: 'NontonOrangeMantap122k03'
};

// Criar o arquivo docker-compose.yml localmente primeiro
const composeContent = `version: "3.8"
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
      - traefik.http.routers.frontend.rule=Host(\`undersports.shop\`)
      - traefik.http.routers.frontend.entrypoints=web
      - traefik.http.routers.frontend.middlewares=redirect-to-https@file
      - traefik.http.routers.frontend-secure.rule=Host(\`undersports.shop\`)
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
    environment:
      - NODE_ENV=production
      - PORT=3001
      - SAFEPAY_SECRET_KEY=sk_production_05e2372ea4a189558745f21bc4bc182c93f80cbc18360ced751da99fb7232e7e
      - CHECKIFY_API_KEY=ck_4e5edf84e6b93778bb5f524c0337ffe42245890377c95aed1d79b67797e0a392
    labels:
      - traefik.docker.network=dokploy-network
      - traefik.enable=true
      - traefik.http.routers.backend.rule=Host(\`undersports.shop\`) && PathPrefix(\`/api\`)
      - traefik.http.routers.backend.entrypoints=web
      - traefik.http.routers.backend.middlewares=redirect-to-https@file
      - traefik.http.routers.backend-secure.rule=Host(\`undersports.shop\`) && PathPrefix(\`/api\`)
      - traefik.http.routers.backend-secure.entrypoints=websecure
      - traefik.http.routers.backend-secure.tls.certresolver=letsencrypt
      - traefik.http.services.backend.loadbalancer.server.port=3001
    networks:
      - dokploy-network
networks:
  dokploy-network:
    external: true
`;

// Salvar localmente
fs.writeFileSync('/tmp/docker-compose.yml', composeContent);
console.log('Arquivo docker-compose.yml criado localmente');

console.log('🔌 Conectando...\n');

conn.on('ready', () => {
  console.log('✅ Conectado!\n');
  
  // Enviar arquivo via SFTP
  conn.sftp((err, sftp) => {
    if (err) {
      console.log('Erro SFTP:', err.message);
      conn.end();
      return;
    }
    
    console.log('📤 Enviando docker-compose.yml...\n');
    
    sftp.fastPut('/tmp/docker-compose.yml', '/etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml', (err) => {
      if (err) {
        console.log('Erro ao enviar:', err.message);
        conn.end();
        return;
      }
      
      console.log('✅ Arquivo enviado!\n');
      
      // Verificar conteúdo
      conn.exec('cat /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml | head -20', (err2, stream2) => {
        let out2 = '';
        stream2.on('close', () => {
          console.log('Conteúdo do arquivo:');
          console.log(out2);
          
          // Fazer deploy
          console.log('🔄 Fazendo deploy...\n');
          
          conn.exec('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose down && docker compose up -d --build', (err3, stream3) => {
            let out3 = '';
            stream3.on('close', () => {
              console.log('Deploy concluído.\n');
              
              setTimeout(() => {
                // Testar
                conn.exec('curl -sk https://undersports.shop/api/health', (err4, stream4) => {
                  let out4 = '';
                  stream4.on('close', () => {
                    console.log('🌐 API:', out4);
                    conn.end();
                  });
                  stream4.on('data', (data) => { out4 += data.toString(); });
                });
              }, 20000);
            });
            stream3.on('data', (data) => { out3 += data.toString(); });
          });
        });
        stream2.on('data', (data) => { out2 += data.toString(); });
      });
    });
  });
});

conn.on('error', (err) => {
  console.log('❌ Erro:', err.message);
});

conn.connect(config);
