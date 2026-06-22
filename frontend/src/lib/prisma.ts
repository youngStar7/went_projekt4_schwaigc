import { Kysely } from 'kysely';
import { MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';

const pool = createPool(process.env.DATABASE_URL!);

export const db = new Kysely({
  dialect: new MysqlDialect({ pool }),
});
