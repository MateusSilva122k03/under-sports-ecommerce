#!/usr/bin/env python3
import pexpect

HOST = '178.18.251.129'
USER = 'root'
PASSWORD = 'NontonOrangeMantap122k03'

# Credenciais SafeFyPay
SAFEPAY_PUBLIC_KEY = 'pk_production_c8a91228e526453237d8cb0bd4d470044084a1786d2fbb9f'
SAFEPAY_SECRET_KEY = 'sk_production_e36cc2ffba6f8d9ec825eaaca0ad0227205ba26da5a03ab2981ef5527e53060a'
CHECKIFY_API_KEY = 'ck_e0bc89b0d7bd7e7b03e403daf61530c3a5182be8b77714767356b8ae26006628'

cmd = f'ssh {USER}@{HOST}'
child = pexpect.spawn(cmd, timeout=30)
child.expect('password:')
child.sendline(PASSWORD)
child.expect([r'#', r'\$'])

# O Dokploy usa Docker Compose com variáveis de ambiente. Vou verificar como o container está configurado
print("=== Verificando label do container ===")
child.sendline('docker inspect compose-generate-auxiliary-application-i6hn29-backend-1 --format "{{json .Config.Labels}}"')
child.expect(pexpect.TIMEOUT, timeout=10)
print(child.before.decode('utf-8'))

# Vou verificar onde o dokploy armazena as configurações
print("\n=== Verificando docker-compose.yml do projeto ===")
child.sendline('docker inspect compose-generate-auxiliary-application-i6hn29-backend-1 --format "{{json .Config.Env}}"')
child.expect(pexpect.TIMEOUT, timeout=10)
print(child.before.decode('utf-8'))

child.sendline('exit')
child.close()
