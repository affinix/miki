import { Client } from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v10";
import fg from "fast-glob";
import process from "node:process";
import { drizzle } from "drizzle-orm/libsql/node";

import config from "../config.ts";
import logger from "../util/logger.ts";
import { EventKey, IEvent } from "./Event.ts";
import { ICommand } from "./Command.ts";
import MikiEmbeds from "../util/MikiEmbeds.ts";
import { usersTable } from "../db/user.ts";
import * as schema from "../db/schema.ts";

class Miki extends Client {
    public config = config;
    public logger = logger;
    public embeds = new MikiEmbeds(this);

    public commands = new Map<string, ICommand>();
    public expCooldown = new Map<string, number>();

    public db = drizzle({ connection: `${Deno.env.get("DB_FILE")}`, schema });

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
            allowedMentions: { repliedUser: false },
        });
    }

    async start(): Promise<void> {
        this.loadEvents();
        this.loadCommands();

        const users = await this.db.select().from(usersTable);
        this.logger.log(`Loaded ${users.length} users in database.`);
        this.login(Deno.env.get("TOKEN"));
    }

    loadEvents(): void {
        const files: string[] = fg.sync("src/events/*.ts");
        this.logger.log(`Loading ${files.length} events.`);

        files.forEach(async (file) => {
            const event: IEvent<EventKey> =
                (await import(`file://${process.cwd()}/${file}`)).default;

            this.on(event.eventName, (...args) => event.exec(this, ...args));
        });
    }

    loadCommands(): void {
        const files: string[] = fg.sync("src/commands/**/*.ts");
        this.logger.log(`Loading ${files.length} commands.`);

        files.forEach(async (file) => {
            const command: ICommand =
                (await import(`file://${process.cwd()}/${file}`)).default;

            this.commands.set(command.commandName, command);
        });
    }
}

export default Miki;
