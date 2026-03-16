import { sql } from "drizzle-orm";
import Miki from "../../struct/Miki.ts";
import { reactionTable, reactionType } from "../schemas/reaction.ts";
import { and, desc, eq } from "drizzle-orm/sql/expressions";

// export const createReaction = async (
//     client: Miki,
//     from: string,
//     to: string,
//     emoji: string,
// ): Promise<reactionType> => {
//     const [inserted] = await client.db.insert(reactionTable)
//         .values({ from, to, emoji }).returning();

//     return inserted;
// };

export const incrementReaction = async (
    client: Miki,
    from: string,
    to: string,
    emoji: string,
): Promise<reactionType> => {
    const [updated] = await client.db
        .insert(reactionTable)
        .values({ from, to, emoji, count: 1 })
        .onConflictDoUpdate({
            target: [
                reactionTable.from,
                reactionTable.to,
                reactionTable.emoji,
            ],
            set: {
                count: sql`${reactionTable.count} + 1`,
            },
        })
        .returning();

    return updated;
};

export const decrementReaction = async (
    client: Miki,
    from: string,
    to: string,
    emoji: string,
): Promise<reactionType> => {
    const [updated] = await client.db
        .update(reactionTable)
        .set({
            count: sql`max(${reactionTable.count} - 1, 0)`,
        })
        .where(
            and(
                eq(reactionTable.from, from),
                eq(reactionTable.to, to),
                eq(reactionTable.emoji, emoji),
            ),
        )
        .returning();

    await client.db
        .delete(reactionTable)
        .where(eq(reactionTable.count, 0));

    return updated;
};

export const getMostUsedReactionsGlobal = async (
    client: Miki,
): Promise<{ emoji: string; total: number }[]> => {
    const total = sql<number>`sum(${reactionTable.count})`;

    const result = await client.db
        .select({
            emoji: reactionTable.emoji,
            total,
        })
        .from(reactionTable)
        .groupBy(reactionTable.emoji)
        .orderBy(desc(total));

    return result;
};

export const getReactionMostUsedBy = async (
    client: Miki,
    emoji: string,
): Promise<{ userId: string; count: number }[]> => {
    const result = await client.db
        .select({
            userId: reactionTable.from,
            count: sql<number>`sum(${reactionTable.count})`,
        })
        .from(reactionTable)
        .where(eq(reactionTable.emoji, emoji))
        .groupBy(reactionTable.from)
        .orderBy(desc(sql`sum(${reactionTable.count})`));

    return result;
};

export const getReactionMostRecievedBy = async (
    client: Miki,
    emoji: string,
): Promise<{ userId: string; count: number }[]> => {
    const result = await client.db
        .select({
            userId: reactionTable.to,
            count: sql<number>`sum(${reactionTable.count})`,
        })
        .from(reactionTable)
        .where(eq(reactionTable.emoji, emoji))
        .groupBy(reactionTable.to)
        .orderBy(desc(sql`sum(${reactionTable.count})`));

    return result;
};

export const getMostReactionsSent = async (
    client: Miki,
): Promise<{ userId: string; total: number }[]> => {
    const result = await client.db
        .select({
            userId: reactionTable.from,
            total: sql<number>`sum(${reactionTable.count})`,
        })
        .from(reactionTable)
        .groupBy(reactionTable.from)
        .orderBy(desc(sql`sum(${reactionTable.count})`));

    return result;
};

export const getMostReactionsRecieved = async (
    client: Miki,
): Promise<{ userId: string; total: number }[]> => {
    const result = await client.db
        .select({
            userId: reactionTable.to,
            total: sql<number>`sum(${reactionTable.count})`,
        })
        .from(reactionTable)
        .groupBy(reactionTable.to)
        .orderBy(desc(sql`sum(${reactionTable.count})`))
        .limit(10);

    return result;
};

export const getUserMostSentTo = async (
    client: Miki,
    userId: string,
): Promise<{ userId: string; total: number }> => {
    const [result] = await client.db
        .select({
            userId: reactionTable.to,
            total: sql<number>`sum(${reactionTable.count})`,
        })
        .from(reactionTable)
        .where(eq(reactionTable.from, userId))
        .groupBy(reactionTable.to)
        .orderBy(desc(sql`sum(${reactionTable.count})`))
        .limit(1);

    return result;
};

export const getUserMostReceivedFrom = async (
    client: Miki,
    userId: string,
): Promise<{ userId: string; total: number }> => {
    const [result] = await client.db
        .select({
            userId: reactionTable.from,
            total: sql<number>`sum(${reactionTable.count})`,
        })
        .from(reactionTable)
        .where(eq(reactionTable.to, userId))
        .groupBy(reactionTable.from)
        .orderBy(desc(sql`sum(${reactionTable.count})`))
        .limit(1);

    return result;
};

export const getUserMostSent = async (
    client: Miki,
    userId: string,
): Promise<{ emoji: string; total: number }[]> => {
    const result = await client.db
        .select({
            emoji: reactionTable.emoji,
            total: sql<number>`sum(${reactionTable.count})`,
        })
        .from(reactionTable)
        .where(eq(reactionTable.from, userId))
        .groupBy(reactionTable.emoji)
        .orderBy(desc(sql`sum(${reactionTable.count})`))
        .limit(10);

    return result;
};

export const getUserMostRecieved = async (
    client: Miki,
    userId: string,
): Promise<{ emoji: string; total: number }[]> => {
    const result = await client.db
        .select({
            emoji: reactionTable.emoji,
            total: sql<number>`sum(${reactionTable.count})`,
        })
        .from(reactionTable)
        .where(eq(reactionTable.to, userId))
        .groupBy(reactionTable.emoji)
        .orderBy(desc(sql`sum(${reactionTable.count})`))
        .limit(10);

    return result;
};
