import {
    integer,
    primaryKey,
    sqliteTable,
    text,
} from "drizzle-orm/sqlite-core";
import { usersTable } from "../schema.ts";

export const reactionTable = sqliteTable("reaction", {
    from: text().references(() => usersTable.id).notNull(),
    to: text().references(() => usersTable.id).notNull(),
    emoji: text().notNull(),
    count: integer().notNull().default(0),
}, (table) => [
    primaryKey({ columns: [table.from, table.to, table.emoji] }),
]);

export type reactionType = typeof reactionTable.$inferSelect;
