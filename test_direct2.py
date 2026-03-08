#!/usr/bin/env python3
import paramiko

HOST = '178.18.251.129'
PORT = 22
USERNAME = 'root'
PASSWORD = 'NontonOrangeMantap122k03'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {HOST}...")
    ssh.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)
    print("Connected!")
    
    # Testar diretamente no container usando node com http (não https)
    print("\n=== Testando API diretamente no container ===")
    test_cmd = '''docker exec code-backend-1 node -e "
const http = require('http');
const data = JSON.stringify({
  amount: 100,
  description: 'Teste',
  customer: {name: 'Teste', email: 'teste@teste.com', document: '12345678901'}
});
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/create-payment',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};
const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});
req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
"
'''
    stdin, stdout, stderr = ssh.exec_command(test_cmd)
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    
    # Verificar logs
    print("\n=== Verificando logs do container ===")
    stdin, stdout, stderr = ssh.exec_command("docker logs code-backend-1 --tail 30 2>&1")
    print(stdout.read().decode())
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
