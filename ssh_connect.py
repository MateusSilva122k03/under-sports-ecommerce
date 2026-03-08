#!/usr/bin/env python3
import sys
import time
import pexpect

# Configurações
HOST = '178.18.251.129'
USER = 'root'
PASSWORD = 'NontonOrangeMantap122k03'
PORT = 22

def ssh_connect():
    try:
        # Conectar via SSH
        print(f"Conectando a {USER}@{HOST}...")
        cmd = f'ssh {USER}@{HOST}'
        child = pexpect.spawn(cmd, timeout=30)
        
        # Espera pela senha
        child.expect('password:')
        child.sendline(PASSWORD)
        
        # Espera pelo prompt
        child.expect(['#', '\$', '~#'])
        print("Conectado com sucesso!")
        
        # Executar comando de teste
        child.sendline('echo "SSH funciona!"')
        child.expect('SSH funciona!')
        
        # Verificar containers Docker
        child.sendline('docker ps')
        child.expect(pexpect.TIMEOUT, timeout=5)
        print("Containers Docker:")
        print(child.before.decode('utf-8'))
        
        # Sair
        child.sendline('exit')
        child.close()
        
        return True
    except Exception as e:
        print(f"Erro: {e}")
        return False

if __name__ == "__main__":
    ssh_connect()
