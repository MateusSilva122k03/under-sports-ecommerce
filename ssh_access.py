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
    
    # Fix env_file path - use parent directory
    print("\n=== Fixing env_file path ===")
    stdin, stdout, stderr = ssh.exec_command("sed -i 's|- ./.env|- ../.env|' /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/ecommerce/docker-compose.yml")
    print("Fixed!")
    
    # Verify
    stdin, stdout, stderr = ssh.exec_command("grep -A3 'env_file' /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/ecommerce/docker-compose.yml")
    print(stdout.read().decode())
    
    # Restart
    print("\n=== Restarting containers ===")
    stdin, stdout, stderr = ssh.exec_command("cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/ecommerce && docker compose up -d --build backend")
    print("Restarted!")
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
