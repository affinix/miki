import { Events } from "discord.js";
import { IEvent } from "../struct/Event.ts";
import { commandUsage } from "../util/commandInfo.ts";
import Miki from "../struct/Miki.ts";
import { usersTable } from "../db/user.ts";
import { eq } from "drizzle-orm/sql/expressions";
import { createUser, findUser, updateExp } from "../db/querys.ts";

const ReadyEvent: IEvent<Events.MessageCreate> = {
    eventName: Events.MessageCreate,
    exec: async (client, message) => {
        if (message.author.bot || !message.guild) return;

        await giveExp(client, message.author.id);

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

const giveExp = async (client: Miki, userId: string): Promise<void> => {
    const cooldown = client.expCooldown.get(userId);
    if (!cooldown) {
        client.expCooldown.set(userId, Date.now() + client.config.expCooldown);
    } else {
        if (cooldown > Date.now()) return;
    }

    let user = await findUser(client, userId);
    if (!user) user = await createUser(client, userId);

    await updateExp(client, userId, user.exp + client.config.expGain);
    client.expCooldown.set(userId, Date.now() + client.config.expCooldown);
};

export default ReadyEvent;
