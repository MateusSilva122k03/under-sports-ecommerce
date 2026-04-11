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
    
    # Ver todas as vars de ambiente do code-backend
    print("\n=== Todas vars de ambiente do code-backend ===")
    stdin, stdout, stderr = ssh.exec_command("docker exec code-backend-1 env")
    print(stdout.read().decode())
    
    # Verificar o que está rodando
    print("\n=== Verificando Traefik para ver qual backend está sendo usado ===")
    stdin, stdout, stderr = ssh.exec_command("docker ps --format '{{.Names}} {{.Ports}}' | grep -E 'backend|3001'")
    print(stdout.read().decode())
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
