import { Events, GuildMember, Message } from "discord.js";
import { IEvent } from "../struct/Event.ts";
import { commandUsage } from "../util/commandInfo.ts";
import Miki from "../struct/Miki.ts";
import { createUser, findUser, updateExp } from "../db/querys.ts";
import type { roleType, userType } from "../db/schema.ts";
import {
    addUserRole,
    getGuildRoles,
    getUserRole,
    updateUserRole,
} from "../db/querys.ts";
import { getLevel } from "../util/level.ts";

const ReadyEvent: IEvent<Events.MessageCreate> = {
    eventName: Events.MessageCreate,
    exec: async (client, message) => {
        if (message.author.bot || !message.guild) return;

        let user = await findUser(client, message.author.id);
        if (!user) user = await createUser(client, message.author.id);

        await giveExp(client, user);
        if (user.autoRole) {
            await giveRole(client, message, user);
        }

        const prefix = client.config.prefix;
        const msg = message.content;
        if (!message.content.startsWith(prefix)) return;

        const args = msg.slice(prefix.length).trim().split(/ +/g).slice(1);
        const command = msg.split(/ +/g)[0].slice(prefix.length);

        const cmd = client.commands.get(command);
        if (!cmd) return;
        if (cmd.admin && !client.config.admins.includes(message.author.id)) {
            return;
        }

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

const giveExp = async (client: Miki, user: userType): Promise<void> => {
    const cooldown = client.expCooldown.get(user.id);
    if (!cooldown) {
        client.expCooldown.set(user.id, Date.now() + client.config.expCooldown);
    } else {
        if (cooldown > Date.now()) return;
    }

    await updateExp(client, user.id, user.exp + client.config.expGain);
    client.expCooldown.set(user.id, Date.now() + client.config.expCooldown);
};

const giveRole = async (
    client: Miki,
    message: Message,
    user: userType,
): Promise<void> => {
    if (!message.guildId) return;

    const roles = await getGuildRoles(client, message.guildId);
    const role = await getUserRole(client, user.id);
    const level = getLevel(user.exp);

    const highestRole = roles.findLast((r) => r.level <= level);
    if (!highestRole) return;

    if (role === undefined || role.id != highestRole.id) {
        if (role === undefined) {
            await addUserRole(client, user.id, highestRole.id);
        } else {
            await updateUserRole(client, user.id, highestRole.id);
        }

        const guildUser = message.member;
        if (!guildUser) return;

        await giveGuildUserRole(guildUser, highestRole.id, roles);
    }
};

export const giveGuildUserRole = async (
    member: GuildMember,
    roleId: string,
    roleList: roleType[],
): Promise<void> => {
    const memberRoles = member.roles.cache;
    memberRoles.forEach((role) => {
        if (!roleList.find((dbRole) => dbRole.id === role.id)) return;
        if (role.id != roleId) member.roles.remove(role.id);
    });

    if (!memberRoles.has(roleId)) {
        await member.roles.add(roleId);
    }
};

export default ReadyEvent;
