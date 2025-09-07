import { Pool } from "pg";

let pool;

if (!pool) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
}

export const db = pool;
