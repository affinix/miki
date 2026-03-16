import {
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    SectionBuilder,
    SeparatorBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from "@discordjs/builders";
import { MessageFlags, SeparatorSpacingSize } from "discord-api-types/v10";

import {
    MessagePage,
    sendPaginatedMessage,
} from "../generators/paginatedMessage.ts";
import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";
import config from "../config.ts";
import {
    getMostUsedReactionsGlobal,
    getReactionMostRecievedBy,
    getReactionMostUsedBy,
} from "../db/querys/reactionQuery.ts";
import { getRankText } from "../generators/RankCardBuilder.ts";
import { isValidUrl } from "../util/url.ts";

const PAGE_LENGTH = 6;

const ReactionsCommand: ICommand = {
    commandName: "reactions",
    category: CommandCategory.REACTIONS,
    desc: "Global reactions leaderboard.",
    longDesc:
        "Check what reactions are the most commonly used, as well as who reacts/is reacted to the most!",
    admin: false,
    args: [],

    exec: async (client, message) => {
        const generatePage = async (
            page: number,
        ): Promise<MessagePage> => {
            const displayPage: ContainerBuilder = generateBlankPage();

            const leaderboard = await getMostUsedReactionsGlobal(client);
            for (
                let i = page * PAGE_LENGTH;
                i < (page + 1) * PAGE_LENGTH;
                i++
            ) {
                if (i >= leaderboard.length) break;

                const entry = leaderboard[i];

                const mostUsed = (await getReactionMostUsedBy(
                    client,
                    entry.emoji,
                ))[0];
                const mostRecieved = (await getReactionMostRecievedBy(
                    client,
                    entry.emoji,
                ))[0];
                const reactionInfo = new TextDisplayBuilder()
                    .setContent(
                        `⠀⠀↪⠀**Most used by:**⠀<@${mostUsed.userId}> (\`${mostUsed.count}\` times)\n` +
                            `⠀⠀↪⠀**Most used to:**⠀<@${mostRecieved.userId}> (\`${mostRecieved.count}\` times)\n`,
                    );

                if (isValidUrl(entry.emoji)) {
                    // custom emoji
                    const reactionTitle = new TextDisplayBuilder()
                        .setContent(
                            `## ${
                                getRankText(i + 1)
                            }⠀⌁⠀Used ${entry.total} times\n`,
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
                            }⠀⌁⠀${entry.emoji}⠀:⠀used ${entry.total} times\n`,
                        );

                    displayPage.addTextDisplayComponents(
                        reactionTitle,
                        reactionInfo,
                    );
                }
            }

            const separator = new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large);
            const footerText = new TextDisplayBuilder()
                .setContent(
                    `-# use \`!reactions from\` or \`!reactions to\` to view user rankings!`,
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
            (await getMostUsedReactionsGlobal(client)).length / PAGE_LENGTH,
        );
        sendPaginatedMessage(message, pagesNo, generatePage);
    },
};

const generateBlankPage = (): ContainerBuilder => {
    const bannerItem = new MediaGalleryItemBuilder().setURL(
        "https://i.imgur.com/Xmmz0rC.png",
    );
    const banner = new MediaGalleryBuilder().addItems(bannerItem.toJSON());
    const title = new TextDisplayBuilder()
        .setContent("## ⠀⟢⠀reacts@UTS leaderboard⠀⠀");
    const separator = new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large);

    return new ContainerBuilder()
        .addMediaGalleryComponents(banner)
        .addTextDisplayComponents(title)
        .addSeparatorComponents(separator)
        .setAccentColor(config.primaryColor);
};

export default ReactionsCommand;
