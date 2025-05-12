import { eq } from "drizzle-orm/sql/expressions";
import { desc } from "drizzle-orm/sql/expressions/select";
import Miki from "../struct/Miki.ts";
import { usersTable, userType } from "./schema.ts";
import { asc } from "drizzle-orm";
import { count } from "drizzle-orm/sql/functions/aggregate";

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

// Page is indexed from 0
export const getLeaderboard = async (
    client: Miki,
    page: number,
    pageSize: number = 10,
): Promise<userType[]> => {
    return await client.db.select().from(usersTable)
        .orderBy(desc(usersTable.exp), asc(usersTable.id))
        .limit(pageSize)
        .offset(page * pageSize);
};

export const countUsers = async (client: Miki): Promise<number> => {
    const [userCount] = await client.db
        .select({ count: count() })
        .from(usersTable);

    return userCount.count;
};
