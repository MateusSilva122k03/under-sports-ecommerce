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

# Verificar variáveis de ambiente do backend
print("=== Verificando variáveis de ambiente do backend ===")
child.sendline('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep -E "SAFEPAY|CHECKIFY"')
child.expect(pexpect.TIMEOUT, timeout=10)
print(child.before.decode('utf-8'))

# Verificar logs do backend
print("\n=== Verificando logs do backend ===")
child.sendline('docker logs compose-generate-auxiliary-application-i6hn29-backend-1 --tail 20')
child.expect(pexpect.TIMEOUT, timeout=10)
print(child.before.decode('utf-8'))

child.sendline('exit')
child.close()
