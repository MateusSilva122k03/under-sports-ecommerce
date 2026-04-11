#!/usr/bin/env python3
import pexpect

HOST = '178.18.251.129'
USER = 'root'
PASSWORD = 'NontonOrangeMantap122k03'

cmd = f'ssh {USER}@{HOST}'
child = pexpect.spawn(cmd, timeout=30)
child.expect('password:')
child.sendline(PASSWORD)
child.expect([r'#', r'\$'])

# Forçar rebuild das imagens
print("=== Forçando rebuild das imagens ===")
child.sendline('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose down --rmi local')
child.expect(pexpect.TIMEOUT, timeout=60)
print(child.before.decode('utf-8'))

# Build e up com force rebuild
print("\n=== Fazendo build e up ===")
child.sendline('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose build --no-cache backend')
child.expect(pexpect.TIMEOUT, timeout=300)
print(child.before.decode('utf-8'))

# Subir os containers
print("\n=== Subindo containers ===")
child.sendline('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose up -d')
child.expect(pexpect.TIMEOUT, timeout=60)
print(child.before.decode('utf-8'))

# Verificar variáveis de ambiente
print("\n=== Verificando variáveis de ambiente ===")
child.sendline('sleep 5 && docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep -E "SAFEPAY|CHECKIFY"')
child.expect(pexpect.TIMEOUT, timeout=20)
print(child.before.decode('utf-8'))

child.sendline('exit')
child.close()
