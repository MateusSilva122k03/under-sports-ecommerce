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
    
    # Verificar variáveis de ambiente
    print("\n=== Verificando variáveis de ambiente ===")
    stdin, stdout, stderr = ssh.exec_command("docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep -E 'SAFEPAY|CHECKIFY'")
    output = stdout.read().decode()
    print(output)
    
    if not output.strip():
        print("WARNING: Variáveis não encontradas!")
    
    # Verificar logs do backend
    print("\n=== Verificando logs do backend ===")
    stdin, stdout, stderr = ssh.exec_command("docker logs compose-generate-auxiliary-application-i6hn29-backend-1 --tail 20")
    print(stdout.read().decode())
    
    ssh.close()
    print("\n=== Verificação concluída! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
