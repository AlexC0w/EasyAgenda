import { spawnSync } from 'child_process';

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf-8' });
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  return result;
}

function runOrThrow(command, args) {
  const result = run(command, args);
  if (result.error) {
    throw result.error;
  }
  return result;
}

function main() {
  const migrate = run('npx', ['prisma', 'migrate', 'deploy']);

  if (migrate.status !== 0) {
    const stderr = migrate.stderr ?? '';
    const message = typeof stderr === 'string' ? stderr : '';
    const alreadyExists = message.includes('P3018') && message.includes('already exists');

    if (alreadyExists) {
      console.log('\nDetected existing tables; running `prisma db push` to align schema...');
      const push = run('npx', ['prisma', 'db', 'push']);
      if (push.status !== 0) {
        process.exit(push.status ?? 1);
      }
    } else {
      process.exit(migrate.status ?? 1);
    }
  }

  const generate = runOrThrow('npx', ['prisma', 'generate']);
  if (generate.status !== 0) {
    process.exit(generate.status ?? 1);
  }
}

main();
