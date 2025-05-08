import chalk from "chalk";
import IEvent from "../struct/Event.ts";

const ReadyEvent: IEvent = {
    eventName: "ready",
    exec: (client) => {
        const botName = chalk.bold.underline(
            `${client.user?.username}#${client.user?.discriminator}`,
        );

        client.logger.log(`Bot is currently logged in as ${botName}.`);
    },
};

export default ReadyEvent;
