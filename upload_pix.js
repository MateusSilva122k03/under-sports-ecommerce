const { Client } = require('ssh2');
const fs = require('fs');

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
  
  // Ler o arquivo pix.js compilado
  const pixJs = fs.readFileSync('/home/mat.devall122k03/Downloads/Bravio-main backup AND.zip/Bravio-main backup Gab.zip/Under Sports/ecommerce/backend/dist/pix.js', 'utf8');
  
  // Enviar via SFTP
  conn.sftp((err, sftp) => {
    if (err) {
      console.log('Erro SFTP:', err.message);
      conn.end();
      return;
    }
    
    console.log('📤 Enviando pix.js...\n');
    
    // Primeiro, criar o diretório se não existir
    conn.exec('mkdir -p /app/dist', (err1, stream1) => {
      stream1.on('close', () => {
        // Agora enviar o arquivo
        const buffer = Buffer.from(pixJs);
        sftp.writeFile('/app/dist/pix.js', buffer, (err2) => {
          if (err2) {
            console.log('Erro ao enviar:', err2.message);
            conn.end();
            return;
          }
          
          console.log('✅ pix.js enviado!\n');
          
          // Reiniciar o container
          console.log('🔄 Reiniciando container...\n');
          
          conn.exec('docker restart code-backend-1', (err3, stream3) => {
            let out3 = '';
            stream3.on('close', () => {
              console.log('Container reiniciado.\n');
              
              setTimeout(() => {
                // Testar PIX
                console.log('🧪 Testando PIX...\n');
                
                conn.exec('curl -sk -X POST https://undersports.shop/api/create-payment -H "Content-Type: application/json" -d \'{"amount":10000,"description":"Teste PIX","customer":{"name":"Mateus Silva","email":"teste@teste.com","document":"12345678901"}}\'', (err4, stream4) => {
                  let out4 = '';
                  stream4.on('close', () => {
                    console.log('Resultado:', out4);
                    conn.end();
                  });
                  stream4.on('data', (data) => { out4 += data.toString(); });
                });
              }, 10000);
            });
            stream3.on('data', (data) => { out3 += data.toString(); });
          });
        });
      });
      stream1.on('data', (data) => {});
    });
  });
});

conn.on('error', (err) => {
  console.log('❌ Erro:', err.message);
});

conn.connect(config);
