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

console.log('🔌 Conectando ao servidor...\n');

conn.on('ready', () => {
  console.log('✅ Conectado!\n');
  
  // Primeiro, verificar se o compose foi atualizado corretamente
  console.log('📝 Verificando docker-compose.yml...');
  
  conn.exec('cat /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml | grep -A5 "backend:"', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('Configuração do backend:');
      console.log(output);
      
      // Forçar rebuild completo - remover container e imagem
      console.log('\n🔄 Forçando rebuild completo...\n');
      
      conn.exec('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose down --remove-orphans', (err2, stream2) => {
        let output2 = '';
        stream2.on('close', () => {
          console.log('Containers removidos.\n');
          
          // Limpar imagens antigas
          console.log('🧹 Limpando imagens antigas...\n');
          
          conn.exec('docker rmi $(docker images "compose-generate-auxiliary-application-i6hn29-*" -q) 2>/dev/null || true', (err3, stream3) => {
            let output3 = '';
            stream3.on('close', () => {
              console.log('Imagens limpas.\n');
              
              // Rebuild com --no-cache
              console.log('🔨 Fazendo build sem cache...\n');
              
              conn.exec('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose build --no-cache backend', (err4, stream4) => {
                let output4 = '';
                stream4.on('close', (code) => {
                  console.log('Build concluído.\n');
                  
                  // Subir o container
                  console.log('🚀 Subindo containers...\n');
                  
                  conn.exec('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose up -d backend', (err5, stream5) => {
                    let output5 = '';
                    stream5.on('close', () => {
                      console.log('Container iniciado.\n');
                      
                      // Aguardar um momento e verificar
                      setTimeout(() => {
                        // Verificar se o container está rodando
                        conn.exec('docker ps --filter "name=backend"', (err6, stream6) => {
                          let output6 = '';
                          stream6.on('close', () => {
                            console.log('Containers:');
                            console.log(output6);
                            
                            // Verificar variáveis de ambiente
                            conn.exec('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep -E "(SAFEPAY|CHECKIFY)"', (err7, stream7) => {
                              let output7 = '';
                              stream7.on('close', () => {
                                console.log('\n🔐 Variáveis de ambiente:');
                                console.log(output7 || 'Nenhuma variável encontrada!');
                                
                                // Se não encontrou,，我们需要手动设置
                                if (!output7.includes('SAFEPAY')) {
                                  console.log('\n⚠️ Variáveis não encontradas. Tentando另一种方法...\n');
                                }
                                
                                // Testar a API
                                conn.exec('curl -s https://undersports.shop/api/health', (err8, stream8) => {
                                  let output8 = '';
                                  stream8.on('close', () => {
                                    console.log('Health:', output8);
                                    console.log('\n✅ Concluído!');
                                    conn.end();
                                  });
                                  stream8.on('data', (data) => { output8 += data.toString(); });
                                });
                              });
                              stream7.on('data', (data) => { output7 += data.toString(); });
                            });
                          });
                          stream6.on('data', (data) => { output6 += data.toString(); });
                        });
                      }, 5000);
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
