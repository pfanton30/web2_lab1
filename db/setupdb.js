const db = require('./index');

const createSessionTableQuery = `
  CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_session_expire 
  ON session (expire);
`;

async function createSessionTable() {
  try {
    await db.pool.query(createSessionTableQuery);
    console.log('Session table created or already exists.');
  } catch (error) {
    console.error('Failed to create session table:', error);
  }
}

createSessionTable();
