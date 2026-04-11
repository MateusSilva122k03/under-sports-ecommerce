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
  
  // Forçar rebuild completo
  console.log('🔄 Forçando rebuild completo...\n');
  
  conn.exec('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose down -v 2>/dev/null; docker compose build --no-cache; docker compose up -d', (err, stream) => {
    let output = '';
    stream.on('close', () => {
      console.log('Deploy concluído.\n');
      
      setTimeout(() => {
        // Ver containers
        conn.exec('docker ps -a --filter "name=compose-generate"', (err2, stream2) => {
          let out2 = '';
          stream2.on('close', () => {
            console.log('📦 Containers:');
            console.log(out2);
            
            // Ver variáveis
            conn.exec('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep -E "(SAFEPAY|CHECKIFY)"', (err3, stream3) => {
              let out3 = '';
              stream3.on('close', () => {
                console.log('\n🔐 Variáveis:');
                console.log(out3 || 'Nenhuma');
                
                // Testar API
                conn.exec('curl -sk https://undersports.shop/api/health', (err4, stream4) => {
                  let out4 = '';
                  stream4.on('close', () => {
                    console.log('\n🌐 API:', out4);
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
      }, 30000);
    });
    stream.on('data', (data) => { output += data.toString(); });
  });
});

conn.on('error', (err) => {
  console.log('❌ Erro:', err.message);
});

conn.connect(config);
