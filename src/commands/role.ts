import {
    ActionRowBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextDisplayBuilder,
} from "@discordjs/builders";
import { MessageFlags } from "discord-api-types/v10";
import { Message, StringSelectMenuInteraction } from "discord.js";

import {
    findUser,
    getGuildRoles,
    getUserRole,
    setAutoRole,
} from "../db/querys.ts";
import { roleType, userType } from "../db/schema.ts";
import { getLevel } from "../util/level.ts";
import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";
import { happyKaomoji } from "../util/kaomoji.ts";
import { addUserRole, updateUserRole } from "../db/querys/userRoleQuery.ts";
import Miki from "../struct/Miki.ts";
import { giveGuildUserRole } from "../events/MessageCreate.ts";

enum RoleSelectTypes {
    ROLE = "ROLE",
    AUTO_ROLE = "AUTO_ROLE",
}

const RoleCommand: ICommand = {
    commandName: "role",
    category: CommandCategory.RANK,
    desc: "View & set your role.",
    longDesc:
        "List out your avaliable roles and allows you to set your role.\n" +
        "Avaliable roles are based on your level, with more roles unlocking as you reach higher levels.\n" +
        "Also allows you to configure if newly unlocked roles should be automatically assigned",
    admin: false,
    args: [],

    exec: async (client, message) => {
        const user = await findUser(client, message.author.id);
        if (!user) {
            return client.logger.log(
                `Could not find user ${message.author.id} in !role.`,
            );
        }

        const role = await getUserRole(client, message.author.id);
        const rolesList = (await getGuildRoles(client, message.guildId))
            .filter((r) => r.level <= getLevel(user?.exp));

        const roleSelect = new StringSelectMenuBuilder()
            .setCustomId(RoleSelectTypes.ROLE)
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder("Select your role.");

        for (const [_i, r] of rolesList.entries()) {
            const guildRole = await message.guild?.roles.fetch(r.id);
            if (!guildRole) {
                return client.logger.error(
                    `Could not find role ${r.id} when generating roles list.`,
                );
            }

            roleSelect.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Level ${r.level}⠀⌁⠀@${guildRole.name}`)
                    .setValue(r.id)
                    .setDefault(role != undefined && r.id === role.role),
            );
        }

        const autoRoleSelect = new StringSelectMenuBuilder()
            .setCustomId(RoleSelectTypes.AUTO_ROLE)
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder("Turn auto-role on or off")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Auto-role: On`)
                    .setValue("ON")
                    .setDefault(user.autoRole),
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Auto-role: Off`)
                    .setValue("OFF")
                    .setDefault(!user.autoRole),
            );

        const roleText = role ? `<@&${role.role}>` : "`no role`";

        const roleSelectRow = new ActionRowBuilder()
            .addComponents(roleSelect);
        const autoRoleRow = new ActionRowBuilder()
            .addComponents(autoRoleSelect);
        const titleText = new TextDisplayBuilder()
            .setContent(
                `# ⠀⟢⠀Your current role is: ${roleText}\n` +
                    "Select a new role below:",
            );
        const autoRoleText = new TextDisplayBuilder()
            .setContent(
                "Configure if you want newly unlocked roles to be automatically assigned:",
            );
        const seperator = new SeparatorBuilder().setDivider(false);

        const container = new ContainerBuilder()
            .setAccentColor(client.config.primaryColor);
        container.addTextDisplayComponents(titleText);
        container.addActionRowComponents(roleSelectRow);
        container.addSeparatorComponents(seperator);
        container.addTextDisplayComponents(autoRoleText);
        container.addActionRowComponents(autoRoleRow);

        const footer = new TextDisplayBuilder().setContent(
            `-# ${happyKaomoji()}⠀•⠀<t:${Math.floor(Date.now() / 1000)}:R>`,
        );

        const sentMsg = await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [container, footer],
        });

        const collector = sentMsg.createMessageComponentCollector({
            filter: (i: StringSelectMenuInteraction) => {
                const id = i.customId;
                return Object.values(RoleSelectTypes)
                    .includes(id as RoleSelectTypes) &&
                    i.user.id === message.author.id;
            },
            time: client.config.collectorTimeout,
        });

        collector.on("collect", async (i: StringSelectMenuInteraction) => {
            collector.resetTimer();
            const interactionValue = i.values.at(0) ?? "";
            if (i.customId === RoleSelectTypes.ROLE) {
                if (!role) {
                    await addUserRole(
                        client,
                        message.author.id,
                        interactionValue,
                    );
                } else {
                    await updateUserRole(
                        client,
                        message.author.id,
                        interactionValue,
                    );
                }

                const guildMember = message.member;
                if (!guildMember) return;
                await giveGuildUserRole(
                    guildMember,
                    interactionValue,
                    rolesList,
                );
                i.reply({
                    embeds: [
                        client.embeds.replyEmbed(
                            "Role updated!",
                            `Your role is now <@&${interactionValue}>`,
                        ),
                    ],
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await setAutoRole(
                    client,
                    message.author.id,
                    interactionValue === "ON",
                );

                i.reply({
                    embeds: [
                        client.embeds.replyEmbed(
                            "Auto-role updated!",
                            `Auto-role is now \`${interactionValue}\`!`,
                        ),
                    ],
                    flags: MessageFlags.Ephemeral,
                });
            }
        });

        collector.on("end", () => {
            const endMessage = new ContainerBuilder()
                .setAccentColor(client.config.primaryColor)
                .addTextDisplayComponents(titleText
                    .setContent(`# ⠀⟢⠀Your current role is: ${roleText}`));
            sentMsg.edit({
                flags: MessageFlags.IsComponentsV2,
                components: [endMessage, footer],
            });
        });
    },
};

