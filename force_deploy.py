#!/usr/bin/env python3
import paramiko

HOST = '178.18.251.129'
PORT = 22
USERNAME = 'root'
PASSWORD = 'NontonOrangeMantap122k03'

# Novas chaves SafeFyPay
NEW_PUBLIC_KEY = 'pk_production_94d2fa565d7d3d255beb0261af999be26b2ca7ab5f1e631b'
NEW_SECRET_KEY = 'sk_production_3f11374755b817aca84a0df151640cd39541c299a2e7a787e6cf4a7a004a3489'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {HOST}...")
    ssh.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)
    print("Connected!")
    
    # Encontrar o caminho do docker-compose do code
    print("\n=== Encontrando compose do code ===")
    
    # Listar todos os docker-composeyml
    stdin, stdout, stderr = ssh.exec_command("find /etc/dokploy -name 'docker-compose.yml' 2>/dev/null | head -10")
    print("Found files:")
    print(stdout.read().decode())
    
    # Ver qual está sendo usado
    stdin, stdout, stderr = ssh.exec_command("docker ps --format '{{.Names}} {{.Image}}' | grep code-")
    print("\n=== Code containers ===")
    print(stdout.read().decode())
    
    # Verificar variáveis atuais
    stdin, stdout, stderr = ssh.exec_command("docker exec code-backend-1 env | grep -E 'SAFEPAY|CHECKIFY'")
    print("\n=== Variáveis atuais ===")
    print(stdout.read().decode())
    
    # Stop e rebuild do container
    print("\n=== Fazendo stop e rebuild ===")
    stdin, stdout, stderr = ssh.exec_command("docker stop code-backend-1")
    print("Stopped")
    
    stdin, stdout, stderr = ssh.exec_command("docker rm code-backend-1")
    print("Removed")
    
    # Verificar se o código foi atualizado (git pull)
    # Primeiro, encontrar o diretório do projeto
    stdin, stdout, stderr = ssh.exec_command("docker inspect code-backend --format '{{.Config.Labels}}' 2>/dev/null || echo 'not found'")
    
    # Listar compose em /home/dokploy
    stdin, stdout, stderr = ssh.exec_command("ls -la /home/dokploy/ 2>/dev/null || ls -la /etc/dokploy/ 2>/dev/null | head -20")
    print("\n=== Dokploy directories ===")
    print(stdout.read().decode())
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
