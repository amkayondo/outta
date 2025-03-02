import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `wpm_${name}`);

export const words = createTable(
  "word",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    word: varchar("word", { length: 100 }).notNull(),
    repeated: integer("repeated").default(0).notNull(),
    views: integer("views").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    wordIndex: index("word_idx").on(table.word),
  })
);

