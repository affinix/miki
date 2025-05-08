import { Events } from "discord.js";
import { IEvent } from "../struct/Event.ts";

const ReadyEvent: IEvent<Events.MessageCreate> = {
    eventName: Events.MessageCreate,
    exec: (client, message) => {
        if (message.author.bot || !message.guild) return;

        const prefix = client.config.prefix;
        const msg = message.content;
        if (!message.content.startsWith(prefix)) return;

        const args = msg.slice(prefix.length).trim().split(/ +/g).slice(1);
        const command = msg.split(/ +/g)[0].slice(prefix.length);

        const cmd = client.commands.get(command);
        if (!cmd) return;

        cmd.args.forEach((arg, i) => {
            if (!args[i] && !arg.required) return;
            if (!args[i] && arg.required) {
                return client.logger.log(
                    `Required argument ${arg.name} not provided.`,
                );
            }

            if (arg.validate(args[i])) {
                return client.logger.log(`Argument ${arg.name} is invalid.`);
            }
        });

        try {
            cmd.exec(client, message, ...args);
        } catch (e: unknown) {
            if (typeof e === "string") {
                client.logger.error(e);
            } else if (e instanceof Error) {
                client.logger.error(e.message);
            }
        }
    },
};

export default ReadyEvent;
