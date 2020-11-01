const db = require('./pg_other');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const tblready = (async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS "user" (
      id        BIGINT      GENERATED ALWAYS AS IDENTITY,
      fname     TEXT,
      lname     TEXT,
      email     TEXT,
      role      VARCHAR(32),
      password  TEXT,
      created   TIMESTAMPTZ NOT NULL DEFAULT current_timestamp
    );
  `);
})();

class User {
  constructor() {
    this.table_ready = tblready;
  }

  async get(id) {
    const query = await db.query('SELECT * FROM "user" WHERE id = $1;', [id]);
    if (query.rowCount === 0)
      return null;
    return query.rows[0];
  }

  async update(id, data) {
    if (!data) {
      return null;
    }

    const query = await db.query(`
      UPDATE "user"
        SET fname = $1, lname = $2, email = $3
        WHERE id = $5;
      SELECT * FROM "user" WHERE id = $5;
    `, [data.fname, data.lname, data.email, id]);

    if (query.rowCount > 0)
      return query.rows[0];
    
    return null;
  }

  async checkPassword(id, password) {
    const query = await db.query(`SELECT password FROM "user" WHERE id = $1`, [id]);
    if (query.rowCount < 1) {
      throw Error('Could not find user');
    }

    return bcrypt.compare(password, query.rows[0].password);
  }

  async authenticateEmail(email, password) {
    const query = await db.query('SELECT id, password FROM "user" WHERE email = $1;', [email]);
    if (query.rowCount < 1) {
      return null;
    }

    if (await bcrypt.compare(password, query.rows[0].password)) {
      return {
        id: query.rows[0].id,
        matches: true,
      };
    }

    return false;
  }

  async updatePassword(id, password) {
    const pw = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const query = await db.query(`
      UPDATE "user"
        SET password = $2
        WHERE id = $1
        returning *;
    `, [id, pw]);
    
    if (query.rowCount < 1) {
      throw Error('Failed to update password. User probably does not exist.');
    }

    return query.rows[0];
  }

  async newUser(data) {
    if (!data || !data.email || !data.password || !data.role)
      throw Error('Invalid request. Cannot create user.');

    // check if the user already exists by the email
    const emailCheck = await db.query('SELECT id FROM "user" WHERE email = $1;', [data.email]);
    if (emailCheck.rowCount > 0) {
      throw Error('email already in use');
    }
    const newUserQuery = await db.query(`
      INSERT INTO "user" (id, fname, lname, email, role)
        VALUES (DEFAULT, $1, $2, $3, $4)
        RETURNING id
    `, [data.fname || '', data.lname || '', data.email, data.role || 'admin']);
    await this.updatePassword(newUserQuery.rows[0].id, data.password);

    return newUserQuery.rows[0].id;
  }

  async findByEmail(email) {
    const query = await db.query('SELECT * FROM "user" WHERE email = $1', [email]);

    if (query.rowCount === 0)
      return null;

    return query.rows[0];
  }
}

module.exports = new User();
