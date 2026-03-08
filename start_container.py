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
    
    # Iniciar o container com docker compose
    print("\n=== Starting container ===")
    stdin, stdout, stderr = ssh.exec_command("cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose up -d --build backend")
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    
    # Esperar um poco e verificar
    print("\n=== Waiting for container ===")
    stdin, stdout, stderr = ssh.exec_command("sleep 30 && docker ps")
    print(stdout.read().decode())
    
    # Ver logs
    print("\n=== Logs ===")
    stdin, stdout, stderr = ssh.exec_command("docker logs compose-generate-auxiliary-application-i6hn29-backend-1 --tail 20 2>&1")
    print(stdout.read().decode())
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
