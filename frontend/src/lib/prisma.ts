import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';

interface UserProfileTable {
  id: string;
  userId: string;
  phone: string | null;
  strasse: string | null;
  nr: string | null;
  plz: string | null;
  stadt: string | null;
  land: string | null;
}

interface Database {
  user_profile: UserProfileTable;
}

const pool = createPool(process.env.DATABASE_URL!);

export const db = new Kysely<Database>({
  dialect: new MysqlDialect({ pool }),
});
