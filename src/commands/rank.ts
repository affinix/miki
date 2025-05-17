import dayjs from "dayjs";
import { findUser } from "../db/querys.ts";
import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";
import { getLevelInfo } from "../util/level.ts";
import RankCardBuilder from "../generators/RankCardBuilder.ts";
import { MessageFlags } from "discord-api-types/v10";
import { AttachmentBuilder } from "discord.js";
import { MediaGalleryBuilder, TextDisplayBuilder } from "@discordjs/builders";
import { countUsers } from "../db/querys/userQuery.ts";
import { getLeaderboard } from "../db/querys/userQuery.ts";

const RankCommand: ICommand = {
    commandName: "rank",
    category: CommandCategory.RANK,
    desc: "Check your exp & level.",
    longDesc:
        "Displays your current exp and level, or the exp and level of the person you mention.",
    admin: false,
    args: [{
        name: "user",
        description: "Mention of the user you want to check!",
        required: false,
        validate: (arg) => {
            if (!arg.match(/<@!*&*[0-9]+>/g)) {
                return `${arg} is not a valid mention!`;
            }

            return null;
        },
    }],

    exec: async (client, message, userMention) => {
        if ("sendTyping" in message.channel) message.channel.sendTyping();

        let user = message.member;

        const mentionedUser = message.mentions.members?.first();
        if (userMention && mentionedUser) {
            user = mentionedUser;
        }

        if (!user) {
            const embed = client.embeds.errorEmbed(
                `Could not find ${message.author.tag}'s exp!`,
            );

            return message.reply({ embeds: [embed] });
        }

        const userData = await findUser(client, user.id);
        if (!userData) {
            const embed = client.embeds.errorEmbed(
                `Could not find ${userMention}'s exp!`,
            );
            return message.reply({ embeds: [embed] });
        }

        const cooldown = client.expCooldown.get(user.id);
        if (!cooldown) {
            return client.logger.error(
                `Could not find cooldown for ${user.id} for !rank`,
            );
        }

        const { level, levelUpExp } = getLevelInfo(userData.exp);
        const cdFormatted = dayjs(cooldown - Date.now()).format("mm[m] ss[s]");
        const timestamp = `<t:${Math.floor(Date.now() / 1000)}:R>`;
        const displayName = user.displayName.length > 13
            ? user.displayName.slice(0, 13) + "..."
            : user.displayName;
        const userCount = await countUsers(client);
        const leaderboard = await getLeaderboard(client, 0, userCount);

        const card = new RankCardBuilder({
            client,
            level,
            exp: userData.exp,
            rankUpExp: levelUpExp,
            rank: leaderboard.findIndex((user) => user.id === userData.id) + 1,
            name: displayName,
            pfpURL: user.displayAvatarURL({
                extension: "png",
                forceStatic: true,
            }),
            memberSince: user.joinedAt ?? new Date(),
        });

        const image = await card.build({ format: "png", debug: false });

        const attachment = new AttachmentBuilder(image, {
            name: `${user.id}-rank.png`,
        });
        const file = new MediaGalleryBuilder({
            items: [
                {
                    media: {
                        url: `attachment://${user.id}-rank.png`,
                    },
                },
            ],
        });
        const text = new TextDisplayBuilder().setContent(
            `-# Cooldown for EXP gain: ${cdFormatted}⠀•⠀${timestamp}`,
        );

        message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [file, text],
            files: [attachment],
        });
    },
};

export default RankCommand;
