#!/usr/bin/env python3
import paramiko
import requests
import json

HOST = '178.18.251.129'
PORT = 22
USERNAME = 'root'
PASSWORD = 'NontonOrangeMantap122k03'

# URL do backend
BACKEND_URL = "https://dokploy.recarga8.shop"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {HOST}...")
    ssh.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)
    print("Connected!")
    
    # Testar a API Pix diretamente no container
    print("\n=== Testando API Pix no container ===")
    
    # Criar uma requisição de pagamento Pix
    test_data = {
        "amount": 100,  # R$ 1,00 em centavos
        "description": "Teste de pagamento Pix"
    }
    
    # Usar curl dentro do container para testar
    cmd = f"docker exec code-backend-1 curl -s -X POST http://localhost:3001/api/pix/create -H 'Content-Type: application/json' -d '{json.dumps(test_data)}'"
    
    stdin, stdout, stderr = ssh.exec_command(cmd)
    result = stdout.read().decode()
    print(f"Response: {result}")
    
    ssh.close()
    print("\n=== Teste concluído! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
