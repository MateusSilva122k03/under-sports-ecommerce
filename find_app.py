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
    
    # Ver os aplicativos do Dokploy
    print("\n=== Verificando aplicações Dokploy ===")
    stdin, stdout, stderr = ssh.exec_command("ls -la /etc/dokploy/applications/")
    print(stdout.read().decode())
    
    # Verificar volumes do dokploy
    print("\n=== Verificando volumes ===")
    stdin, stdout, stderr = ssh.exec_command("docker volume ls | grep -E 'code|application'")
    print(stdout.read().decode())
    
    # Verificar onde o código está
    print("\n=== Verificando container definitions ===")
    stdin, stdout, stderr = ssh.exec_command("docker inspect code-backend --format '{{.Config.Labels}}' 2>/dev/null || echo 'No image'")
    print(stdout.read().decode())
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
