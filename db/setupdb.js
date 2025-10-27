const db = require('./index');
const {Pool} = require('pg');

const pool = new Pool({
    port: process.env.DATABASE_PORT,
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const createCycleTableQuery = `
  CREATE TABLE IF NOT EXISTS cycle (
    id SERIAL PRIMARY KEY NOT NULL,
    is_open BOOLEAN DEFAULT TRUE,
    drawn_numbers INTEGER[],
    creation_time TIMESTAMP DEFAULT NOW(),
    closed_time TIMESTAMP
  )
`;

const createTicketTableQuery = `
  CREATE TABLE IF NOT EXISTS ticket (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cycle_id INTEGER REFERENCES cycle(id) ON DELETE CASCADE,
    player_id VARCHAR(20) NOT NULL,
    chosen_numbers INTEGER[] NOT NULL,
    creation_time TIMESTAMP DEFAULT NOW()
  )
`;

const createTicketIndex = `
  CREATE INDEX IF NOT EXISTS idx_ticket_cycle ON ticket(id)
`;

async function createTables() {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await pool.query(createCycleTableQuery);
    await pool.query(createTicketTableQuery);
    await pool.query(createTicketIndex);
    console.log('Tables created or already exists.');
  } catch (error) {
    console.error('Failed to create tables:', error);
  }
}

createTables();

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


