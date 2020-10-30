const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  max: 100,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 100000,
});

pool.on('error', (err, client) => {
  console.error('Postgres error occurred: ', err, client);
});

(async () => {
  pool.query('SELECT NOW()')
  .then(() => { console.log('Successfully connected to the general database'); })
  .catch(err => {
    console.log('Failed to connect to the general database: ', err);
    process.exit(-1);
  });
})();

module.exports = pool;
