import { readFile } from 'node:fs/promises';
import { createClient } from '@libsql/client';

// Explicit configuration prevents accidentally initializing a fallback database.
const url = process.env.TURSO_DATABASE_URL;
if (!url) throw new Error('Set TURSO_DATABASE_URL to your own empty database.');
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
try {
  const transaction = await client.transaction('write');
  try {
    const tables = await transaction.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
    );
    if (tables.rows.length) {
      throw new Error('Database is not empty. No tables or data have been changed.');
    }
    for (const migration of ['001_better_auth_tables.sql', '002_quiz_tables.sql']) {
      const sql = await readFile(new URL(`../migrations/${migration}`, import.meta.url), 'utf8');
      await transaction.executeMultiple(sql);
    }
    await transaction.commit();
    console.log('Created authentication and quiz tables. No users or demo data were added.');
  } finally {
    transaction.close();
  }
} finally {
  client.close();
}
