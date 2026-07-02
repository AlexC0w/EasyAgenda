import paramiko
import sys

host = "2.24.211.192"
user = "root"
password = "eozb+zs/oV;95ff9euF@)v"
local_file = sys.argv[1]
remote_file = sys.argv[2]

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=user, password=password)
    sftp = ssh.open_sftp()
    
    # Read locally as bytes and write remotely as bytes to preserve all encodings exactly
    with open(local_file, 'rb') as f:
        content = f.read()
        
    with sftp.file(remote_file, 'wb') as f:
        f.write(content)
        
    print(f"File {local_file} written to {remote_file} successfully.")
finally:
    ssh.close()
