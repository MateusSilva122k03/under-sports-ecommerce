#!/usr/bin/env python3
import paramiko

HOST = '178.18.251.129'
PORT = 22
USERNAME = 'root'
PASSWORD = 'NontonOrangeMantap122k03'

# Novas chaves SafeFyPay
NEW_PUBLIC_KEY = 'pk_production_2dd5d41e4f3c44b50c32ed2ecd459a68f0bc1628b3276834'
NEW_SECRET_KEY = 'sk_production_c4739b936e5341ce4f205dc1acdcc508453602a635f03d9f67ff7595222435af'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {HOST}...")
    ssh.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)
    print("Connected!")
    
    # Encontrar o compose correto
    print("\n=== Encontrando compose ===")
    stdin, stdout, stderr = ssh.exec_command("docker ps --format '{{.Names}}' | grep backend")
    print("Backends:", stdout.read().decode())
    
    # Verificar qual compose está rodando
    stdin, stdout, stderr = ssh.exec_command("docker ps --format '{{.Names}} {{.Labels}}' | grep compose-generate")
    print("\n=== Containers com labels ===")
    print(stdout.read().decode())
    
    # Atualizar variáveis de ambiente
    print("\n=== Atualizando variáveis ===")
    stdin, stdout, stderr = ssh.exec_command("docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep SAFEPAY")
    print("SAFEPAY vars:", stdout.read().decode())
    
    # Encontrar o diretório do compose
    stdin, stdout, stderr = ssh.exec_command("docker inspect compose-generate-auxiliary-application-i6hn29-backend-1 --format '{{index .Mounts}}' | grep -i env")
    print("\n=== Mounts ===")
    print(stdout.read().decode())
    
    ssh.close()
    print("\n=== Done! ===")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
