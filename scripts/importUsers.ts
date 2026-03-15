import { drizzle } from "drizzle-orm/libsql/node";
import { eq } from "drizzle-orm/sql/expressions";

import * as schema from "../src/db/schema.ts";
import users from "./users.json" with { type: "json" };

const db = drizzle({ connection: `${Deno.env.get("DB_FILE")}`, schema });
for (const user of users.data) {
    const dbUser = await db.query.usersTable.findFirst({
        where: eq(schema.usersTable.id, user.id),
    });

    if (dbUser) continue;

    await db.insert(schema.usersTable).values({
        id: user.id,
        exp: user.exp,
    });

    console.log(`inserted ${user.username} (${user.id}) with exp ${user.exp}`);
}
