import { int, sqliteTable } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
    id: int().primaryKey().notNull(),
    exp: int().notNull(),
});
