import { Client } from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v10";
import fg from "fast-glob";
import process from "node:process";
import { drizzle } from "drizzle-orm/libsql/node";
import { Font } from "canvacord";

import config from "../config.ts";
import logger from "../util/logger.ts";
import { EventKey, IEvent } from "./Event.ts";
import { ICommand } from "./Command.ts";
import MikiEmbeds from "../generators/EmbedGenerator.ts";
import { usersTable } from "../db/schema.ts";
import * as schema from "../db/schema.ts";
import { loadImage } from "canvacord";

class Miki extends Client {
    public config = config;
    public logger = logger;
    public embeds = new MikiEmbeds(this);

    public commands = new Map<string, ICommand>();
    public expCooldown = new Map<string, number>();
    public images = new Map<string, string>();

    public db = drizzle({ connection: `${Deno.env.get("DB_FILE")}`, schema });

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.MessageContent,
            ],
            allowedMentions: { repliedUser: false },
        });
    }

    async start(): Promise<void> {
        await this.loadEvents();
        await this.loadCommands();
        await this.loadFonts();
        await this.loadImages();

        const users = await this.db.select().from(usersTable);
        this.logger.log(`Loaded ${users.length} users in database.`);

        this.login(Deno.env.get("TOKEN"));
    }

    async loadEvents(): Promise<void> {
        const files: string[] = fg.sync("src/events/*.ts");
        this.logger.log(`Loading ${files.length} events.`);

        for (const file of files) {
            const event: IEvent<EventKey> =
                (await import(`file://${process.cwd()}/${file}`)).default;

            this.on(event.eventName, (...args) => event.exec(this, ...args));
            this.logger.subLog(`   ↪ Loaded ${event.eventName}.`);
        }
    }

    async loadCommands(): Promise<void> {
        const files: string[] = fg.sync("src/commands/**/*.ts");
        this.logger.log(`Loading ${files.length} commands.`);

        for (const file of files) {
            const command: ICommand =
                (await import(`file://${process.cwd()}/${file}`)).default;

            this.commands.set(command.commandName, command);
            this.logger.subLog(`   ↪ Loaded ${command.commandName}.`);
        }
    }

    async loadFonts(): Promise<void> {
        const files: string[] = fg.sync("resources/font/*");
        this.logger.log(`Loading ${files.length} fonts.`);

        for (const file of files) {
            const [fileName] = file.split("/").slice(-1);

            await Font.fromFile(
                `${process.cwd()}/${file}`,
                `${fileName.split(".")[0]}`,
            );

            this.logger.subLog(`   ↪ Loaded ${fileName.split(".")[0]}.`);
        }
    }

    async loadImages() {
        const files: string[] = fg.sync("resources/image/*");
        this.logger.log(`Loading ${files.length} images.`);

        for (const file of files) {
            const [fileName] = file.split("/").slice(-1);
            const img = (await loadImage(
                `file://${process.cwd()}/${file}`,
            )).toDataURL();

            this.images.set(fileName.split(".")[0], img);

            this.logger.subLog(`   ↪ Loaded ${fileName.split(".")[0]}.`);
        }
    }
}

export default Miki;
