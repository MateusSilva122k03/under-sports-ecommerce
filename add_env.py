#!/usr/bin/env python3
import pexpect

HOST = '178.18.251.129'
USER = 'root'
PASSWORD = 'NontonOrangeMantap122k03'

# Credenciais do SafeFyPay (do arquivo .env local)
SAFEPAY_PUBLIC_KEY = 'pk_production_c8a91228e526453237d8cb0bd4d470044084a1786d2fbb9f'
SAFEPAY_SECRET_KEY = 'sk_production_e36cc2ffba6f8d9ec825eaaca0ad0227205ba26da5a03ab2981ef5527e53060a'

cmd = f'ssh {USER}@{HOST}'
child = pexpect.spawn(cmd, timeout=30)
child.expect('password:')
child.sendline(PASSWORD)
child.expect([r'#', r'\$'])

# Adicionar variáveis de ambiente ao container
print("=== Adicionando variáveis de ambiente ===")
child.sendline(f'docker exec -e SAFEPAY_PUBLIC_KEY={SAFEPAY_PUBLIC_KEY} -e SAFEPAY_SECRET_KEY={SAFEPAY_SECRET_KEY} compose-generate-auxiliary-application-i6hn29-backend-1 env')
child.expect(pexpect.TIMEOUT, timeout=10)
print(child.before.decode('utf-8'))

# Agora testar a API Pix com um curl
print("\n=== Testando API Pix ===")
child.sendline('docker exec -e SAFEPAY_PUBLIC_KEY={} -e SAFEPAY_SECRET_KEY={} compose-generate-auxiliary-application-i6hn29-backend-1 curl -X POST http://localhost:3001/api/pix/create -H "Content-Type: application/json" -d \'{{"amount":100,"description":"Teste"}}\''.format(SAFEPAY_PUBLIC_KEY, SAFEPAY_SECRET_KEY))
child.expect(pexpect.TIMEOUT, timeout=15)
print(child.before.decode('utf-8'))

child.sendline('exit')
child.close()
