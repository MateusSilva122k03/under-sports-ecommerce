const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '178.18.251.129',
  port: 22,
  username: 'root',
  password: 'NontonOrangeMantap122k03'
};

const SAFEPAY_SECRET_KEY = 'sk_production_05e2372ea4a189558745f21bc4bc182c93f80cbc18360ced751da99fb7232e7e';
const CHECKIFY_API_KEY = 'ck_4e5edf84e6b93778bb5f524c0337ffe42245890377c95aed1d79b67797e0a392';

console.log('🔌 Conectando...\n');

conn.on('ready', () => {
  console.log('✅ Conectado!\n');
  
  // 1. Remover containers antigos
  console.log('🧹 Removendo containers antigos...\n');
  
  conn.exec('docker rm -f compose-generate-auxiliary-application-i6hn29-backend-1 code-backend-1 2>/dev/null || true', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('Containers antigos removidos.\n');
      
      // 2. Criar compose com variáveis corretas
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
      - traefik.http.routers.frontend.rule=Host(\\\`undersports.shop\\\`)
      - traefik.http.routers.frontend.entrypoints=web
      - traefik.http.routers.frontend.middlewares=redirect-to-https@file
      - traefik.http.routers.frontend-secure.rule=Host(\\\`undersports.shop\\\`)
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
      - SAFEPAY_SECRET_KEY=${SAFEPAY_SECRET_KEY}
      - CHECKIFY_API_KEY=${CHECKIFY_API_KEY}
    labels:
      - traefik.docker.network=dokploy-network
      - traefik.enable=true
      - traefik.http.routers.backend.rule=Host(\\\`undersports.shop\\\`) && PathPrefix(\\\`/api\\\`)
      - traefik.http.routers.backend.entrypoints=web
      - traefik.http.routers.backend.middlewares=redirect-to-https@file
      - traefik.http.routers.backend-secure.rule=Host(\\\`undersports.shop\\\`) && PathPrefix(\\\`/api\\\`)
      - traefik.http.routers.backend-secure.entrypoints=websecure
      - traefik.http.routers.backend-secure.tls.certresolver=letsencrypt
      - traefik.http.services.backend.loadbalancer.server.port=3001
    networks:
      - dokploy-network
networks:
  dokploy-network:
    external: true
`;
      
      console.log('📝 Escrevendo docker-compose.yml...\n');
      
      const cmd = `cat > /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml << 'EOF'
${composeContent}
EOF`;
      
      conn.exec(cmd, (err2, stream2) => {
        let out2 = '';
        stream2.on('close', () => {
          console.log('Docker compose atualizado.\n');
          
          // 3. Subir containers
          console.log('🚀 Subindo containers...\n');
          
          conn.exec('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose up -d', (err3, stream3) => {
            let out3 = '';
            stream3.on('close', () => {
              console.log('Containers iniciados.\n');
              
              // 4. Aguardar e verificar
              setTimeout(() => {
                // Ver containers
                conn.exec('docker ps --filter "name=compose-generate-auxiliary-application-i6hn29"', (err4, stream4) => {
                  let out4 = '';
                  stream4.on('close', () => {
                    console.log('📦 Containers:');
                    console.log(out4);
                    
                    // Ver variáveis do backend
                    conn.exec('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep -E "(SAFEPAY|CHECKIFY)"', (err5, stream5) => {
                      let out5 = '';
                      stream5.on('close', () => {
                        console.log('\n🔐 Variáveis:');
                        console.log(out5 || 'Nenhuma encontrada!');
                        
                        // Verificar API
                        conn.exec('curl -s https://undersports.shop/api/health', (err6, stream6) => {
                          let out6 = '';
                          stream6.on('close', () => {
                            console.log('\n🌐 API Health:', out6);
                            console.log('\n✅ Concluído!');
                            conn.end();
                          });
                          stream6.on('data', (data) => { out6 += data.toString(); });
                        });
                      });
                      stream5.on('data', (data) => { out5 += data.toString(); });
                    });
                  });
                  stream4.on('data', (data) => { out4 += data.toString(); });
                });
              }, 10000);
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
