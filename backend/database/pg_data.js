const { Pool } = require('pg');
const config = require('./config');

(async () => {
  await config.ready;

  const host = await config.get('datadb.host', process.env.PG_HOST);
  const port = Number(await config.get('datadb.port', process.env.PG_PORT));
  const database = await config.get('datadb.name', process.env.PG_DB);
  const user = await config.get('datadb.writeableuser', process.env.PG_USER);
  const password = await config.get('datadb.writeableuser.password', process.env.PG_PASS);

  const pool = new Pool({
    host: host.val,
    port: port.val,
    database: database.val,
    user: user.val,
    password: password.val,
    max: 100,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 100000,
  });

  pool.on('error', (err, client) => {
    console.error('Postgres error occurred: ', err, client);
  });

  pool.query('SELECT NOW()')
  .then(() => { console.log('Successfully connected to the data database'); })
  .catch(err => {
    console.log('Failed to connect to the data database: ', err);
    process.exit(-1);
  });

  module.exports = pool;
})();
