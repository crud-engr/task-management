/**
 * Creates the application database if it does not exist.
 * Connects to the default "postgres" database to run CREATE DATABASE.
 */

import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const backendRoot = path.resolve(__dirname, '../..');
const envPath = path.join(backendRoot, '.env');
const altEnvPath = path.join(process.cwd(), 'backend', '.env');
dotenv.config({ path: fs.existsSync(envPath) ? envPath : altEnvPath });

const dbName = process.env.DB_NAME || 'task_management';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';

async function main(): Promise<void> {
  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres',
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    if (res.rows.length > 0) {
      console.log(`Database "${dbName}" already exists.`);
      process.exit(0);
      return;
    }
    await client.query(`CREATE DATABASE ${pg.escapeIdentifier(dbName)}`);
    console.log(`Database "${dbName}" created.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create database:', (err as Error).message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
