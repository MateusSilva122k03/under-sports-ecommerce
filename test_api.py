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
    
    # Ver todos os logs recentes
    print("\n do code-backend ====== Verificando logs")
    stdin, stdout, stderr = ssh.exec_command("docker logs code-backend-1 --tail 100 2>&1")
    print(stdout.read().decode())
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
