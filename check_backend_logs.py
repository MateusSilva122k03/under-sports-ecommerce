#!/usr/bin/env python3
import pexpect

# Configurações
HOST = '178.18.251.129'
USER = 'root'
PASSWORD = 'NontonOrangeMantap122k03'

def check_logs():
    try:
        print("Conectando ao servidor...")
        cmd = f'ssh {USER}@{HOST}'
        child = pexpect.spawn(cmd, timeout=30)
        
        child.expect('password:')
        child.sendline(PASSWORD)
        child.expect(['#', '\$', '~#'])
        
        # Ver logs do backend mais recente
        print("\n=== Verificando logs do backend (compose-generate-auxiliary-application-i6hn29) ===")
        child.sendline('docker logs compose-generate-auxiliary-application-i6hn29-backend-1 --tail 100 2>&1')
        child.expect(pexpect.TIMEOUT, timeout=10)
        print(child.before.decode('utf-8'))
        
        # Verificar variáveis de ambiente do backend
        print("\n=== Verificando variáveis de ambiente do backend ===")
        child.sendline('docker exec compose-generate-auxiliary-application-i6hn29-backend-1 env | grep -i pix')
        child.expect(pexpect.TIMEOUT, timeout=10)
        print(child.before.decode('utf-8'))
        
        # Verificar também o container code-backend
        print("\n=== Verificando logs do backend (code-backend) ===")
        child.sendline('docker logs code-backend-1 --tail 50 2>&1')
        child.expect(pexpect.TIMEOUT, timeout=10)
        print(child.before.decode('utf-8'))
        
        child.sendline('exit')
        child.close()
        
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    check_logs()
