#!/usr/bin/expect -f
set timeout 60

spawn DOKPLOY_URL=https://dokploy.recarga8.shop DOKPLOY_AUTH_TOKEN=cline_orqNtKcsaHRAOWilbuOUfXOLczdOxsTCmploxAXDTNECJUtOMSppeMSEeJazSMFAWwT /usr/bin/npx @dokploy/cli@latest app create -p inBSrUB6Eex87FaWVnHXw -n frontend -d "Frontend Ecommerce" -y

expect "Enter the application name:"
send "frontend\r"

expect "Enter the application description (optional):"
send "Frontend Ecommerce Under Sports\r"

expect "Confirm?"
send "y\r"

expect eof
