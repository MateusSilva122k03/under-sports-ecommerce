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
    
    # Verificar o docker-compose do code
    print("\n=== Verificando docker-compose do code ===")
    stdin, stdout, stderr = ssh.exec_command("docker inspect code-backend-1 --format '{{.Config.Labels}}' | jq")
    print(stdout.read().decode())
    
    # Encontrar o path do compose
    print("\n=== Encontrando path do docker-compose ===")
    stdin, stdout, stderr = ssh.exec_command("docker inspect code-backend-1 --format '{{index .Labels \"com.docker.compose.project.config_files\"}}'")
    path = stdout.read().decode().strip()
    print(f"Path: {path}")
    
    # Verificar docker-compose.yml
    compose_dir = path.replace('/docker-compose.yml', '')
    print(f"\n=== Verificando docker-compose em {compose_dir} ===")
    stdin, stdout, stderr = ssh.exec_command(f"cat {compose_dir}/docker-compose.yml | grep -A10 'backend:'")
    print(stdout.read().decode())
    
    # Verificar .env
    print("\n=== Verificando .env ===")
    stdin, stdout, stderr = ssh.exec_command(f"cat {compose_dir}/.env 2>/dev/null || echo 'No .env file'")
    print(stdout.read().decode())
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
