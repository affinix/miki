import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
    id: text().primaryKey().notNull(),
    exp: int().notNull(),
    autoRole: int({ mode: "boolean" }).default(true).notNull(),
});

export type userType = typeof usersTable.$inferSelect;
