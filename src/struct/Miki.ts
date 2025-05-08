import { Client } from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v10";
import fg from "fast-glob";
import process from "node:process";

import config from "../config.js";
import Logger from "../util/Logger.ts";
import { EventKey, IEvent } from "./Event.ts";
import { ICommand } from "./Command.ts";

class Miki extends Client {
    public config = config;
    public logger = new Logger();
    public commands = new Map<string, ICommand>();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
    }

    start(): void {
        this.loadEvents();
        this.loadCommands();

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
