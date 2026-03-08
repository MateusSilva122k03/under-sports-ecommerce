#!/usr/bin/env python3
import pexpect
import sys

HOST = '178.18.251.129'
USER = 'root'
PASSWORD = 'NontonOrangeMantap122k03'

cmd = f'ssh {USER}@{HOST}'
child = pexpect.spawn(cmd, timeout=30)
child.expect('password:')
child.sendline(PASSWORD)
child.expect([r'#', r'\$'])

# Verificar configuração do compose
print("=== Verificando docker compose config ===")
child.sendline('docker compose -f /home/dokploy/ecommerce/compose-generate-auxiliary-application-i6hn29/docker-compose.yml config 2>&1 | head -80')
child.expect(pexpect.TIMEOUT, timeout=10)
print(child.before.decode('utf-8'))

# Verificar se existe .env no servidor
print("\n=== Verificando arquivos .env ===")
child.sendline('ls -la /home/dokploy/ecommerce/')
child.expect(pexpect.TIMEOUT, timeout=5)
print(child.before.decode('utf-8'))

child.sendline('exit')
child.close()