const render = async (
    client: Miki,
    message: Message,
    user: userType,
    roleId: string | undefined,
    rolesList: roleType[],
): Promise<ContainerBuilder> => {
    const roleText = roleId ? `<@&${roleId}>` : "`no role`";

    const roleSelect = new StringSelectMenuBuilder()
        .setCustomId(RoleSelectTypes.ROLE)
        .setMinValues(1)
        .setMaxValues(1)
        .setPlaceholder("Select your role.");

    for (const [_i, r] of rolesList.entries()) {
        const guildRole = await message.guild?.roles.fetch(r.id);
        if (!guildRole) {
            client.logger.error(
                `Could not find role ${r.id} when generating roles list.`,
            );
            continue;
        }

        roleSelect.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(`Level ${r.level}⠀⌁⠀@${guildRole.name}`)
                .setValue(r.id)
                .setDefault(roleId != undefined && r.id === roleId),
        );
    }

    const autoRoleSelect = new StringSelectMenuBuilder()
        .setCustomId(RoleSelectTypes.AUTO_ROLE)
        .setMinValues(1)
        .setMaxValues(1)
        .setPlaceholder("Turn auto-role on or off")
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(`Auto-role: On`)
                .setValue("ON")
                .setDefault(user.autoRole),
            new StringSelectMenuOptionBuilder()
                .setLabel(`Auto-role: Off`)
                .setValue("OFF")
                .setDefault(!user.autoRole),
        );

    const roleSelectRow = new ActionRowBuilder()
        .addComponents(roleSelect);
    const autoRoleRow = new ActionRowBuilder()
        .addComponents(autoRoleSelect);
    const titleText = new TextDisplayBuilder()
        .setContent(
            `# ⠀⟢⠀Your current role is: ${roleText}\n` +
                "Select a new role below:",
        );
    const autoRoleText = new TextDisplayBuilder()
        .setContent(
            "Configure if you want newly unlocked roles to be automatically assigned:",
        );
    const seperator = new SeparatorBuilder().setDivider(false);

    const container = new ContainerBuilder()
        .setAccentColor(client.config.primaryColor);

    container.addTextDisplayComponents(titleText);
    container.addActionRowComponents(roleSelectRow);
    container.addSeparatorComponents(seperator);
    container.addTextDisplayComponents(autoRoleText);
    container.addActionRowComponents(autoRoleRow);

    return container;
};

export default RoleCommand;
