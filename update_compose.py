#!/usr/bin/env python3
import pexpect

HOST = '178.18.251.129'
USER = 'root'
PASSWORD = 'NontonOrangeMantap122k03'

# Novo docker-compose.yml com as variáveis de ambiente
new_compose = '''version: "3.8"
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    depends_on:
      - backend
    restart: unless-stopped
    environment:
      - VITE_API_URL=/api
    labels:
      - traefik.docker.network=dokploy-network
      - traefik.http.routers.compose-generate-auxiliary-application-i6hn29-17-web.rule=Host(`undersports.shop`)
      - traefik.http.routers.compose-generate-auxiliary-application-i6hn29-17-web.entrypoints=web
      - traefik.http.services.compose-generate-auxiliary-application-i6hn29-17-web.loadbalancer.server.port=80
      - traefik.http.routers.compose-generate-auxiliary-application-i6hn29-17-web.service=compose-generate-auxiliary-application-i6hn29-17-web
      - traefik.http.routers.compose-generate-auxiliary-application-i6hn29-17-web.middlewares=redirect-to-https@file
      - traefik.http.routers.compose-generate-auxiliary-application-i6hn29-17-websecure.rule=Host(`undersports.shop`)
      - traefik.http.routers.compose-generate-auxiliary-application-i6hn29-17-websecure.entrypoints=websecure
      - traefik.http.services.compose-generate-auxiliary-application-i6hn29-17-websecure.loadbalancer.server.port=80
      - traefik.http.routers.compose-generate-auxiliary-application-i6hn29-17-websecure.service=compose-generate-auxiliary-application-i6hn29-17-websecure
      - traefik.http.routers.compose-generate-auxiliary-application-i6hn29-17-websecure.tls.certresolver=letsencrypt
      - traefik.enable=true
      - traefik.http.routers.frontend.rule=HostRegexp(`{host:.+}`)
      - traefik.http.services.frontend.loadbalancer.server.port=80
    networks:
      - dokploy-network
      - default
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    restart: unless-stopped
    environment:
      - SAFEPAY_PUBLIC_KEY=pk_production_c8a91228e526453237d8cb0bd4d470044084a1786d2fbb9f
      - SAFEPAY_SECRET_KEY=sk_production_e36cc2ffba6f8d9ec825eaaca0ad0227205ba26da5a03ab2981ef5527e53060a
      - CHECKIFY_API_KEY=ck_e0bc89b0d7bd7e7b03e403daf61530c3a5182be8b77714767356b8ae26006628
    networks:
      - dokploy-network
networks:
  dokploy-network:
    external: true
'''

# Escrever o novo arquivo docker-compose.yml
COMPOSE_FILE = '/etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code/docker-compose.yml'

cmd = f'ssh {USER}@{HOST}'
child = pexpect.spawn(cmd, timeout=30)
child.expect('password:')
child.sendline(PASSWORD)
child.expect([r'#', r'\$'])

# Criar o novo arquivo docker-compose.yml
print("=== Escrevendo novo docker-compose.yml ===")
child.sendline(f'cat > {COMPOSE_FILE} << \'EOFHeredoc\'\n{new_compose}EOFHeredoc')
child.expect(pexpect.TIMEOUT, timeout=10)
print(child.before.decode('utf-8'))

# Verificar o arquivo
print("\n=== Verificando arquivo ===")
child.sendline(f'cat {COMPOSE_FILE}')
child.expect(pexpect.TIMEOUT, timeout=10)
print(child.before.decode('utf-8'))

# Reiniciar os containers
print("\n=== Reiniciando containers ===")
child.sendline('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose down')
child.expect(pexpect.TIMEOUT, timeout=30)
print(child.before.decode('utf-8'))

child.sendline('cd /etc/dokploy/compose/compose-generate-auxiliary-application-i6hn29/code && docker compose up -d')
child.expect(pexpect.TIMEOUT, timeout=60)
print(child.before.decode('utf-8'))

child.sendline('exit')
child.close()

print("\n=== FIM ===")
print("Containers reiniciados com as variáveis de ambiente do SafeFyPay!")
