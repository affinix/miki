import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { rolesTable, usersTable } from "../schema.ts";

export const userRoleTable = sqliteTable("userRole", {
    id: text().references(() => usersTable.id).notNull(),
    role: text().references(() => rolesTable.id).notNull(),
});

export type userRoleType = typeof userRoleTable.$inferSelect;
