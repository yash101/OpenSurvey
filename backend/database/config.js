const pool = require('./pg_other');
const db = require('./pg_other');

class Configuration {
  constructor() {
    this.ready = (async () => {
      db.query(`
        CREATE TABLE IF NOT EXISTS "configuration" (
          name      TEXT    NOT NULL    PRIMARY KEY,
          val       TEXT,
          updated   TIMESTAMPTZ         NOT NULL      DEFAULT current_timestamp
        );
      `).catch(err => {
        console.error('Unable to create the configuration table in the aux database: ', err);
        process.exit(-1);
      });
    })();
  }

  async get(name, initial) {
    const query = await pool.query('SELECT * FROM "configuration" cfg WHERE cfg.name = $1;', [name]);

    if (query.rowCount < 1 && !initial) {
      return null;
    } else if(query.rowCount < 1) {
      await this.set(name, initial);
      return await this.get(name, null);
    }

    return query.rows[0];
  }

  async set(name, value) {
    await pool.query(`
      INSERT INTO "configuration" (name, val, updated)
        VALUES ($1, $2, NOW())
        ON CONFLICT (name) DO UPDATE
          SET val = $2, updated = NOW()
          WHERE "configuration".val <> $2
    `, [name, value || null]);
  }

  async getAll() {
    const query = await pool.query('SELECT * FROM "configuration";');
    let map = {};
    query.rows.forEach(item => {
      map[item.name] = item;
    });

    return map;
  }
}

module.exports = new Configuration();
