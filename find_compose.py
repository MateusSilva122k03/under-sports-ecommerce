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
    
    # Search for code docker-compose
    print("\n=== Searching for code compose ===")
    stdin, stdout, stderr = ssh.exec_command("find /etc/dokploy -name 'docker-compose.yml' -exec grep -l 'code' {} \\;")
    files = stdout.read().decode().strip()
    print(f"Found: {files}")
    
    # Also check /var/lib/docker
    stdin, stdout, stderr = ssh.exec_command("find / -path '*/code/docker-compose.yml' 2>/dev/null | head -5")
    print("\n=== More search ===")
    print(stdout.read().decode())
    
    # Check docker context
    stdin, stdout, stderr = ssh.exec_command("docker context ls")
    print("\n=== Docker contexts ===")
    print(stdout.read().decode())
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
