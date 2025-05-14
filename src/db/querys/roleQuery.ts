import { roleType } from "../schema.ts";
import Miki from "../../struct/Miki.ts";
import { asc, desc, eq } from "drizzle-orm/sql/expressions";
import { rolesTable } from "../schemas/role.ts";

export const getRole = async (
    client: Miki,
    roleId: string,
): Promise<roleType | undefined> => {
    return await client.db.query.rolesTable.findFirst({
        where: eq(rolesTable.id, roleId),
    });
};

export const getGuildRoles = async (
    client: Miki,
    guildId: string,
): Promise<roleType[]> => {
    return await client.db.select()
        .from(rolesTable)
        .where(eq(rolesTable.guildId, guildId))
        .orderBy(asc(rolesTable.level), asc(rolesTable.id));
};

export const addRole = async (
    client: Miki,
    id: string,
    guildId: string,
    level: number,
): Promise<roleType> => {
    const [inserted] = await client.db.insert(rolesTable)
        .values({ id, guildId, level }).returning();

    return inserted;
};

export const deleteRole = async (client: Miki, id: string): Promise<void> => {
    await client.db.delete(rolesTable).where(eq(rolesTable.id, id));
};

export const updateRole = async (
    client: Miki,
    roleId: string,
    level: number,
): Promise<roleType> => {
    const [updated] = await client.db.update(rolesTable).set({ level }).where(
        eq(rolesTable.id, roleId),
    ).returning();

    return updated;
};
