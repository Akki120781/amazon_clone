const sqlite3 = require('sqlite3').verbose();
const { Pool, types } = require('pg');
// Force PG to return numeric/decimal columns as numbers instead of strings
types.setTypeParser(1700, (val) => parseFloat(val));
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_INTERNAL;
const host = process.env.DB_HOST || process.env.Hostname;
const dbName = process.env.DB_NAME || process.env.Database;
const dbUser = process.env.DB_USER || process.env.Username;
const dbPassword = process.env.DB_PASSWORD || process.env.Password;
const dbPort = process.env.DB_PORT || process.env.Port || 5432;

const usePostgres = !!(connectionString || (host && dbName));
let pgPool = null;
let sqliteDb = null;

if (usePostgres) {
  const sslConfig = (connectionString && connectionString.includes('render.com')) || 
                    (host && host.includes('render.com')) || 
                    process.env.NODE_ENV === 'production'
                      ? { rejectUnauthorized: false }
                      : false;

  const poolConfig = connectionString ? {
    connectionString,
    ssl: sslConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  } : {
    host,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPassword,
    ssl: sslConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  pgPool = new Pool(poolConfig);
  
  pgPool.on('connect', () => {
    console.log('✅ PostgreSQL Database connected successfully');
  });
  
  pgPool.on('error', (err) => {
    console.error('❌ Unexpected database error on PostgreSQL:', err);
  });
} else {
  // SQLite fallback
  const dbPath = path.resolve(__dirname, '../../database.sqlite');
  console.log(`ℹ️ No PG credentials provided. Falling back to SQLite at: ${dbPath}`);
  
  const dbExists = fs.existsSync(dbPath);
  
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ SQLite connection error:', err.message);
    } else {
      console.log('✅ SQLite Database connected successfully');
      // Enable foreign keys support
      sqliteDb.run('PRAGMA foreign_keys = ON;');
      
      // Always initialize schema if file did not exist, or run to ensure tables exist
      if (!dbExists) {
        initializeSQLiteSchema();
      }
    }
  });
}

function initializeSQLiteSchema() {
  const schemaPath = path.resolve(__dirname, '../../../database/schema_sqlite.sql');
  if (fs.existsSync(schemaPath)) {
    console.log('🌱 Migrating SQLite database schema...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    sqliteDb.exec(schemaSql, (err) => {
      if (err) {
        console.error('❌ Failed to run SQLite schema migration:', err.message);
      } else {
        console.log('✅ SQLite database schema migrated successfully');
      }
    });
  } else {
    console.warn(`⚠️ SQLite Schema file not found at ${schemaPath}`);
  }
}

// Unified query wrapper that behaves similarly for PG and SQLite
const query = (text, params = []) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    
    if (usePostgres) {
      pgPool.query(text, params, (err, res) => {
        const duration = Date.now() - start;
        if (err) {
          console.error('❌ PostgreSQL Query error:', { text, error: err.message });
          return reject(err);
        }
        resolve(res);
      });
    } else {
      // Map PG style placeholders ($1, $2, $3...) to SQLite positional placeholders (?1, ?2, ?3...)
      const sqliteText = text.replace(/\$(\d+)/g, '?$1');
      
      sqliteDb.all(sqliteText, params, function(err, rows) {
        const duration = Date.now() - start;
        if (err) {
          console.error('❌ SQLite Query error:', { text, sqliteText, params, error: err.message });
          return reject(err);
        }
        
        // SQLite's rowCount or rows
        const result = {
          rows: rows || [],
          rowCount: rows ? rows.length : 0
        };
        
        resolve(result);
      });
    }
  });
};

module.exports = {
  pool: usePostgres ? pgPool : {
    connect: async () => {
      return {
        query: (text, params) => query(text, params),
        release: () => {}
      };
    }
  },
  query,
  usePostgres
};
