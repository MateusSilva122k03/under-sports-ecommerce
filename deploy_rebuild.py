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
    
    # Parar e remover containers antigos
    print("\n=== Parando containers antigos ===")
    stdin, stdout, stderr = ssh.exec_command("docker stop compose-generate-auxiliary-application-i6hn29-backend-1 2>/dev/null; docker rm compose-generate-auxiliary-application-i6hn29-backend-1 2>/dev/null; echo 'Removed old containers'")
    print(stdout.read().decode())
    
    # O dokploy deve recriar automaticamente, mas vamos verificar se há compose
    print("\n=== Verificando compose ===")
    stdin, stdout, stderr = ssh.exec_command("ls -la /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/")
    print(stdout.read().decode())
    
    # Se não houver .env, criar
    print("\n=== Criando .env se necessário ===")
    stdin, stdout, stderr = ssh.exec_command("cat /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/.env 2>/dev/null || echo 'No .env file'")
    print("Current .env:", stdout.read().decode())
    
    # Criar .env com as chaves
    env_content = """# SafeFyPay API Keys
SAFEPAY_PUBLIC_KEY=pk_production_2dd5d41e4f3c44b50c32ed2ecd459a68f0bc1628b3276834
SAFEPAY_SECRET_KEY=sk_production_c4739b936e5341ce4f205dc1acdcc508453602a635f03d9f67ff7595222435af
SAFEPAY_GATEWAY=SafeFyPAy

# Checkify API Key
CHECKIFY_API_KEY=ck_e0bc89b0d7bd7e7b03e403daf61530c3a5182be8b77714767356b8ae26006628

# Server
PORT=3001
NODE_ENV=production
"""
    
    stdin, stdout, stderr = ssh.exec_command(f"echo '{env_content}' > /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/.env")
    print("Created .env file")
    
    # Verificar
    stdin, stdout, stderr = ssh.exec_command("cat /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/.env")
    print("\n=== .env criado ===")
    print(stdout.read().decode())
    
    # Verificar se dokploy recriou o container
    print("\n=== Verificando containers ===")
    stdin, stdout, stderr = ssh.exec_command("sleep 5 && docker ps --format '{{.Names}}' | grep backend")
    print("Backend containers:", stdout.read().decode())
    
    # Ver logs
    print("\n=== Logs do novo container ===")
    stdin, stdout, stderr = ssh.exec_command("docker logs compose-generate-auxiliary-application-i6hn29-backend-1 --tail 10 2>&1 || echo 'Container not running yet'")
    print(stdout.read().decode())
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
