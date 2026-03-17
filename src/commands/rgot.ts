import {
    ContainerBuilder,
    MediaGalleryBuilder,
    SectionBuilder,
    SeparatorBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from "@discordjs/builders";
import {
    MessagePage,
    sendPaginatedMessage,
} from "../generators/paginatedMessage.ts";
import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";
import Miki from "../struct/Miki.ts";
import {
    getUserEmojiReceivedRank,
    getUserMostRecieved,
    getUserReactionMostReceivedFrom,
} from "../db/querys/reactionQuery.ts";
import { isValidUrl } from "../util/url.ts";
import { getRankText } from "../generators/RankCardBuilder.ts";
import { MessageFlags, SeparatorSpacingSize } from "discord-api-types/v10";
import config from "../config.ts";
import { MediaGalleryItemBuilder } from "discord.js";

const PAGE_LENGTH = 10;

const RGotCommand: ICommand = {
    commandName: "rgot",
    category: CommandCategory.REACTIONS,
    desc: "Ranks reaction emotes you've received.",
    longDesc:
        "Detailed information about how many times you've received each type of reaction.",
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

        const generateSentPage = async (
            client: Miki,
            page: number,
        ): Promise<MessagePage> => {
            const bannerItem = new MediaGalleryItemBuilder().setURL(
                "https://i.imgur.com/Xmmz0rC.png",
            );
            const banner = new MediaGalleryBuilder().addItems(
                bannerItem.toJSON(),
            );
            const title = new TextDisplayBuilder()
                .setContent(
                    `## ⠀⟢⠀<@${user.id}>'s most recieved reacts⠀⠀`,
                );
            const separator = new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large);

            const displayPage = new ContainerBuilder()
                .addMediaGalleryComponents(banner)
                .addTextDisplayComponents(title)
                .addSeparatorComponents(separator)
                .setAccentColor(config.primaryColor);

            const leaderboard = await getUserMostRecieved(client, user.id);
            for (
                let i = page * PAGE_LENGTH;
                i < (page + 1) * PAGE_LENGTH;
                i++
            ) {
                if (i >= leaderboard.length) break;

                const entry = leaderboard[i];
                const usageRank = await getUserEmojiReceivedRank(
                    client,
                    user.id,
                    entry.emoji,
                );
                const mostSentTo = (await getUserReactionMostReceivedFrom(
                    client,
                    user.id,
                    entry.emoji,
                ))[0];

                const reactionInfo = new TextDisplayBuilder()
                    .setContent(
                        `⠀⠀↪⠀**\`#${usageRank?.rank}\` recipient on the server**⠀\n` +
                            `⠀⠀↪⠀**Most received from:**⠀<@${mostSentTo.userId}> (${mostSentTo.total} times)\n**⠀**\n`,
                    );
                if (isValidUrl(entry.emoji)) {
                    // custom emoji
                    const reactionTitle = new TextDisplayBuilder()
                        .setContent(
                            `## ${
                                getRankText(i + 1)
                            }⠀⌁⠀Recieved ${entry.total} times\n`,
                        );

                    const pfpThumb = new ThumbnailBuilder().setURL(entry.emoji);
                    const infoContainer = new SectionBuilder()
                        .addTextDisplayComponents(reactionTitle, reactionInfo)
                        .setThumbnailAccessory(pfpThumb);

                    displayPage.addSectionComponents(infoContainer);
                } else {
                    const reactionTitle = new TextDisplayBuilder()
                        .setContent(
                            `## ${
                                getRankText(i + 1)
                            }⠀⌁⠀${entry.emoji}⠀:⠀Recieved ${entry.total} times\n`,
                        );

                    displayPage.addTextDisplayComponents(
                        reactionTitle,
                        reactionInfo,
                    );
                }
            }

            const footerText = new TextDisplayBuilder()
                .setContent(
                    `-# use \`!rgot [@user]\` to view info about other users!`,
                );
            displayPage
                .addSeparatorComponents(separator)
                .addTextDisplayComponents(footerText);

            return {
                flags: MessageFlags.IsComponentsV2,
                components: [displayPage],
            };
        };

        const pagesNo = Math.ceil(
            (await getUserMostRecieved(client, user.id)).length / PAGE_LENGTH,
        );
        sendPaginatedMessage(
            client,
            message,
            pagesNo,
            generateSentPage,
        );
    },
};

export default RGotCommand;
