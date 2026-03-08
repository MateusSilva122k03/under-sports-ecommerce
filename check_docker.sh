#!/bin/bash
# Script to check Docker status on remote server

expect <<EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no root@178.18.251.129 "docker ps -a"
expect {
    "password:" {
        send "NontonOrangeMantap122k03\r"
        expect "~#"
        send "docker ps -a\r"
        expect "~#"
        send "exit\r"
        expect eof
    }
    timeout {
        puts "Connection timeout"
        exit 1
    }
    eof {
        puts "Connection closed"
    }
}
EOF

echo "=== Docker Containers ==="
echo "======================="
