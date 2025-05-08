import chalk from "chalk";
import { IEvent } from "../struct/Event.ts";
import { Events } from "discord.js";

const ReadyEvent: IEvent<Events.ClientReady> = {
    eventName: Events.ClientReady,
    exec: (client) => {
        const botName = chalk.bold.underline(
            `${client.user?.username}#${client.user?.discriminator}`,
        );

        client.logger.log(`Bot is ready and logged in as ${botName}.`);
    },
};

export default ReadyEvent;
