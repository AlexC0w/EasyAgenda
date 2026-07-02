const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec('docker ps -a', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
      process.exit(0);
    }).on('data', (data) => {
      console.log(data.toString());
    }).stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
}).on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  console.log('keyboard-interactive prompt received');
  finish(['=W6pN@DVpS9z+yy9#EOm']);
}).on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
}).connect({
  host: '62.72.6.204',
  port: 22,
  username: 'root',
  password: '=W6pN@DVpS9z+yy9#EOm',
  tryKeyboard: true,
  readyTimeout: 10000
});
