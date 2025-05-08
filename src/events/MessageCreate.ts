import { Events } from "discord.js";
import { IEvent } from "../struct/Event.ts";
import { commandUsage } from "../util/commandInfo.ts";

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

        for (const [i, arg] of cmd.args.entries()) {
            let errorMessage: string | null = null;

            if (!args[i] && !arg.required) continue;

            const validateError = arg.validate(args[i], client);
            if (validateError) {
                errorMessage =
                    `Argument \`${arg.name}\` is invalid: ${validateError}.`;
            }

            if (!args[i] && arg.required) {
                errorMessage =
                    `Required argument \`${arg.name}\` not provided.`;
            }

            if (errorMessage) {
                const embed = client.embeds.errorEmbed(errorMessage)
                    .addFields({ name: "Usage:", value: commandUsage(cmd) });

                return message.reply({ embeds: [embed] });
            }
        }

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
