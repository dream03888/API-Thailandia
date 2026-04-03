const { spawn } = require('child_process');
const url = require('url');

// --- ⚡ EASY CONFIGURATION ⚡ ---
// 1. YOUR RAILWAY DATABASE URL
// (Copy from Railway -> Postgres Service -> Variables -> DATABASE_URL)
const DATABASE_URL = 'postgresql://postgres:HbGnNMxDHtPSgjOaQmBlPdSyuExeNBlq@postgres.railway.internal:5432/railway';

// 2. YOUR LOCAL DB PASSWORD
const LOCAL_PG_PASS = 'postgres';
const LOCAL_DB_NAME = 'postgres';
// ----------------------------

const pgDumpPath = 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe';
const psqlPath = 'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe';

console.log('--- STARTING ULTIMATE MIGRATION V3 ---');

try {
  // Parse the Railway URL to extract details
  const myUrl = new url.URL(DATABASE_URL);
  const remotePass = myUrl.password;
  const remoteUser = myUrl.username;
  const remoteHost = myUrl.hostname;
  const remotePort = myUrl.port;
  const remoteDb = myUrl.pathname.substring(1);

  // 1. Setup pg_dump process (Local)
  const dump = spawn(pgDumpPath, [
    '-U', 'postgres',
    '-h', 'localhost',
    '-p', '5432',
    '-d', LOCAL_DB_NAME,
    '--no-owner',
    '--no-privileges',
    '--clean',
    '--if-exists'
  ], {
    env: { ...process.env, PGPASSWORD: LOCAL_PG_PASS }
  });

  // 2. Setup psql process (Railway)
  const restore = spawn(psqlPath, [
    '-h', remoteHost,
    '-p', remotePort,
    '-U', remoteUser,
    '-d', remoteDb
  ], {
    env: { ...process.env, PGPASSWORD: remotePass }
  });

  // 3. Pipe & Error Handling
  dump.stdout.on('error', (err) => { if (err.code !== 'EPIPE') console.error('[Dump Output Error]:', err.message); });
  restore.stdin.on('error', (err) => { if (err.code !== 'EPIPE') console.error('[Restore Input Error]:', err.message); });

  dump.stdout.pipe(restore.stdin);

  dump.stderr.on('data', (data) => console.error(`[Local DB]: ${data}`));
  restore.stderr.on('data', (data) => console.error(`[Railway DB]: ${data}`));

  restore.on('close', (code) => {
    console.log('\n--- PROCESS FINISHED ---');
    console.log('Please check your Railway Dashboard Tables now!');
  });

} catch (e) {
  console.error('ERROR: Could not parse DATABASE_URL. Make sure it starts with postgresql://');
}
