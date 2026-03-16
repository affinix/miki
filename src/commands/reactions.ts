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
    getMostReactionsRecieved,
    getMostReactionsSent,
    getMostUsedReactionsGlobal,
    getReactionMostRecievedBy,
    getReactionMostUsedBy,
    getUserMostReceivedFrom,
    getUserMostRecieved,
    getUserMostSent,
    getUserMostSentTo,
} from "../db/querys/reactionQuery.ts";
import { getRankText } from "../generators/RankCardBuilder.ts";
import { isValidUrl } from "../util/url.ts";
import Miki from "../struct/Miki.ts";

const PAGE_LENGTH = 6;

const ReactionsCommand: ICommand = {
    commandName: "reactions",
    category: CommandCategory.REACTIONS,
    desc: "Global reactions leaderboard.",
    longDesc:
        "Check what reactions are the most commonly used, as well as who reacts/is reacted to the most!\n" +
        "-# Use \`!reactions sent\` or \`!reactions received\` to view who has sent and received the most reactions!",
    admin: false,
    args: [{
        name: "operation",
        description: "One of the following:\n" +
            "        sent     : Ranks most sent.\n" +
            "        received : Ranks most received.",
        required: false,
        validate: (arg) => {
            if (!["sent", "received"].includes(arg)) {
                return `${arg} is not a valid operation!`;
            }

            return null;
        },
    }],

    exec: async (client, message, operation) => {
        if (operation == "sent") {
            const pagesNo = Math.ceil(
                (await getMostReactionsSent(client)).length / PAGE_LENGTH,
            );
            sendPaginatedMessage(client, message, pagesNo, generateSentPage);
            return;
        }

        if (operation == "received") {
            const pagesNo = Math.ceil(
                (await getMostReactionsRecieved(client)).length / PAGE_LENGTH,
            );
            sendPaginatedMessage(
                client,
                message,
                pagesNo,
                generateRecievedPage,
            );
            return;
        }

        const pagesNo = Math.ceil(
            (await getMostUsedReactionsGlobal(client)).length / PAGE_LENGTH,
        );
        sendPaginatedMessage(client, message, pagesNo, generatePage);
    },
};

const generatePage = async (
    client: Miki,
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
                `⠀⠀↪⠀**Most used:**⠀<@${mostUsed.userId}> (\`${mostUsed.count}\` times)\n` +
                    `⠀⠀↪⠀**Most recived:**⠀<@${mostRecieved.userId}> (\`${mostRecieved.count}\` times)\n`,
            );

        if (isValidUrl(entry.emoji)) {
            // custom emoji
            const reactionTitle = new TextDisplayBuilder()
                .setContent(
                    `## ${getRankText(i + 1)}⠀⌁⠀used ${entry.total} times\n`,
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
            `-# use \`!reactions sent\` or \`!reactions received\` to view user rankings!`,
        );
    displayPage
        .addSeparatorComponents(separator)
        .addTextDisplayComponents(footerText);

    return {
        flags: MessageFlags.IsComponentsV2,
        components: [displayPage],
    };
};

const generateSentPage = async (
    client: Miki,
    page: number,
): Promise<MessagePage> => {
    const displayPage: ContainerBuilder = generateBlankPage();

    const leaderboard = await getMostReactionsSent(client);
    for (
        let i = page * PAGE_LENGTH;
        i < (page + 1) * PAGE_LENGTH;
        i++
    ) {
        if (i >= leaderboard.length) break;

        const entry = leaderboard[i];
        const guildUser = await client.users.fetch(entry.userId);
        const reactionTitle = new TextDisplayBuilder()
            .setContent(
                `## ${getRankText(i + 1)}⠀⌁⠀<@${entry.userId}>\n`,
            );

        const mostSentTo = await getUserMostSentTo(client, entry.userId);
        const mostSent = (await getUserMostSent(client, entry.userId))[0];
        const emojiText = isValidUrl(mostSent.emoji)
            ? `[custom emoji](${mostSent.emoji})`
            : mostSent.emoji;
        const reactionInfo = new TextDisplayBuilder()
            .setContent(
                `⠀⠀↪⠀**${entry.total}** reactions sent\n` +
                    `⠀⠀↪⠀**Most sent to:** <@${mostSentTo.userId}> (${mostSentTo.total} times)⠀\n` +
                    `⠀⠀↪⠀**Most used:**⠀${emojiText}⠀(${mostSent.total} times)\n`,
            );

        const pfpThumb = new ThumbnailBuilder().setURL(
            guildUser.avatarURL() ?? "",
        );
        const infoContainer = new SectionBuilder()
            .addTextDisplayComponents(reactionTitle, reactionInfo)
            .setThumbnailAccessory(pfpThumb);

        displayPage.addSectionComponents(infoContainer);
    }

    const separator = new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large);
    const footerText = new TextDisplayBuilder()
        .setContent(
            `-# use \`!reactions sent\` or \`!reactions received\` to view user rankings!`,
        );
    displayPage
        .addSeparatorComponents(separator)
        .addTextDisplayComponents(footerText);

    return {
        flags: MessageFlags.IsComponentsV2,
        components: [displayPage],
    };
};

const generateRecievedPage = async (
    client: Miki,
    page: number,
): Promise<MessagePage> => {
    const displayPage: ContainerBuilder = generateBlankPage();

    const leaderboard = await getMostReactionsRecieved(client);
    for (
        let i = page * PAGE_LENGTH;
        i < (page + 1) * PAGE_LENGTH;
        i++
    ) {
        if (i >= leaderboard.length) break;

        const entry = leaderboard[i];
        const guildUser = await client.users.fetch(entry.userId);
        const reactionTitle = new TextDisplayBuilder()
            .setContent(
                `## ${getRankText(i + 1)}⠀⌁⠀<@${entry.userId}>\n`,
            );

        const mostReceivedFrom = await getUserMostReceivedFrom(
            client,
            entry.userId,
        );
        const mostReceived =
            (await getUserMostRecieved(client, entry.userId))[0];
        const emojiText = isValidUrl(mostReceived.emoji)
            ? `[custom emoji](${mostReceived.emoji})`
            : mostReceived.emoji;
        const reactionInfo = new TextDisplayBuilder()
            .setContent(
                `⠀⠀↪⠀**${entry.total}** reactions received\n` +
                    `⠀⠀↪⠀**Most from:**⠀<@${mostReceivedFrom.userId}> (${mostReceivedFrom.total} times)\n` +
                    `⠀⠀↪⠀**Most received:**⠀${emojiText}⠀(${mostReceived.total} times)\n`,
            );

        const pfpThumb = new ThumbnailBuilder().setURL(
            guildUser.avatarURL() ?? "",
        );
        const infoContainer = new SectionBuilder()
            .addTextDisplayComponents(reactionTitle, reactionInfo)
            .setThumbnailAccessory(pfpThumb);

        displayPage.addSectionComponents(infoContainer);
    }

    const separator = new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large);
    const footerText = new TextDisplayBuilder()
        .setContent(
            `-# use \`!reactions sent\` or \`!reactions received\` to view user rankings!`,
        );
    displayPage
        .addSeparatorComponents(separator)
        .addTextDisplayComponents(footerText);

    return {
        flags: MessageFlags.IsComponentsV2,
        components: [displayPage],
    };
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
