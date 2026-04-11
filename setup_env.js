const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '178.18.251.129',
  port: 22,
  username: 'root',
  password: 'NontonOrangeMantap122k03'
};

// Credenciais fornecidas pelo usuário
const SAFEPAY_SECRET_KEY = 'sk_production_05e2372ea4a189558745f21bc4bc182c93f80cbc18360ced751da99fb7232e7e';
const CHECKIFY_API_KEY = 'ck_4e5edf84e6b93778bb5f524c0337ffe42245890377c95aed1d79b67797e0a392';

console.log('🔌 Conectando ao servidor...\n');

conn.on('ready', () => {
  console.log('✅ Conectado!\n');
  
  // Primeiro, verificar o docker-compose.yml atual
  console.log('📝 Verificando docker-compose.yml atual...');
  
  conn.exec('cat /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('Docker compose atual:\n', output.substring(0, 500));
      
      // Atualizar docker-compose.yml com variáveis de ambiente
      const newCompose = `version: "3.8"
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
      - SAFEPAY_SECRET_KEY=${SAFEPAY_SECRET_KEY}
      - CHECKIFY_API_KEY=${CHECKIFY_API_KEY}
    networks:
      - dokploy-network
networks:
  dokploy-network:
    external: true
`;
      
      console.log('\n📝 Atualizando docker-compose.yml com variáveis de ambiente...\n');
      
      const cmd = `cat > /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml << 'EOF'
${newCompose}
EOF`;
      
      conn.exec(cmd, (err2, stream2) => {
        let output2 = '';
        stream2.on('close', () => {
          console.log('✅ docker-compose.yml atualizado com variáveis de ambiente!\n');
          
          // Agora fazer o redeploy
          console.log('🔄 Fazendo rebuild e deploy...');
          
          conn.exec('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose down && docker compose up -d --build', (err3, stream3) => {
            let output3 = '';
            stream3.on('close', (code) => {
              console.log('✅ Deploy concluído!\n');
              
              // Verificar se o container está rodando
              conn.exec('docker ps --filter "name=compose-generate-auxiliary-application-i6hn29-backend"', (err4, stream4) => {
                let output4 = '';
                stream4.on('close', () => {
                  console.log('📦 Containers em execução:');
                  console.log(output4);
                  
                  // Verificar variáveis de ambiente dentro do container
                  conn.exec('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep -E "(SAFEPAY|CHECKIFY|PORT)"', (err5, stream5) => {
                    let output5 = '';
                    stream5.on('close', () => {
                      console.log('\n🔐 Variáveis de ambiente configuradas:');
                      console.log(output5 || 'Nenhuma variável encontrada');
                      
                      // Testar a API
                      console.log('\n🌐 Testando API...');
                      conn.exec('docker exec dokploy-traefik wget -qO- https://undersports.shop/api/health', (err6, stream6) => {
                        let output6 = '';
                        stream6.on('close', () => {
                          console.log('Health check:', output6);
                          console.log('\n✅ Configuração concluída!');
                          conn.end();
                        });
                        stream6.on('data', (data) => { output6 += data.toString(); });
                      });
                    });
                    stream5.on('data', (data) => { output5 += data.toString(); });
                  });
                });
                stream4.on('data', (data) => { output4 += data.toString(); });
              });
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
