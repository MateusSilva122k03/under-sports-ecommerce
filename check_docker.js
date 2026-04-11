const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '178.18.251.129',
  port: 22,
  username: 'root',
  password: 'NontonOrangeMantap122k03'
};

console.log('🔌 Conectando ao servidor via SSH...\n');

conn.on('ready', () => {
  console.log('✅ Conectado! Verificando containers Docker...\n');
  
  // Listar containers
  conn.exec('docker ps -a', (err, stream) => {
    if (err) {
      console.log('❌ Erro ao executar comando:', err.message);
      conn.end();
      return;
    }
    
    let output = '';
    let errorOutput = '';
    
    stream.on('close', (code) => {
      console.log('📦 Containers Docker:');
      console.log('====================');
      console.log(output || 'Nenhum container encontrado');
      
      if (errorOutput) {
        console.log('\n⚠️ Erros:', errorOutput);
      }
      
      // Verificar Nginx
      conn.exec('systemctl status nginx 2>&1 || service nginx status 2>&1', (err2, stream2) => {
        if (err2) {
          console.log('\n❌ Erro ao verificar Nginx');
          conn.end();
          return;
        }
        
        let nginxOutput = '';
        stream2.on('close', () => {
          console.log('\n🌐 Status do Nginx:');
          console.log('===================');
          console.log(nginxOutput || 'Não foi possível verificar');
          
          // Verificar rede docker
          conn.exec('docker network ls', (err3, stream3) => {
            let networkOutput = '';
            stream3.on('close', () => {
              console.log('\n🔗 Redes Docker:');
              console.log('================');
              console.log(networkOutput || 'Nenhuma rede encontrada');
              conn.end();
            });
            stream3.on('data', (data) => { networkOutput += data.toString(); });
            stream3.stderr.on('data', (data) => { networkOutput += data.toString(); });
          });
        });
        stream2.on('data', (data) => { nginxOutput += data.toString(); });
        stream2.stderr.on('data', (data) => { nginxOutput += data.toString(); });
      });
    });
    
    stream.on('data', (data) => { output += data.toString(); });
    stream.stderr.on('data', (data) => { errorOutput += data.toString(); });
  });
});

conn.on('error', (err) => {
  console.log('❌ Erro de conexão:', err.message);
});

conn.connect(config);
