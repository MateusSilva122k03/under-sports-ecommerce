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

# Ver logs do backend
child.sendline('docker logs compose-generate-auxiliary-application-i6hn29-backend-1 --tail 50 2>&1')
child.expect(pexpect.TIMEOUT, timeout=8)
print("=== LOGS BACKEND ===")
print(child.before.decode('utf-8'))

# Ver vars de ambiente
child.sendline('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env')
child.expect(pexpect.TIMEOUT, timeout=8)
print("=== ENV VARS ===")
print(child.before.decode('utf-8'))

child.sendline('exit')
child.close()
