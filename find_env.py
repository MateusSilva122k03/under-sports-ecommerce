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
    
    # Verificar containers rodando
    print("\n=== Containers rodando ===")
    stdin, stdout, stderr = ssh.exec_command("docker ps --format '{{.Names}} {{.Image}}'")
    for line in stdout.read().decode().split('\n'):
        if 'backend' in line.lower() or 'compose' in line.lower():
            print(line)
    
    # Verificar compose-generate
    print("\n=== Verificando compose-generate docker-compose ===")
    stdin, stdout, stderr = ssh.exec_command("ls -la /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/")
    print(stdout.read().decode())
    
    # Verificar o docker-compose.yml do compose-generate
    print("\n=== Verificando docker-compose.yml ===")
    stdin, stdout, stderr = ssh.exec_command("cat /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml | grep -A5 'backend:'")
    print(stdout.read().decode())
    
    # Verificar se existe .env no path
    print("\n=== Verificando .env ===")
    stdin, stdout, stderr = ssh.exec_command("ls -la /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/")
    print(stdout.read().decode())
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
