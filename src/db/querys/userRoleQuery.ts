import { eq } from "drizzle-orm/sql/expressions";
import Miki from "../../struct/Miki.ts";
import { userRoleTable, userRoleType } from "../schemas/userRole.ts";

export const getUserRole = async (
    client: Miki,
    userId: string,
): Promise<userRoleType | undefined> => {
    return await client.db.query.userRoleTable.findFirst({
        where: eq(userRoleTable.id, userId),
    });
};

export const addUserRole = async (
    client: Miki,
    userId: string,
    roleId: string,
): Promise<userRoleType> => {
    const [inserted] = await client.db.insert(userRoleTable).values({
        id: userId,
        role: roleId,
    }).returning();

    return inserted;
};

export const updateUserRole = async (
    client: Miki,
    userId: string,
    roleId: string,
): Promise<userRoleType> => {
    const [updated] = await client.db.update(userRoleTable)
        .set({ role: roleId })
        .where(eq(userRoleTable.id, userId))
        .returning();

    return updated;
};
