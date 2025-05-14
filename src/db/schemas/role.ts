import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const rolesTable = sqliteTable("roles", {
    id: text().primaryKey().notNull(),
    guildId: text().notNull(),
    level: int().notNull(),
});

export type roleType = typeof rolesTable.$inferSelect;
