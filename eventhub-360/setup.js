const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Base connection configuration
const connectionString = process.argv[2] || 'postgresql://postgres:yourpassword@127.0.0.1:5432/postgres';

async function setup() {
  console.log('Connecting to PostgreSQL to verify database...');
  
  // 1. Connect to default postgres DB
  const initialClient = new Client({ connectionString });
  await initialClient.connect();
  
  try {
    // Check if database exists
    const dbCheck = await initialClient.query("SELECT 1 FROM pg_database WHERE datname = 'eventhub360'");
    if (dbCheck.rowCount === 0) {
      console.log('Database "eventhub360" does not exist. Creating it...');
      await initialClient.query('CREATE DATABASE eventhub360');
      console.log('Database "eventhub360" created successfully!');
    } else {
      console.log('Database "eventhub360" already exists.');
    }
  } catch (err) {
    console.error('Error verifying database:', err.message);
  } finally {
    await initialClient.end();
  }

  // 2. Connect to the eventhub360 database to run DDL
  const targetConnectionString = connectionString.replace(/\/postgres(\?.*)?$/, '/eventhub360')
                                               .replace(/\/loginapp(\?.*)?$/, '/eventhub360');
  console.log(`Connecting to database "eventhub360" at ${targetConnectionString.replace(/:[^:@/]+@/, ':****@')}...`);
  
  const client = new Client({ connectionString: targetConnectionString });
  await client.connect();

  try {
    const ddlPath = path.join(__dirname, 'schema.sql');
    console.log(`Reading schema DDL from ${ddlPath}...`);
    const sql = fs.readFileSync(ddlPath, 'utf8');

    console.log('Resetting public schema to clear old tables...');
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    console.log('Applying DDL schema (creating tables, indexes, audit triggers)...');
    await client.query(sql);
    console.log('DDL applied successfully! All tables and triggers are ready.');
  } catch (err) {
    console.error('Error applying DDL schema:', err);
  } finally {
    await client.end();
  }
}

setup().catch(console.error);
