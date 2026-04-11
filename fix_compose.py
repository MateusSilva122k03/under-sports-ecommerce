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

# Ver o docker-compose.yml atual
print("=== Verificando docker-compose.yml ===")
child.sendline('cat /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml')
child.expect(pexpect.TIMEOUT, timeout=10)
print(child.before.decode('utf-8'))

child.sendline('exit')
child.close()
