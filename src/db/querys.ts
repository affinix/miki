import Miki from "../struct/Miki.ts";
import { eq } from "drizzle-orm/sql/expressions";
import { usersTable, userType } from "./schema.ts";

type findUserReturn = Promise<userType | undefined>;
export const findUser = async (
    client: Miki,
    userId: string,
): findUserReturn => {
    return await client.db.query.usersTable.findFirst({
        where: eq(usersTable.id, userId),
    });
};

export const createUser = async (
    client: Miki,
    userId: string,
): Promise<userType> => {
    const [inserted] = await client.db.insert(usersTable).values({
        id: userId,
        exp: 0,
    }).returning();

    return inserted;
};

export const updateExp = async (
    client: Miki,
    userId: string,
    exp: number,
): Promise<void> => {
    await client.db.update(usersTable).set({ exp }).where(
        eq(usersTable.id, userId),
    );
};
