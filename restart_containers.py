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

# Reiniciar os containers
print("=== Reiniciando containers ===")
child.sendline('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose down')
child.expect(pexpect.TIMEOUT, timeout=60)
print(child.before.decode('utf-8'))

child.sendline('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose up -d --build')
child.expect(pexpect.TIMEOUT, timeout=180)
print(child.before.decode('utf-8'))

# Verificar se os containers estão rodando
print("\n=== Verificando containers ===")
child.sendline('docker ps --filter "name=compose-generate"')
child.expect(pexpect.TIMEOUT, timeout=10)
print(child.before.decode('utf-8'))

# Verificar variáveis de ambiente do backend
print("\n=== Verificando variáveis de ambiente do backend ===")
child.sendline('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep -E "SAFEPAY|CHECKIFY"')
child.expect(pexpect.TIMEOUT, timeout=10)
print(child.before.decode('utf-8'))

child.sendline('exit')
child.close()

print("\n=== FIM - Containers reiniciados com sucesso! ===")
