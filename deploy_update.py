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
    
    # Atualizar variáveis de ambiente no docker-compose.yml do code
    print("\n=== Atualizando docker-compose.yml ===")
    
    # Primeiro, verificar o caminho do compose
    stdin, stdout, stderr = ssh.exec_command("docker inspect code-backend-1 --format '{{index .Labels \"com.docker.compose.project.config_files\"}}'")
    path = stdout.read().decode().strip()
    compose_dir = path.replace('/docker-compose.yml', '')
    print(f"Compose dir: {compose_dir}")
    
    # Verificar se existe .env
    stdin, stdout, stderr = ssh.exec_command(f"ls -la {compose_dir}/.env 2>/dev/null || echo 'No .env'")
    print(f"Current .env: {stdout.read().decode()}")
    
    # Criar/atualizar .env
    env_content = f"""# SafeFyPay API Keys
SAFEPAY_PUBLIC_KEY={NEW_PUBLIC_KEY}
SAFEPAY_SECRET_KEY={NEW_SECRET_KEY}
SAFEPAY_GATEWAY=SafeFyPAy

# Checkify API Key
CHECKIFY_API_KEY=ck_e0bc89b0d7bd7e7b03e403daf61530c3a5182be8b77714767356b8ae26006628

# Server
PORT=3001
NODE_ENV=production
"""
    
    # Escrever .env
    cmd = f'echo "{env_content}" > {compose_dir}/.env'
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    # Verificar
    stdin, stdout, stderr = ssh.exec_command(f"cat {compose_dir}/.env")
    print(f"\n=== .env atualizado ===")
    print(stdout.read().decode())
    
    # Fazer rebuild
    print("\n=== Fazendo rebuild ===")
    stdin, stdout, stderr = ssh.exec_command(f"cd {compose_dir} && docker compose build --no-cache backend")
    print("Build output:", stdout.read().decode())
    
    # Restart
    print("\n=== Reiniciando containers ===")
    stdin, stdout, stderr = ssh.exec_command(f"cd {compose_dir} && docker compose up -d --build backend")
    print("Restart output:", stdout.read().decode())
    
    # Verificar variáveis
    print("\n=== Verificando variáveis de ambiente ===")
    stdin, stdout, stderr = ssh.exec_command("sleep 5 && docker exec code-backend-1 env | grep -E 'SAFEPAY|CHECKIFY'")
    print("ENV:", stdout.read().decode())
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
