import paramiko
import sys
import io

# Ensure stdout uses UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

host = "2.24.211.192"
user = "root"
password = "eozb+zs/oV;95ff9euF@)v"
command = sys.argv[1]

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=user, password=password)
    stdin, stdout, stderr = ssh.exec_command(command)
    print("STDOUT:")
    print(stdout.read().decode('utf-8', errors='replace'))
    print("STDERR:")
    print(stderr.read().decode('utf-8', errors='replace'))
finally:
    ssh.close()
