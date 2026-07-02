const { Client } = require('ssh2');

function tryLogin(username) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`Successfully connected with username: ${username}`);
      conn.exec('docker ps -a', (err, stream) => {
        if (err) return reject(err);
        stream.on('close', (code, signal) => {
          conn.end();
          resolve();
        }).on('data', (data) => {
          console.log(data.toString());
        }).stderr.on('data', (data) => {
          console.error(data.toString());
        });
      });
    }).on('error', (err) => {
      conn.end();
      reject(err);
    }).connect({
      host: '62.72.6.204',
      port: 22,
      username: username,
      password: '=W6pN@DVpS9z+yy9#EOm',
      readyTimeout: 10000
    });
  });
}

async function run() {
  const users = ['ubuntu', 'debian', 'admin', 'centos', 'ec2-user', 'bitnami', 'forge', 'PC'];
  for (const user of users) {
    try {
      console.log(`Trying ${user}...`);
      await tryLogin(user);
      return; // Success
    } catch (e) {
      console.log(`Failed with ${user}: ${e.message}`);
    }
  }
}

run();
